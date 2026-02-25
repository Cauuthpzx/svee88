"""
Fetch ALL upstream endpoints - huangxie11 - 1 month back, day by day.
Robust: retry on timeout, save progress incrementally.
"""
import sys, os
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import requests
import json
import time
from datetime import datetime, timedelta

BASE = "https://a2u4k.ee88dly.com"
COOKIE = "PHPSESSID=39o0qls7ajhahkjhjrtt498cu3; think_var=vi-vn; cf_clearance=tZj.t56.Ts9p9Qz7z1_P2w5VQNy6.VaT0DrdgG0IIM8-1771923488-1.2.1.1-DXdrgTYhXvYSrDsELybu_e.tS6M9_YXwoS1h_o.pa8QRXHAwsTe316iBS5f8VY7zbZGHnWy7q9OTs.t3H8Wwgp06c9PnyEg6XrNT6m5WwLF48F.CEqrpyLDYkA1BzaOZjU0CansIo3bUQSL5TrZCOxflQCCr7sPXJ6VxnccJi46hqpoxQKw9awXRJyhGFw_q9ehB_0M38PVz5kIsP2i7DOwQ13wZELYZa5dLnpcARVY"

H_FORM = {
    "Cookie": COOKIE,
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Origin": BASE,
}
H_JSON = {
    "Cookie": COOKIE,
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Origin": BASE,
}

START = "2026-01-24"
END = "2026-02-24"
results = {}

def post_form(path, data, timeout=60, retries=3):
    url = BASE + path
    h = {**H_FORM, "Referer": url}
    for attempt in range(retries):
        try:
            r = requests.post(url, data=data, headers=h, timeout=timeout)
            return r.json()
        except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
            if attempt < retries - 1:
                wait = 3 * (attempt + 1)
                print(f"      timeout, retry {attempt+2}/{retries} in {wait}s...")
                time.sleep(wait)
            else:
                return {"code": -1, "msg": f"timeout after {retries} retries", "data": []}

def post_json(path, data, referer="/agent/rebateOdds.html"):
    url = BASE + path
    h = {**H_JSON, "Referer": BASE + referer}
    try:
        r = requests.post(url, json=data, headers=h, timeout=30)
        return r.json()
    except Exception as e:
        return {"code": -1, "msg": str(e), "data": {}}

def fetch_all_pages(path, filters, page_size=50):
    all_data = []
    page = 1
    total = float('inf')
    meta = {}
    while len(all_data) < total:
        res = post_form(path, {**filters, "page": page, "limit": page_size})
        if res.get("code") not in (0, None):
            if res.get("code") == -1:
                break  # timeout
            return {"error": res.get("msg", ""), "data": all_data, **meta}
        total = res.get("count", 0)
        all_data.extend(res.get("data", []))
        if page == 1:
            for k in ["total_data", "form_data", "hsDateTime", "create_time", "bet_time"]:
                if k in res:
                    meta[k] = res[k]
        if len(res.get("data", [])) < page_size:
            break
        page += 1
    return {"data": all_data, "count": len(all_data), "total_server": total if total != float('inf') else 0, **meta}

def chunks_7day(start, end):
    s = datetime.strptime(start, "%Y-%m-%d")
    e = datetime.strptime(end, "%Y-%m-%d")
    out = []
    while s <= e:
        ce = min(s + timedelta(days=6), e)
        out.append((s.strftime("%Y-%m-%d"), ce.strftime("%Y-%m-%d")))
        s = ce + timedelta(days=1)
    return out

def fetch_chunked(path, start, end, extra=None, dt_fmt=False):
    all_data = []
    for cs, ce in chunks_7day(start, end):
        ct = f"{cs} 00:00:00|{ce} 23:59:59" if dt_fmt else f"{cs}|{ce}"
        filters = {"create_time": ct}
        if extra:
            filters.update(extra)
        res = fetch_all_pages(path, filters)
        d = res.get("data", [])
        all_data.extend(d)
        if d:
            print(f"    {cs} -> {ce}: {len(d)} records")
        time.sleep(0.5)  # avoid rate limit
    return all_data

def save():
    with open("complete_payloads.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

# =====================================================================
print("=" * 60)
print(f"FETCH ALL - huangxie11 - {START} to {END}")
print("=" * 60)

# 1. MEMBERS
print("\n[1/14] MEMBERS")
res = fetch_all_pages("/agent/user.html", {})
results["members"] = res
print(f"  => {res['count']} records, keys: {list(res['data'][0].keys()) if res['data'] else 'N/A'}")
save()

# 2. INVITE LIST
print("\n[2/14] INVITE LIST")
res = fetch_all_pages("/agent/inviteList.html", {})
results["invite_list"] = res
print(f"  => {res['count']} records")
save()

# 3. REPORT LOTTERY (wide range)
print(f"\n[3/14] REPORT LOTTERY ({START} -> {END})")
res = fetch_all_pages("/agent/reportLottery.html", {"create_time": f"{START}|{END}"})
results["report_lottery"] = res
print(f"  => {res['count']} records")
if res["count"] == 0:
    # try specific known lottery IDs
    for lid in [1, 32, 44, 57, 58, 59, 60]:
        r2 = fetch_all_pages("/agent/reportLottery.html", {"create_time": f"{START}|{END}", "lottery_id": str(lid)})
        if r2.get("count", 0) > 0:
            results[f"report_lottery_lid{lid}"] = r2
            print(f"  => lottery_id={lid}: {r2['count']} records!")
if "total_data" in res:
    results["report_lottery"]["_total_data_keys"] = list(res["total_data"].keys())
save()

# 4. REPORT FUNDS
print(f"\n[4/14] REPORT FUNDS ({START} -> {END})")
res = fetch_all_pages("/agent/reportFunds.html", {"create_time": f"{START}|{END}"})
results["report_funds"] = res
print(f"  => {res['count']} records")
if res.get("total_data"):
    print(f"  total_data keys: {list(res['total_data'].keys())}")
save()

# 5. REPORT THIRD GAME
print(f"\n[5/14] REPORT THIRD GAME ({START} -> {END})")
res = fetch_all_pages("/agent/reportThirdGame.html", {"create_time": f"{START}|{END}"})
results["report_third_game"] = res
print(f"  => {res['count']} records")
if res.get("total_data"):
    print(f"  total_data keys: {list(res['total_data'].keys())}")
save()

# 6. BANK LIST
print("\n[6/14] BANK LIST")
res = fetch_all_pages("/agent/bankList.html", {})
results["bank_list"] = res
print(f"  => {res['count']} records")
save()

# 7. DEPOSIT & WITHDRAWAL (7-day chunks)
print(f"\n[7/14] DEPOSIT & WITHDRAWAL ({START} -> {END}, 7-day chunks)")
data = fetch_chunked("/agent/depositAndWithdrawal.html", START, END)
results["deposit_withdrawal"] = {"data": data, "count": len(data)}
print(f"  => TOTAL: {len(data)} records")
if data:
    print(f"  keys: {list(data[0].keys())}")
save()

# 8. WITHDRAWAL RECORDS (7-day chunks)
print(f"\n[8/14] WITHDRAWAL RECORDS ({START} -> {END}, 7-day chunks)")
data = fetch_chunked("/agent/withdrawalsRecord.html", START, END)
results["withdrawal_record"] = {"data": data, "count": len(data)}
print(f"  => TOTAL: {len(data)} records")
save()

# 9. BET LOTTERY (7-day chunks, datetime format)
print(f"\n[9/14] BET LOTTERY ({START} -> {END}, 7-day chunks, datetime)")
data = fetch_chunked("/agent/bet.html", START, END, dt_fmt=True)
results["bet_lottery"] = {"data": data, "count": len(data)}
print(f"  => TOTAL: {len(data)} records")
if data:
    print(f"  keys: {list(data[0].keys())}")
save()

# 10. BET ORDER 3RD PARTY (try wide then chunked)
print(f"\n[10/14] BET ORDER 3RD PARTY ({START} -> {END})")
res = fetch_all_pages("/agent/betOrder.html", {"create_time": f"{START}|{END}"})
if res.get("count", 0) == 0:
    print("  Wide: 0. Trying chunked...")
    data = fetch_chunked("/agent/betOrder.html", START, END)
    results["bet_order"] = {"data": data, "count": len(data)}
    print(f"  => TOTAL: {len(data)} records")
else:
    results["bet_order"] = res
    print(f"  => {res['count']} records")
    if res["data"]:
        print(f"  keys: {list(res['data'][0].keys())}")
save()

# 11. REBATE getLottery init
print("\n[11/14] REBATE getLottery init")
res = post_json("/agent/getLottery", {"type": "init"})
results["rebate_init"] = res
sd = res.get("data", {}).get("seriesData", [])
ld = res.get("data", {}).get("lotteryData", [])
print(f"  => {len(sd)} series, {len(ld)} lotteries")
save()

# 12. REBATE by series
print("\n[12/14] REBATE by each series")
for s in sd:
    r2 = post_json("/agent/getLottery", {"type": "getLottery", "series_id": s["id"]})
    lts = r2.get("data", {}).get("lotteryData", [])
    results[f"rebate_series_{s['id']}_{s['name']}"] = r2
    print(f"  Series {s['id']} ({s['name']}): {len(lts)} lotteries")
save()

# 13. REBATE odds panel (sample 3 lotteries per series)
print("\n[13/14] REBATE odds panel (sample)")
for s in sd[:3]:
    series_lotteries = [l for l in ld if l.get("series_id") == s["id"]]
    for lot in series_lotteries[:1]:
        r2 = post_json("/agent/getRebateOddsPanel", {"lottery_id": lot["id"], "series_id": lot["series_id"]})
        rows = len(r2.get("data", {}).get("tableBody", []))
        results[f"odds_{s['name']}_{lot['name']}"] = r2
        print(f"  {s['name']}/{lot['name']}: {rows} play types")

save()

# 14. USER REBATE (seeUserRebate HTML)
print("\n[14/14] USER REBATE (seeUserRebate)")
members = results.get("members", {}).get("data", [])
if members:
    uid = members[0]["id"]
    url = BASE + "/agent/seeUserRebate"
    h = {**H_FORM, "Referer": url}
    try:
        r = requests.get(url, params={"id": uid}, headers=h, timeout=15)
        results["user_rebate"] = {
            "status": r.status_code,
            "content_type": r.headers.get("Content-Type", ""),
            "length": len(r.text),
            "sample": r.text[:1000]
        }
        print(f"  User {uid}: {r.status_code}, len={len(r.text)}")
    except Exception as e:
        print(f"  ERROR: {e}")

save()

# =====================================================================
# FINAL SUMMARY
# =====================================================================
print("\n" + "=" * 60)
print("SUMMARY - ALL ENDPOINTS")
print("=" * 60)
for k, v in results.items():
    if isinstance(v, dict):
        if "data" in v and isinstance(v["data"], list):
            n = len(v["data"])
            status = f"OK ({n})" if n > 0 else "EMPTY"
        elif "data" in v and isinstance(v["data"], dict):
            status = "OK (object)"
        else:
            status = "?"
        print(f"  {k:45s} {status}")

print(f"\nSaved to complete_payloads.json ({os.path.getsize('complete_payloads.json')//1024}KB)")
