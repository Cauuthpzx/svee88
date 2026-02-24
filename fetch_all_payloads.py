"""Fetch ALL upstream endpoint payloads and save to JSON for analysis."""
import requests
import json
import sys

BASE = "https://a2u4k.ee88dly.com"
COOKIE = "PHPSESSID=39o0qls7ajhahkjhjrtt498cu3; think_var=vi-vn; cf_clearance=tZj.t56.Ts9p9Qz7z1_P2w5VQNy6.VaT0DrdgG0IIM8-1771923488-1.2.1.1-DXdrgTYhXvYSrDsELybu_e.tS6M9_YXwoS1h_o.pa8QRXHAwsTe316iBS5f8VY7zbZGHnWy7q9OTs.t3H8Wwgp06c9PnyEg6XrNT6m5WwLF48F.CEqrpyLDYkA1BzaOZjU0CansIo3bUQSL5TrZCOxflQCCr7sPXJ6VxnccJi46hqpoxQKw9awXRJyhGFw_q9ehB_0M38PVz5kIsP2i7DOwQ13wZELYZa5dLnpcARVY"

HEADERS_FORM = {
    "Cookie": COOKIE,
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Origin": BASE,
}

HEADERS_JSON = {
    "Cookie": COOKIE,
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    "Origin": BASE,
}

TODAY = "2026-02-24"
YESTERDAY = "2026-02-23"
WEEK_AGO = "2026-02-17"
DATE_RANGE = f"{YESTERDAY}|{TODAY}"
DATE_RANGE_WEEK = f"{WEEK_AGO}|{TODAY}"
DATETIME_RANGE = f"{YESTERDAY} 00:00:00|{TODAY} 23:59:59"
DATETIME_RANGE_WEEK = f"{WEEK_AGO} 00:00:00|{TODAY} 23:59:59"

results = {}

def post_form(name, path, data):
    url = BASE + path
    h = {**HEADERS_FORM, "Referer": url}
    try:
        r = requests.post(url, data=data, headers=h, timeout=15)
        results[name] = {"status": r.status_code, "body": r.json()}
        count = results[name]["body"].get("count", "N/A")
        code = results[name]["body"].get("code", "N/A")
        print(f"  [{name}] code={code}, count={count}, http={r.status_code}")
    except Exception as e:
        results[name] = {"status": "error", "body": str(e)}
        print(f"  [{name}] ERROR: {e}")

def post_json(name, path, data):
    url = BASE + path
    h = {**HEADERS_JSON, "Referer": BASE + "/agent/rebateOdds.html"}
    try:
        r = requests.post(url, json=data, headers=h, timeout=15)
        results[name] = {"status": r.status_code, "body": r.json()}
        code = results[name]["body"].get("code", "N/A")
        print(f"  [{name}] code={code}, http={r.status_code}")
    except Exception as e:
        results[name] = {"status": "error", "body": str(e)}
        print(f"  [{name}] ERROR: {e}")

print("=== Fetching all endpoints ===\n")

# 1. Members - no date filter
print("[1/12] Members")
post_form("members", "/agent/user.html", {"page": 1, "limit": 3})

# 2. Invite list - no date filter
print("[2/12] Invite List")
post_form("invite_list", "/agent/inviteList.html", {"page": 1, "limit": 3})

# 3. Report Lottery - with date (try week range for more data)
print("[3/12] Report Lottery")
post_form("report_lottery_today", "/agent/reportLottery.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("report_lottery_week", "/agent/reportLottery.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 4. Report Funds - with date
print("[4/12] Report Funds")
post_form("report_funds_today", "/agent/reportFunds.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("report_funds_week", "/agent/reportFunds.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 5. Report Third Game - with date
print("[5/12] Report Third Game")
post_form("report_third_today", "/agent/reportThirdGame.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("report_third_week", "/agent/reportThirdGame.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 6. Bank List - no date filter
print("[6/12] Bank List")
post_form("bank_list", "/agent/bankList.html", {"page": 1, "limit": 3})

# 7. Deposit & Withdrawal - with date
print("[7/12] Deposit & Withdrawal")
post_form("deposit_withdrawal_today", "/agent/depositAndWithdrawal.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("deposit_withdrawal_week", "/agent/depositAndWithdrawal.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 8. Withdrawal Records - with date
print("[8/12] Withdrawal Records")
post_form("withdrawal_record_today", "/agent/withdrawalsRecord.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("withdrawal_record_week", "/agent/withdrawalsRecord.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 9. Bet Orders (Lottery) - with datetime
print("[9/12] Bet Orders - Lottery")
post_form("bet_today", "/agent/bet.html",
          {"page": 1, "limit": 3, "create_time": DATETIME_RANGE})
post_form("bet_week", "/agent/bet.html",
          {"page": 1, "limit": 3, "create_time": DATETIME_RANGE_WEEK})

# 10. Bet Order (Third Party) - with date
print("[10/12] Bet Order - Third Party")
post_form("bet_order_today", "/agent/betOrder.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE})
post_form("bet_order_week", "/agent/betOrder.html",
          {"page": 1, "limit": 3, "create_time": DATE_RANGE_WEEK})

# 11. Rebate - getLottery init (JSON)
print("[11/12] Rebate - getLottery init")
post_json("rebate_init", "/agent/getLottery", {"type": "init"})

# 12. Rebate - getOddsPanel (JSON)
print("[12/12] Rebate - getOddsPanel")
post_json("rebate_odds_panel", "/agent/getRebateOddsPanel",
          {"lottery_id": 1, "series_id": 1})

# Save all results
outfile = "all_payloads.json"
with open(outfile, "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n=== Done! Saved {len(results)} payloads to {outfile} ===")
