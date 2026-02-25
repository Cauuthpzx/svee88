# Design: Agent Auto Login & Auto Re-login

**Date:** 2026-02-26
**Status:** Approved (Approach B)

## Mục tiêu

Port chức năng auto-login + auto re-login từ EE88-SyncTool vào SERVER ONLINE.
Khi cookie upstream của đại lý hết hạn, hệ thống tự động đăng nhập lại, không cần admin can thiệp thủ công.

## Login Flow (upstream EE88/ee-platform)

```
1. POST {base_url}/agent/login  {scene: "init"}
   → {data: {public_key, captcha_url}}

2. GET {base_url}{captcha_url}
   → binary image

3. ddddocr.classification(image) → captcha_code (4 digits)

4. RSA encrypt(password, public_key) → encrypted_password (PKCS1_v1_5, base64)

5. POST {base_url}/agent/login
   {username, password: encrypted, captcha: captcha_code, scene: "login"}
   → {code: 1, msg, url}  = success
   → Set-Cookie headers  = session cookies

6. Retry nếu captcha sai (tối đa 3 lần)
```

## Kiến trúc

### Mới: `sync/account/login_service.py`
- Class `AgentLoginService(base_url)` — per-agent, sync class
- Methods: `init_login()`, `get_captcha_image()`, `solve_captcha()`, `login()`, `check_cookies_live()`, `ensure_valid_cookies()`
- Chạy blocking I/O + ddddocr OCR → gọi từ async qua `asyncio.to_thread()`

### Sửa: `sync/account/model.py`
- Thêm column: `password_enc: str | None` (Fernet encrypted, Text)

### Sửa: `sync/account/schema.py`
- `AgentCreate`: thêm `password: str | None = None`
- `AgentUpdate`: thêm `password: str | None = None`

### Sửa: `sync/account/router.py`
- Thêm `POST /agents/{id}/login` — manual trigger login, update cookie + last_login_at
- Sửa create/update: encrypt password trước khi lưu

### Sửa: `sync/engine/proxy.py`
- Trong `fetch_all_agents()`: với mỗi agent có `password_enc`, check cookie trước
- Nếu cookie expired → `asyncio.to_thread(login_service.ensure_valid_cookies)` → update DB → dùng cookie mới
- Serialize cookies dict → string `"key=val; key2=val2"` để lưu vào `agent.cookie`

### Mới: `migrations/versions/006_add_agent_password.py`
- `op.add_column("agents", sa.Column("password_enc", sa.Text, nullable=True))`

## Password Encryption

- Dùng **Fernet** (`cryptography` package, đã có trong deps)
- Key: derive từ `SECRET_KEY` trong `.env` qua `base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())`
- Helper functions `encrypt_password(plain)` và `decrypt_password(enc)` trong `sync/account/login_service.py`

## Cookie Serialization

Cookie dict từ `requests.Session.cookies` → string:
```python
"; ".join(f"{k}={v}" for k, v in cookies_dict.items())
```
Lưu vào `agent.cookie` (Text field hiện có).

## Auto Re-login Logic trong proxy

```python
async def _ensure_agent_cookie(agent, db):
    if not agent.password_enc:
        return  # No credentials, skip
    cookies_dict = parse_cookie_string(agent.cookie)
    svc = AgentLoginService(agent.base_url)
    is_valid, _ = await asyncio.to_thread(svc.check_cookies_live, cookies_dict)
    if is_valid:
        return
    # Re-login
    plain_pw = decrypt_password(agent.password_enc)
    ok, _, new_cookies = await asyncio.to_thread(svc.login, agent.username, plain_pw)
    if ok:
        agent.cookie = dict_to_cookie_string(new_cookies)
        agent.last_login_at = datetime.now(APP_TZ)
        await db.execute(update(Agent).where(Agent.id == agent.id).values(...))
        await db.commit()
```

## Dependencies

- `ddddocr` — OCR captcha solver
- `pycryptodome` (`Crypto`) — RSA PKCS1_v1_5
- `cryptography` — Fernet (đã có trong project)
- `requests` — sync HTTP (đã có)

## Files thay đổi

| File | Action |
|------|--------|
| `sync/account/login_service.py` | TẠO MỚI |
| `sync/account/model.py` | Thêm `password_enc` |
| `sync/account/schema.py` | Thêm `password` field |
| `sync/account/router.py` | Thêm login endpoint, encrypt on create/update |
| `sync/engine/proxy.py` | Pre-check + auto re-login |
| `migrations/versions/006_add_agent_password.py` | TẠO MỚI |
