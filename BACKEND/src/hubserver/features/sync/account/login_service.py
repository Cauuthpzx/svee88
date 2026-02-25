"""Agent Login Service — tự động đăng nhập upstream với ddddocr captcha + RSA.

Login flow (EE88 upstream platform):
1. POST {base_url}/agent/login  {scene: "init"}  → {public_key, captcha_url}
2. GET  {base_url}{captcha_url}                   → image bytes
3. ddddocr.classification(image)                  → captcha_code
4. RSA PKCS1v15 encrypt(password, public_key)     → encrypted_password (base64)
5. POST {base_url}/agent/login  {username, password: encrypted, captcha, scene: "login"}
   → {code: 1}  = success, Set-Cookie = session
6. Retry tối đa 3 lần nếu captcha sai
"""

import base64
import hashlib
import logging
from typing import Optional

import httpx
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding

from ....core.config import settings

logger = logging.getLogger(__name__)

HTTP_TIMEOUT = 30
MAX_CAPTCHA_ATTEMPTS = 3

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
    "X-Requested-With": "XMLHttpRequest",
}

# ── Fernet password encryption ───────────────────────────────────────────────


def _get_fernet() -> Fernet:
    secret = settings.SECRET_KEY.get_secret_value()
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())
    return Fernet(key)


def encrypt_password(plain: str) -> str:
    """Mã hóa mật khẩu bằng Fernet (symmetric). Dùng để lưu DB."""
    return _get_fernet().encrypt(plain.encode()).decode()


def decrypt_password(enc: str) -> str:
    """Giải mã mật khẩu đã lưu DB."""
    return _get_fernet().decrypt(enc.encode()).decode()


# ── Cookie helpers ───────────────────────────────────────────────────────────


def cookie_str_to_dict(cookie_str: str) -> dict:
    """Chuyển chuỗi cookie header sang dict."""
    result: dict = {}
    for part in (cookie_str or "").split(";"):
        part = part.strip()
        if "=" in part:
            k, v = part.split("=", 1)
            result[k.strip()] = v.strip()
    return result


def cookie_dict_to_str(cookies: dict) -> str:
    """Chuyển dict sang chuỗi cookie header."""
    return "; ".join(f"{k}={v}" for k, v in cookies.items())


# ── Login Service ────────────────────────────────────────────────────────────


class AgentLoginService:
    """Tự động đăng nhập upstream agent platform.

    Dùng blocking httpx.Client + ddddocr OCR (CPU-bound).
    Gọi từ async code qua asyncio.to_thread().
    """

    def __init__(self, base_url: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._login_url = f"{self._base_url}/agent/login"
        self._client: Optional[httpx.Client] = None
        self._public_key: Optional[str] = None
        self._captcha_url: Optional[str] = None
        self._ocr = None

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                timeout=HTTP_TIMEOUT,
                headers=_HEADERS,
                follow_redirects=False,
            )
        return self._client

    def _get_ocr(self):
        if self._ocr is None:
            import ddddocr  # lazy import — nặng, chỉ load khi cần

            self._ocr = ddddocr.DdddOcr(show_ad=False)
        return self._ocr

    @staticmethod
    def _rsa_encrypt(plain_text: str, public_key_pem: str) -> str:
        """RSA PKCS1v15 encrypt — tương thích JSEncrypt của upstream."""
        key_data = (
            public_key_pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\n", "")
            .replace("\r", "")
            .strip()
        )
        lines = [key_data[i : i + 64] for i in range(0, len(key_data), 64)]
        pem = (
            "-----BEGIN PUBLIC KEY-----\n"
            + "\n".join(lines)
            + "\n-----END PUBLIC KEY-----\n"
        ).encode()
        public_key = serialization.load_pem_public_key(pem)
        encrypted = public_key.encrypt(plain_text.encode("utf-8"), padding.PKCS1v15())
        return base64.b64encode(encrypted).decode("utf-8")

    def close(self) -> None:
        if self._client:
            self._client.close()
            self._client = None
        self._ocr = None

    # ─── Init ────────────────────────────────────────────────────────────────

    def init_login(self) -> tuple[bool, str]:
        """Gọi scene=init để lấy public_key + captcha_url."""
        client = self._get_client()
        try:
            resp = client.post(self._login_url, json={"scene": "init"})
            if resp.status_code != 200:
                return False, f"HTTP {resp.status_code}"
            data = resp.json().get("data", {})
            self._public_key = data.get("public_key", "")
            self._captcha_url = data.get("captcha_url", "")
            if not self._public_key:
                return False, "Không lấy được public key"
            if not self._captcha_url:
                return False, "Không lấy được captcha URL"
            logger.info("Init OK: captcha_url=%s", self._captcha_url)
            return True, "Init thành công"
        except (httpx.HTTPError, ValueError) as e:
            return False, f"Lỗi kết nối: {e}"

    # ─── Captcha ─────────────────────────────────────────────────────────────

    def get_captcha_image(self) -> tuple[bool, bytes, str]:
        """Tải ảnh captcha."""
        if not self._captcha_url:
            ok, msg = self.init_login()
            if not ok:
                return False, b"", msg
        client = self._get_client()
        url = self._captcha_url if not (self._captcha_url or "").startswith("/") else f"{self._base_url}{self._captcha_url}"
        try:
            resp = client.get(url)
            if resp.status_code != 200:
                return False, b"", f"HTTP {resp.status_code}"
            if "image" not in resp.headers.get("Content-Type", ""):
                return False, b"", "Response không phải ảnh"
            return True, resp.content, ""
        except (httpx.HTTPError, ValueError) as e:
            return False, b"", f"Lỗi tải captcha: {e}"

    def solve_captcha(self, image_bytes: bytes) -> tuple[bool, str, str]:
        """Giải captcha bằng ddddocr OCR."""
        try:
            ocr = self._get_ocr()
            result = ocr.classification(image_bytes)
            _map = {
                "o": "0", "O": "0", "\u53e3": "0",
                "l": "1", "I": "1", "i": "1",
                "z": "2", "Z": "2",
                "s": "5", "S": "5",
                "b": "6",
                "B": "8",
                "g": "9", "q": "9",
            }
            cleaned = ""
            for c in result:
                if c.isdigit() and c.isascii():
                    cleaned += c
                elif c in _map:
                    cleaned += _map[c]
                elif c.isascii() and c.isalnum():
                    cleaned += c
            if not cleaned:
                return False, "", "OCR trả về rỗng"
            logger.info("Captcha solved: %s -> %s", result, cleaned)
            return True, cleaned, ""
        except ImportError:
            return False, "", "ddddocr chưa cài. Chạy: pip install ddddocr"
        except Exception as e:
            logger.error("Captcha solve error: %s", e)
            return False, "", f"Lỗi giải captcha: {e}"

    # ─── Login ───────────────────────────────────────────────────────────────

    def login(self, username: str, password: str) -> tuple[bool, str, dict]:
        """Đăng nhập tự động: init → captcha → RSA encrypt → POST login.

        Returns:
            (success, message, cookies_dict)
        """
        if not self._public_key or not self._captcha_url:
            ok, msg = self.init_login()
            if not ok:
                return False, msg, {}

        client = self._get_client()

        for attempt in range(1, MAX_CAPTCHA_ATTEMPTS + 1):
            logger.info("Login attempt %d/%d", attempt, MAX_CAPTCHA_ATTEMPTS)

            ok, image, err = self.get_captcha_image()
            if not ok:
                return False, f"Lỗi lấy captcha: {err}", {}

            ok, captcha_code, err = self.solve_captcha(image)
            if not ok:
                logger.warning("Captcha solve failed (attempt %d): %s", attempt, err)
                self.init_login()
                continue

            try:
                encrypted_password = self._rsa_encrypt(password, self._public_key)
            except Exception as e:
                logger.error("RSA encryption failed: %s", e)
                return False, f"Lỗi mã hóa mật khẩu: {e}", {}

            try:
                resp = client.post(
                    self._login_url,
                    json={
                        "username": username,
                        "password": encrypted_password,
                        "captcha": captcha_code,
                        "scene": "login",
                    },
                )
                result = self._parse_login_response(resp, attempt)
                if result["success"]:
                    cookies = dict(client.cookies)
                    logger.info("Login OK, got %d cookies", len(cookies))
                    return True, "Đăng nhập thành công", cookies
                if result["retry"]:
                    logger.warning("Attempt %d: %s", attempt, result["message"])
                    self.init_login()
                    continue
                return False, result["message"], {}
            except (httpx.HTTPError, ValueError) as e:
                logger.error("Login request error: %s", e)
                return False, f"Lỗi kết nối: {e}", {}

        return False, f"Captcha sai sau {MAX_CAPTCHA_ATTEMPTS} lần thử", {}

    def _parse_login_response(self, resp: httpx.Response, attempt: int) -> dict:
        try:
            data = resp.json()
            code = data.get("code", -1)
            msg = data.get("msg", "")
            if code == 1:
                return {"success": True, "message": msg or "OK", "retry": False}
            msg_lower = str(msg).lower()
            if any(kw in msg_lower for kw in ("captcha", "xac nhan", "ma xac", "verify", "验证码")):
                return {"success": False, "message": f"Captcha sai: {msg}", "retry": True}
            if any(kw in msg_lower for kw in ("password", "mat khau", "密码", "pwd")):
                return {"success": False, "message": f"Sai mật khẩu: {msg}", "retry": False}
            if any(kw in msg_lower for kw in ("account", "tai khoan", "用户", "khong ton tai")):
                return {"success": False, "message": f"Lỗi tài khoản: {msg}", "retry": False}
            return {"success": False, "message": msg or f"Lỗi (code={code})", "retry": attempt < MAX_CAPTCHA_ATTEMPTS}
        except (ValueError, KeyError):
            return {"success": False, "message": f"HTTP {resp.status_code}", "retry": False}

    # ─── Cookie validation ───────────────────────────────────────────────────

    def check_cookies_live(self, cookies_dict: dict) -> tuple[bool, str]:
        """Kiểm tra cookie còn hiệu lực không (302 → login = hết hạn)."""
        client = self._get_client()
        try:
            resp = client.get(f"{self._base_url}/", cookies=cookies_dict)
            if resp.status_code == 302:
                if "login" in resp.headers.get("Location", "").lower():
                    return False, "Cookie đã hết hạn"
            if resp.status_code == 200:
                return True, "Cookie còn hiệu lực"
            return False, f"HTTP {resp.status_code}"
        except httpx.TimeoutException:
            return False, "Timeout"
        except httpx.ConnectError:
            return False, "Không thể kết nối"
        except httpx.HTTPError as e:
            return False, f"Lỗi: {e}"

    def ensure_valid_cookies(
        self,
        username: str,
        password: str,
        current_cookies: dict,
    ) -> tuple[bool, str, dict]:
        """Đảm bảo cookie hợp lệ. Tự động re-login nếu hết hạn.

        Returns:
            (success, message, cookies_dict)
        """
        if current_cookies:
            is_valid, msg = self.check_cookies_live(current_cookies)
            if is_valid:
                return True, "Cookie còn hiệu lực", current_cookies
            logger.info("Cookies expired: %s — re-logging in", msg)
        if self._client:
            self._client.cookies.clear()
        self._public_key = None
        self._captcha_url = None
        return self.login(username, password)
