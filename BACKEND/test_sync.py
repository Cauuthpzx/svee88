"""Full 30-day sync test for agent 112233.

Calls upstream API directly (with PHPSESSID cookie) and posts to local backend.
Truncates tables via psycopg2, verifies data integrity.

Usage: python test_sync.py
"""

import asyncio
import json
import math
import random
import time
from datetime import datetime, timedelta
from urllib.parse import urlencode

import httpx
import asyncpg

# --- Config ---

UPSTREAM_BASE = "https://a2u4k.ee88dly.com"
UPSTREAM_COOKIE = "PHPSESSID=445mk2bsqm46u0efnk7e5t770o; think_var=vi-vn"
BACKEND_BASE = "http://localhost:8000"
DB_DSN = "postgresql://postgres:hiepmun2021@localhost:5432/postgres_fastapi"

AGENT_ID = 1
BATCH_SIZE = 5000
PAGE_SIZE = 50
DAYS = 30

# --- Date helpers ---

def today_str():
    return datetime.now().strftime("%Y-%m-%d")

def days_ago(n):
    return (datetime.now() - timedelta(days=n)).strftime("%Y-%m-%d")

def fmt_date(d):
    return d.strftime("%Y-%m-%d")

# --- Sensitive fields ---

SENSITIVE = {"password", "fund_password", "salt"}

def strip_sensitive(records):
    return [{k: v for k, v in r.items() if k not in SENSITIVE} for r in records]


# --- HTTP clients ---

def create_upstream_client():
    return httpx.AsyncClient(
        base_url=UPSTREAM_BASE,
        timeout=60.0,
        headers={
            "Cookie": UPSTREAM_COOKIE,
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36",
            "Referer": UPSTREAM_BASE + "/agent/user.html",
            "Origin": UPSTREAM_BASE,
        },
        verify=True,
    )

def create_backend_client():
    return httpx.AsyncClient(
        base_url=BACKEND_BASE,
        timeout=120.0,
        headers={"Content-Type": "application/json"},
    )


# --- Upstream API calls ---

async def post_form(client, url, data):
    """POST form-urlencoded to upstream, return parsed JSON."""
    filtered = {k: v for k, v in data.items() if v is not None and v != ""}
    resp = await client.post(url, data=filtered, headers={"Content-Type": "application/x-www-form-urlencoded"})
    resp.raise_for_status()
    return resp.json()


async def post_json(client, url, data):
    """POST JSON to upstream."""
    resp = await client.post(url, json=data)
    resp.raise_for_status()
    return resp.json()


# --- Fetch all pages ---

async def fetch_all_pages(client, url, filters=None, page_size=50, sensitive=False):
    """Fetch all records from a paginated table endpoint."""
    all_data = []
    page = 1
    total_count = float("inf")
    filters = filters or {}

    while len(all_data) < total_count:
        res = await post_form(client, url, {**filters, "page": page, "limit": page_size})
        if res.get("code") != 0 or not isinstance(res.get("data"), list):
            print(f"    unexpected response: {json.dumps(res)[:200]}")
            break
        total_count = res["count"]
        all_data.extend(res["data"])
        if len(res["data"]) < page_size:
            break
        page += 1

    return strip_sensitive(all_data) if sensitive else all_data


# --- Fetch date-chunked (max 7-day windows) ---

async def fetch_date_chunked(client, url, start_date, end_date, filters=None,
                              page_size=50, datetime_fmt=False, date_param="create_time"):
    """Fetch data from endpoints with max 7-day date range."""
    all_data = []
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    max_days = 6  # 7-day inclusive
    filters = filters or {}

    chunk_start = start
    while chunk_start <= end:
        chunk_end = chunk_start + timedelta(days=max_days)
        if chunk_end > end:
            chunk_end = end

        if datetime_fmt:
            date_value = f"{fmt_date(chunk_start)} 00:00:00|{fmt_date(chunk_end)} 23:59:59"
        else:
            date_value = f"{fmt_date(chunk_start)}|{fmt_date(chunk_end)}"

        data = await fetch_all_pages(
            client, url, {**filters, date_param: date_value}, page_size
        )
        all_data.extend(data)
        print(f"    chunk {fmt_date(chunk_start)}→{fmt_date(chunk_end)}: {len(data)} (total: {len(all_data)})")

        chunk_start = chunk_end + timedelta(days=1)

    return all_data


# --- Upload batched to backend ---

async def post_batched(backend_client, url, records):
    """Upload records in batches to backend sync endpoint."""
    total = 0
    batches = math.ceil(len(records) / BATCH_SIZE)

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print(f"    uploading batch {batch_num}/{batches} ({len(batch)} records)...", end="", flush=True)
        resp = await backend_client.post(url, json={"data": batch, "agent_id": AGENT_ID})
        resp.raise_for_status()
        processed = resp.json().get("processed", 0)
        total += processed
        print(f" done ({processed})")

    return total


# --- Verify random ---

async def verify_random(backend_client, endpoint, records, n=5):
    """Pick N random records, check they exist in DB."""
    if not records:
        return {"ok": True, "checked": 0}

    samples = random.sample(records, min(n, len(records)))
    ids = [r["id"] for r in samples if "id" in r]
    if not ids:
        return {"ok": True, "checked": 0, "reason": "no IDs"}

    try:
        resp = await backend_client.post(f"/api/v1/sync/verify/{endpoint}", json={"ids": ids})
        resp.raise_for_status()
        db_ids = {r["id"] for r in resp.json().get("records", [])}
        missing = [id for id in ids if id not in db_ids]
        return {"ok": len(missing) == 0, "checked": len(ids), "found": len(db_ids), "missing": missing}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# =====================================================================
#  SYNC FUNCTIONS
# =====================================================================

async def sync_config(uc, bc):
    print("\n[1/8] CONFIG (lottery_series, lottery_games, invite_list, bank_list)")
    t = time.time()
    body = {"agent_id": AGENT_ID}

    try:
        lottery_init = await post_json(uc, "/agent/getLottery", {"type": "init"})
        if lottery_init.get("code") == 1 and lottery_init.get("data"):
            body["lottery_series"] = lottery_init["data"].get("seriesData", [])
            body["lottery_games"] = lottery_init["data"].get("lotteryData", [])
            print(f"  lottery: {len(body.get('lottery_series', []))} series, {len(body.get('lottery_games', []))} games")
    except Exception as e:
        print(f"  lottery fetch failed: {e}")

    invites = await fetch_all_pages(uc, "/agent/inviteList.html", page_size=50)
    if invites:
        body["invite_list"] = invites
    print(f"  invites: {len(invites)}")

    banks = await fetch_all_pages(uc, "/agent/bankList.html", page_size=50)
    if banks:
        body["bank_list"] = banks
    print(f"  banks: {len(banks)}")

    resp = await bc.post("/api/v1/sync/config", json=body)
    resp.raise_for_status()
    result = resp.json()
    print(f"  => {result['processed']} records in {time.time() - t:.1f}s")
    return result


async def sync_members(uc, bc):
    print("\n[2/8] MEMBERS")
    t = time.time()
    data = await fetch_all_pages(uc, "/agent/user.html", page_size=50, sensitive=True)
    print(f"  fetched: {len(data)} in {time.time() - t:.1f}s")
    if not data:
        return {"fetched": 0, "processed": 0}

    t = time.time()
    processed = await post_batched(bc, "/api/v1/sync/members", data)
    print(f"  uploaded: {processed} in {time.time() - t:.1f}s")

    verify = await verify_random(bc, "members", data)
    print(f"  verify: {'OK' if verify['ok'] else 'FAIL'} ({verify.get('checked', 0)} checked, {verify.get('found', 0)} found)")
    return {"fetched": len(data), "processed": processed, "verify": verify}


async def sync_bet_orders(uc, bc):
    start_date = days_ago(DAYS)
    end_date = today_str()
    print(f"\n[3/8] BET_ORDER ({start_date} → {end_date})")
    t = time.time()

    data = await fetch_date_chunked(uc, "/agent/betOrder.html", start_date, end_date,
                                     filters={"es": 1}, date_param="bet_time")
    print(f"  fetched: {len(data)} in {time.time() - t:.1f}s")
    if not data:
        return {"fetched": 0, "processed": 0}

    t = time.time()
    processed = await post_batched(bc, "/api/v1/sync/bet-orders", data)
    print(f"  uploaded: {processed} in {time.time() - t:.1f}s")

    verify = await verify_random(bc, "bet_order", data)
    print(f"  verify: {'OK' if verify['ok'] else 'FAIL'} ({verify.get('checked', 0)} checked, {verify.get('found', 0)} found)")
    return {"fetched": len(data), "processed": processed, "verify": verify}


async def sync_bet_lottery(uc, bc):
    start_date = days_ago(DAYS)
    end_date = today_str()
    print(f"\n[4/8] BET_LOTTERY ({start_date} → {end_date})")
    t = time.time()

    data = await fetch_date_chunked(uc, "/agent/bet.html", start_date, end_date,
                                     filters={"es": 1}, datetime_fmt=True, date_param="create_time")
    print(f"  fetched: {len(data)} in {time.time() - t:.1f}s")
    if not data:
        return {"fetched": 0, "processed": 0}

    t = time.time()
    processed = await post_batched(bc, "/api/v1/sync/bet-lottery", data)
    print(f"  uploaded: {processed} in {time.time() - t:.1f}s")

    verify = await verify_random(bc, "bet_lottery", data)
    print(f"  verify: {'OK' if verify['ok'] else 'FAIL'} ({verify.get('checked', 0)} checked, {verify.get('found', 0)} found)")
    return {"fetched": len(data), "processed": processed, "verify": verify}


async def sync_deposits(uc, bc):
    start_date = days_ago(DAYS)
    end_date = today_str()
    print(f"\n[5/8] DEPOSIT_WITHDRAWAL ({start_date} → {end_date})")
    t = time.time()

    data = await fetch_date_chunked(uc, "/agent/depositAndWithdrawal.html", start_date, end_date,
                                     date_param="create_time")
    print(f"  fetched: {len(data)} in {time.time() - t:.1f}s")
    if not data:
        return {"fetched": 0, "processed": 0}

    t = time.time()
    processed = await post_batched(bc, "/api/v1/sync/deposits", data)
    print(f"  uploaded: {processed} in {time.time() - t:.1f}s")

    verify = await verify_random(bc, "deposit_withdrawal", data)
    print(f"  verify: {'OK' if verify['ok'] else 'FAIL'} ({verify.get('checked', 0)} checked, {verify.get('found', 0)} found)")
    return {"fetched": len(data), "processed": processed, "verify": verify}


async def sync_report_day_by_day(uc, bc, name, url, sync_url, date_param="date", rename_date=None):
    start_date = days_ago(DAYS)
    end_date = today_str()
    idx_map = {"report_lottery": "6/8", "report_funds": "7/8", "report_third_game": "8/8"}
    print(f"\n[{idx_map[name]}] {name.upper()} ({start_date} → {end_date})")
    t = time.time()

    all_data = []
    current = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    while current <= end:
        date_str = fmt_date(current)
        date_range = f"{date_str}|{date_str}"

        data = await fetch_all_pages(uc, url, {date_param: date_range}, page_size=50)

        for record in data:
            if rename_date and rename_date in record:
                record["report_date"] = record.pop(rename_date)
            elif "report_date" not in record:
                record["report_date"] = date_str

        all_data.extend(data)
        if data:
            print(f"    {date_str}: {len(data)} records")

        current += timedelta(days=1)

    print(f"  fetched: {len(all_data)} in {time.time() - t:.1f}s")
    if not all_data:
        return {"fetched": 0, "processed": 0}

    t = time.time()
    processed = await post_batched(bc, sync_url, all_data)
    print(f"  uploaded: {processed} in {time.time() - t:.1f}s")
    return {"fetched": len(all_data), "processed": processed}


# =====================================================================
#  MAIN
# =====================================================================

async def main():
    print("=" * 60)
    print("FULL 30-DAY SYNC TEST — Agent 112233")
    print("=" * 60)
    start_all = time.time()

    # Step 1: Clear ALL sync data
    print("\n>>> STEP 1: Clearing all sync data...")
    try:
        conn = await asyncpg.connect(DB_DSN)
        await conn.execute("""
            TRUNCATE TABLE sync_metadata, members, bank_list, invite_list,
            lottery_series, lottery_games, report_lottery, report_funds,
            report_third_game, bet_order, bet_lottery, deposit_withdrawal
            CASCADE;
        """)
        await conn.close()
        print("  All tables truncated.")
    except Exception as e:
        print(f"  Truncate error: {e}")

    # Step 2: Run full sync
    print("\n>>> STEP 2: Running full sync...")
    uc = create_upstream_client()
    bc = create_backend_client()
    results = {}

    try:
        results["config"] = await sync_config(uc, bc)
        results["members"] = await sync_members(uc, bc)
        results["bet_order"] = await sync_bet_orders(uc, bc)
        results["bet_lottery"] = await sync_bet_lottery(uc, bc)
        results["deposit_withdrawal"] = await sync_deposits(uc, bc)
        results["report_lottery"] = await sync_report_day_by_day(
            uc, bc, "report_lottery", "/agent/reportLottery.html", "/api/v1/sync/reports/lottery")
        results["report_funds"] = await sync_report_day_by_day(
            uc, bc, "report_funds", "/agent/reportFunds.html", "/api/v1/sync/reports/funds",
            rename_date="date")
        results["report_third_game"] = await sync_report_day_by_day(
            uc, bc, "report_third_game", "/agent/reportThirdGame.html", "/api/v1/sync/reports/third-game")
    except Exception as e:
        print(f"\n!!! SYNC ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await uc.aclose()
        await bc.aclose()

    # Step 3: Summary
    elapsed = time.time() - start_all
    print("\n" + "=" * 60)
    print("SYNC COMPLETE")
    print("=" * 60)
    print(f"Total time: {elapsed:.1f}s")
    print("\nResults:")
    for k, v in results.items():
        fetched = v.get("fetched", "")
        processed = v.get("processed", "")
        verify = v.get("verify", {})
        verify_str = f"  verify: {'OK' if verify.get('ok') else 'FAIL'}" if verify else ""
        if fetched != "":
            print(f"  {k:<22} fetched: {fetched:>7}  processed: {processed:>7}{verify_str}")
        else:
            print(f"  {k:<22} processed: {processed}")

    # Step 4: Verify DB counts
    print("\n>>> STEP 3: Verifying DB record counts...")
    try:
        conn = await asyncpg.connect(DB_DSN)
        tables = [
            "members", "bet_order", "bet_lottery", "deposit_withdrawal",
            "report_lottery", "report_funds", "report_third_game",
            "lottery_series", "lottery_games", "invite_list", "bank_list", "sync_metadata"
        ]
        for table in tables:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
            print(f"  {table:<22} {count} rows")
        await conn.close()
    except Exception as e:
        print(f"  Count check failed: {e}")

    # Step 5: Check sync status
    print("\n>>> STEP 4: Sync status (last_data_date):")
    try:
        async with httpx.AsyncClient(base_url=BACKEND_BASE) as client:
            resp = await client.get("/api/v1/sync/status")
            for ep in resp.json().get("endpoints", []):
                last_date = (ep.get("sync_params") or {}).get("last_data_date", "N/A")
                print(f"  {ep['endpoint']:<22} last_data: {last_date}  count: {ep.get('last_sync_count')}  status: {ep.get('sync_status')}")
    except Exception as e:
        print(f"  Status check failed: {e}")

    print("\n" + "=" * 60)
    print(f"DONE in {elapsed:.1f}s")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
