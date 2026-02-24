# CODING STANDARDS — Frontend & Backend
> Quy tắc tập trung chuẩn xác. Áp dụng bắt buộc toàn bộ dự án.

---

## 1. API CONTRACTS

**Nguyên tắc:** Định nghĩa 1 lần, dùng mọi nơi, không thay đổi ngầm.

### Response Format — thống nhất 100%
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "errors": []
}
```

### HTTP Status Codes
| Code | Ý nghĩa |
|------|---------|
| 200  | Thành công |
| 201  | Tạo mới thành công |
| 400  | Request sai format |
| 401  | Chưa xác thực |
| 403  | Không có quyền |
| 404  | Không tìm thấy |
| 422  | Validation thất bại |
| 429  | Rate limit |
| 500  | Lỗi server |

### Quy tắc
- Tất cả endpoints tập trung: `constants/api.js` (FE), `config/routes.py` (BE)
- Không hardcode URL string trong component hay controller
- Versioning bắt buộc: `/api/v1/`
- Pagination chuẩn: `{ page, limit, total, data[] }`
- Không thay đổi field name hay data type sau khi đã release

---

## 2. ERROR HANDLING

**Nguyên tắc:** Xử lý 1 chỗ duy nhất — không try/catch rải rác.

### Frontend
- Axios response interceptor xử lý toàn bộ HTTP errors
- Component không tự catch lỗi API — chỉ handle UI state
- Hiển thị lỗi qua 1 notification service duy nhất
- Phân loại: network error / business error / validation error
- Không `alert()`, không `console.error()` trong production

### Backend
- 1 global exception handler duy nhất
- Không try/catch trong controller — để exception bubble lên handler
- Custom exception classes phân loại rõ: `ValidationError`, `NotFoundError`, `AuthError`
- Stack trace: log đầy đủ server-side, trả về client chỉ message an toàn
- Lỗi 3rd party (payment, SMS...): wrap trong custom exception, không expose raw error

### Error Response chuẩn
```json
{
  "code": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email không hợp lệ" }
  ]
}
```

---

## 3. AUTHENTICATION & AUTHORIZATION

**Nguyên tắc:** Middleware tập trung — không kiểm tra thủ công trong từng route.

### Frontend
- 1 request interceptor: inject token vào header
- 1 response interceptor: handle 401 → clear token → redirect login
- Token chỉ đọc/ghi qua `utils/auth.js` — không gọi localStorage trực tiếp bất kỳ đâu
- Auth guard: 1 hàm duy nhất chạy trước mọi route cần xác thực
- Không kiểm tra `if (token)` trong component hay module

### Backend
- Auth middleware apply theo group route, không per-endpoint
- Permission middleware tách biệt auth middleware
- JWT: verify signature + expiry + blacklist check
- Refresh token: rotation sau mỗi lần dùng
- Session: invalidate toàn bộ khi đổi password

### Token Storage
```
Access token  → memory (không localStorage nếu cần bảo mật cao)
Refresh token → httpOnly cookie
```

---

## 4. VALIDATION

**Nguyên tắc:** 2 lớp bắt buộc — không tin tưởng client.

### Frontend (UX layer)
- Validate trước khi submit: báo lỗi nhanh cho user
- Schema: Zod / Yup / custom rules tập trung 1 file
- Không validate inline trong event handler
- Highlight field lỗi + message cụ thể

### Backend (Security layer)
- Validate mọi input dù FE đã check
- Schema: Pydantic (Python) / Joi / class-validator (Node)
- Sanitize HTML input nếu lưu DB
- Whitelist approach: chỉ cho phép field đã khai báo
- File upload: kiểm tra MIME type thật, không chỉ extension

### Validation Schema tập trung
```
src/
├── schemas/          # FE — Zod schemas
│   └── user.schema.js
app/
├── schemas/          # BE — Pydantic models
│   └── user.py
```

---

## 5. CONSTANTS & CONFIGURATION

**Nguyên tắc:** Không magic number/string bất kỳ đâu trong code.

### Phân loại
```
.env.*           → secrets, URLs, credentials (không commit)
constants/       → business constants (commit được)
config/          → app configuration theo env
```

### Frontend
```js
// constants/index.js
export const PAGE_SIZE      = 20
export const MAX_UPLOAD_MB  = 5
export const TOKEN_KEY      = 'access_token'
export const DATE_FORMAT    = 'yyyy-MM-dd HH:mm:ss'
export const DEBOUNCE_MS    = 300
export const REQUEST_TIMEOUT = 10000
```

### Backend
```python
# config/settings.py
PAGE_SIZE       = 20
MAX_UPLOAD_MB   = 5
TOKEN_EXPIRE_M  = 60
CACHE_TTL_S     = 300
BCRYPT_ROUNDS   = 12
```

### Môi trường tách biệt hoàn toàn
```
.env.development
.env.staging
.env.production
```

---

## 6. STATE MANAGEMENT (Frontend)

**Nguyên tắc:** 1 nguồn sự thật — không duplicate state.

### Phân loại state
| Loại | Lưu ở đâu |
|------|----------|
| Auth, user info | Global store |
| App config, permissions | Global store |
| UI state của module | Local trong module |
| Form data | Local trong form |
| Cache API response | Global store hoặc query cache |

### Quy tắc
- Không truyền data qua nhiều tầng — dùng store
- Không duplicate: cùng data không lưu 2 nơi
- Setter function bắt buộc — không gán state trực tiếp
- Derived data: tính từ state, không lưu riêng
- Reset state khi logout hoàn toàn

---

## 7. HTTP CLIENT / DATABASE CLIENT

**Nguyên tắc:** 1 instance duy nhất — không tạo nhiều.

### Frontend
```js
// api/http.js — 1 file, 1 instance
const http = axios.create({ baseURL, timeout })
// Tất cả config tại đây, không config từng call
```

### Backend
- 1 DB connection pool — không tạo connection mới mỗi request
- 1 Redis client singleton
- 1 HTTP client cho external APIs
- Connection pool size: `(CPU cores × 2) + 1`
- Timeout bắt buộc cho mọi external call

---

## 8. LOGGING

**Nguyên tắc:** Structured JSON, tập trung, phân level rõ ràng.

### Format chuẩn
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "ERROR",
  "message": "Payment failed",
  "trace_id": "abc-123",
  "user_id": "456",
  "context": { "amount": 100, "method": "card" }
}
```

### Log Levels
| Level | Khi nào |
|-------|---------|
| ERROR | Cần alert ngay, ảnh hưởng user |
| WARN  | Cần theo dõi, chưa ảnh hưởng |
| INFO  | Business events quan trọng |
| DEBUG | Chỉ bật dev, tắt production |

### Tuyệt đối không log
- Password, token, API keys
- Credit card, thông tin thanh toán
- PII: CMND, số điện thoại đầy đủ, địa chỉ
- Query params chứa sensitive data

---

## 9. SECURITY

**Nguyên tắc:** Defense in depth — bảo vệ nhiều lớp.

### Frontend
- CSP headers: chặn XSS
- Sanitize HTML trước khi render dynamic content
- Không lưu sensitive data trong localStorage
- HTTPS only — redirect HTTP
- Dependency audit: `npm audit` trước mỗi deploy

### Backend
- Parameterized queries — không string concat SQL
- Rate limiting: theo IP + user + endpoint
- CORS: whitelist domain cụ thể, không `*` production
- Security headers: `Helmet.js` hoặc tương đương
- Input size limit: chặn payload quá lớn
- Secrets: environment variables — không hardcode, không commit

### Sensitive Operations
- Đổi password: yêu cầu password cũ
- Xóa tài khoản: confirm + cooldown period
- Thao tác tài chính: re-authenticate
- Admin actions: audit log bắt buộc

---

## 10. DATABASE ACCESS (Backend)

**Nguyên tắc:** Repository pattern — không query thẳng trong controller.

### Layered Architecture
```
Request → Controller → Service → Repository → Database
```

### Quy tắc
- Query chỉ viết trong Repository layer
- Business logic chỉ trong Service layer
- Controller chỉ: nhận request, gọi service, trả response
- Transaction xử lý ở Service layer
- Không raw SQL trong business logic trừ optimize đặc biệt
- Index bắt buộc: foreign keys, cột WHERE/ORDER BY thường dùng
- Không SELECT * — chỉ query cột cần thiết
- Pagination bắt buộc — không query unbounded

### N+1 Prevention
```python
# ❌ N+1
users = db.query(User).all()
for user in users:
    orders = db.query(Order).filter_by(user_id=user.id).all()

# ✅ Eager load
users = db.query(User).options(joinedload(User.orders)).all()
```

---

## 11. PERFORMANCE

### Frontend
- Code splitting theo route — lazy load
- Debounce: search input 300ms, resize 100ms
- Throttle: scroll events 100ms
- Cache API responses khi data ít thay đổi
- Bundle size: audit trước deploy, cảnh báo nếu chunk > 250KB
- Images: lazy load, WebP format, đúng kích thước
- Không re-render toàn bộ khi chỉ cần update một phần

### Backend
- Cache: Redis cho data đọc nhiều ghi ít
- Cache TTL rõ ràng — không cache vô thời hạn
- Background jobs: queue cho tác vụ nặng (email, report, export)
- API response target: < 200ms p95
- DB query target: < 50ms
- Async/await cho mọi I/O — không block event loop

---

## 12. ROUTER & NAVIGATION (Frontend)

**Nguyên tắc:** Guard tập trung — không check auth trong từng page.

### Quy tắc
- Auth guard: 1 hàm duy nhất, chạy trước mọi protected route
- Permission guard: kiểm tra role/permission theo route config
- Active menu, page title: cập nhật tự động theo route
- Không `location.href` hay `location.hash` rải rác trong module
- Redirect sau login: về trang user định vào, không về dashboard mặc định

### Route Config tập trung
```js
const routes = {
  '#/dashboard': { module: () => import('./dashboard'), auth: true },
  '#/users':     { module: () => import('./users'), auth: true, roles: ['admin'] },
  '#/login':     { module: () => import('./login'), auth: false }
}
```

---

## 13. TESTING

**Nguyên tắc:** Test những gì quan trọng nhất — không test vì số liệu.

### Ưu tiên test
1. Business logic phức tạp (tính toán, rules)
2. Authentication flow
3. API integration
4. Edge cases: empty, null, max length, special chars

### Backend
- Unit test: Service layer (business logic)
- Integration test: API endpoints
- Không test framework, không test getter/setter đơn giản
- Mock external services: payment, SMS, email

### Frontend
- Unit test: utils, validators, formatters
- Integration test: API calls với mock server
- Không test implementation details — test behavior

### Cấu trúc test
```
tests/
├── unit/        # Logic thuần, không dependency
├── integration/ # API, DB với test database
└── e2e/         # Critical user flows
```

---

## 14. CODE STRUCTURE & NAMING

### Naming Convention
```
camelCase    → variables, functions, methods
PascalCase   → classes, components, types
UPPER_SNAKE  → constants
kebab-case   → file names, CSS classes, URL slugs
```

### File Organization
- 1 file = 1 responsibility
- Không file > 300 dòng — split nếu vượt
- Index file chỉ để export, không chứa logic
- Circular dependency: không cho phép

### Function Rules
- Tối đa 15-20 dòng
- Tối đa 3 parameters — dùng object nếu cần nhiều hơn
- Pure function khi có thể
- Không side effects ẩn

---

## 15. GIT & DEPLOYMENT

### Commit Convention
```
feat:     tính năng mới
fix:      sửa bug
refactor: cải thiện code không thay đổi behavior
perf:     cải thiện performance
chore:    cấu hình, dependencies
```

### Branch Strategy
```
main        → production only, merge qua PR
develop     → integration branch
feature/*   → tính năng mới
hotfix/*    → fix khẩn cấp production
```

### Trước mỗi deploy production
- [ ] `npm audit` / `pip-audit` không có critical vulnerability
- [ ] Không có `console.log`, `print`, `debugger` trong code
- [ ] `.env.production` đã set đúng
- [ ] Database migration đã test trên staging
- [ ] Rollback plan sẵn sàng
- [ ] Health check endpoint hoạt động
- [ ] Bundle size không tăng bất thường

---

## ANTI-PATTERNS — TUYỆT ĐỐI TRÁNH

### Frontend
- Gọi API trực tiếp trong component thay vì qua api module
- Lưu token vào nhiều nơi khác nhau
- Xử lý lỗi riêng ở mỗi component
- Hardcode URL, magic numbers trong template
- Tạo nhiều axios instances
- Subscribe event listener không cleanup

### Backend
- Business logic trong controller
- Raw SQL trong service/controller
- Không validate input từ client
- Catch Exception quá rộng rồi bỏ qua
- Blocking I/O trong async function
- Commit secret vào git
- Auto-migrate production khi start app

---

## TÓM TẮT — NGUYÊN TẮC VÀNG

| Thứ | Tập trung ở đâu | Không được |
|-----|----------------|-----------|
| API endpoints | `constants/api.js` | Hardcode URL |
| Error handling | Interceptor / Global handler | try/catch rải rác |
| Auth token | `utils/auth.js` + Middleware | Gọi localStorage trực tiếp |
| Validation | Schema layer riêng | Validate inline |
| Constants | `constants/index.js` / `.env` | Magic number/string |
| Logging | Logger singleton | console.log production |
| DB query | Repository layer | Query trong controller |
| HTTP client | 1 instance duy nhất | Tạo nhiều instances |
| State | Store tập trung | Duplicate state |
| Route guard | Router middleware | Check auth trong page |
| Business logic | Service layer | Controller / Repository |
| Security headers | Middleware tập trung | Per-route |
| Config | `.env` + `config/` | Hardcode trong code |

> **Quy tắc tối thượng:** Bất kỳ thứ gì xuất hiện 2 lần → extract ra module tập trung.
> Logic quan trọng không được phép nằm rải rác.
> Đọc code không cần giải thích — tên biến, tên hàm phải tự nói lên ý nghĩa.
