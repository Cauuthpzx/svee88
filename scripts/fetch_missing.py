"""Fetch EMPTY endpoints - bet_lottery day-by-day, reports by user."""
import sys, os
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

import requests, json, time
from datetime import datetime, timedelta

BASE = "https://a2u4k.ee88dly.com"
COOKIE = "PHPSESSID=39o0qls7ajhahkjhjrtt498cu3; think_var=vi-vn; cf_clearance=tZj.t56.Ts9p9Qz7z1_P2w5VQNy6.VaT0DrdgG0IIM8-1771923488-1.2.1.1-DXdrgTYhXvYSrDsELybu_e.tS6M9_YXwoS1h_o.pa8QRXHAwsTe316iBS5f8VY7zbZGHnWy7q9OTs.t3H8Wwgp06c9PnyEg6XrNT6m5WwLF48F.CEqrpyLDYkA1BzaOZjU0CansIo3bUQSL5TrZCOxflQCCr7sPXJ6VxnccJi46hqpoxQKw9awXRJyhGFw_q9ehB_0M38PVz5kIsP2i7DOwQ13wZELYZa5dLnpcARVY"
H = {
    "Cookie": COOKIE,
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Origin": BASE,
}

def pf(path, data, timeout=90):
    h = {**H, "Referer": BASE + path}
    for attempt in range(3):
        try:
            r = requests.post(BASE + path, data=data, headers=h, timeout=timeout)
            return r.json()
        except Exception as e:
            if attempt < 2:
                print(f"      retry {attempt+2}/3...")
                time.sleep(5)
            else:
                return {"code": -1, "msg": str(e), "data": [], "count": 0}

results = {}

# === 1. BET LOTTERY - day by day (most recent 10 days first) ===
print("=== BET LOTTERY - day by day ===")
all_bet = []
d = datetime(2026, 2, 24)
for i in range(31):
    ds = d.strftime("%Y-%m-%d")
    ct = f"{ds} 00:00:00|{ds} 23:59:59"
    res = pf("/agent/bet.html", {"page": 1, "limit": 50, "create_time": ct})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {ds}: {n} records")
        all_bet.extend(res.get("data", []))
    elif res.get("code") == -1:
        print(f"  {ds}: TIMEOUT")
    d -= timedelta(days=1)
    time.sleep(0.5)

results["bet_lottery"] = {"data": all_bet, "count": len(all_bet)}
print(f"  TOTAL: {len(all_bet)} records")
if all_bet:
    print(f"  Keys: {list(all_bet[0].keys())}")

# === 2. BET ORDER 3RD PARTY - day by day ===
print("\n=== BET ORDER 3RD PARTY - day by day ===")
all_bo = []
d = datetime(2026, 2, 24)
for i in range(31):
    ds = d.strftime("%Y-%m-%d")
    res = pf("/agent/betOrder.html", {"page": 1, "limit": 50, "create_time": f"{ds}|{ds}"})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {ds}: {n} records")
        all_bo.extend(res.get("data", []))
    elif res.get("code") == -1:
        print(f"  {ds}: TIMEOUT")
    d -= timedelta(days=1)
    time.sleep(0.5)

results["bet_order"] = {"data": all_bo, "count": len(all_bo)}
print(f"  TOTAL: {len(all_bo)} records")

# === 3. REPORTS - by known active users ===
# Get known usernames from members (already have 18)
known_users = ["tuanhue96", "thanhtrieu88", "duong311", "long999vn",
               "troitrongxanh", "tuytinh2222", "huangxie11"]

print("\n=== REPORT LOTTERY - by user ===")
for user in known_users:
    res = pf("/agent/reportLottery.html",
             {"page": 1, "limit": 50, "username": user, "create_time": "2026-01-24|2026-02-24"})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {user}: {n} records")
        results[f"report_lottery_{user}"] = res
        break
    time.sleep(0.3)
if not any(k.startswith("report_lottery_") for k in results):
    print("  => All users: 0 records (no lottery activity)")
    results["report_lottery"] = {"data": [], "count": 0, "note": "No lottery activity for any user in date range"}

print("\n=== REPORT FUNDS - by user ===")
for user in known_users:
    res = pf("/agent/reportFunds.html",
             {"page": 1, "limit": 50, "username": user, "create_time": "2026-01-24|2026-02-24"})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {user}: {n} records")
        print(f"    keys: {list(res['data'][0].keys())}")
        results[f"report_funds_{user}"] = res
    time.sleep(0.3)
if not any(k.startswith("report_funds_") for k in results):
    print("  => All users: 0 records")
    results["report_funds"] = {"data": [], "count": 0, "note": "No fund activity"}

print("\n=== REPORT THIRD GAME - by user ===")
for user in known_users:
    res = pf("/agent/reportThirdGame.html",
             {"page": 1, "limit": 50, "username": user, "create_time": "2026-01-24|2026-02-24"})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {user}: {n} records")
        results[f"report_third_{user}"] = res
    time.sleep(0.3)
if not any(k.startswith("report_third_") for k in results):
    print("  => All users: 0 records")
    results["report_third"] = {"data": [], "count": 0, "note": "No third-party game activity"}

# === 4. WITHDRAWAL RECORDS - wider search ===
print("\n=== WITHDRAWAL RECORDS - wider ===")
d = datetime(2026, 2, 24)
all_wr = []
for i in range(5):  # 5 chunks of 7 days = 35 days
    s = d - timedelta(days=6)
    res = pf("/agent/withdrawalsRecord.html",
             {"page": 1, "limit": 50, "create_time": f"{s.strftime('%Y-%m-%d')}|{d.strftime('%Y-%m-%d')}"})
    n = res.get("count", 0)
    if n > 0:
        print(f"  {s.strftime('%Y-%m-%d')} -> {d.strftime('%Y-%m-%d')}: {n} records")
        all_wr.extend(res.get("data", []))
    d = s - timedelta(days=1)
    time.sleep(0.3)
results["withdrawal_record"] = {"data": all_wr, "count": len(all_wr)}
print(f"  TOTAL: {len(all_wr)} records")

# Save
with open("missing_payloads.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 60)
print("FINAL STATUS:")
for k, v in results.items():
    if isinstance(v, dict) and "data" in v:
        n = len(v["data"]) if isinstance(v["data"], list) else "obj"
        status = "OK" if (isinstance(n, int) and n > 0) or n == "obj" else "EMPTY"
        print(f"  {k:40s} {status} ({n})")
print(f"\nSaved to missing_payloads.json")
