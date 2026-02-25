# CLAUDE.md — Layui 2.13.3 SPA Frontend

Commit all tiếng việt offline

> **BẮT BUỘC:** Luôn đọc `CODING_STANDARDS.md` (root project) — coi như CLAUDE.md thứ 2.
> File đó chứa quy tắc chung FE + BE: API contracts, error handling, auth, validation, security, performance, naming...

## STACK
Layui 2.13.3 | Axios 1.x | Vite 5.x | Vanilla JS ES2022

## TÀI LIỆU THAM KHẢO
- Docs chính thức: https://layui.dev/docs/2/
- Changelog 2.13.3: https://layui.dev/docs/2/versions.html#v2.13.3
- GitHub: https://github.com/layui/layui
- NPM: https://www.npmjs.com/package/layui
- Axios: https://axios-http.com/docs/intro
- Vite: https://vitejs.dev/guide/
- Tài liệu offline: `FRONTEND/docs/`, `FRONTEND/examples/`

## ICONS — LOCAL (BẮT BUỘC)

**Toàn bộ icon dùng local từ `public/icons/` (PNG, style Icons8 Fluency).**
- Nguồn tải: `C:\Users\Admin\Desktop\icons8-download\icons8-fluency\`
- Khi cần icon mới → vào thư mục trên tìm file → copy vào `public/icons/` → đổi tên cho đúng nghĩa
- Script tải thêm: `download-icons.mjs`, `download-business-icons.mjs` (root project)
- Vite serve tại: `/icons/ten-file.png`
- KHÔNG dùng CDN icon, KHÔNG dùng icon URL bên ngoài, KHÔNG dùng SVG (không có màu)
- **Đổi tên file cho đúng nghĩa trước khi sử dụng** (ví dụ: `user-male-circle.png` → `avatar.png`)
- Dùng kết hợp: layui-icon cho icon hệ thống form, PNG local cho icon trang trí/minh hoạ

**Cách dùng trong HTML:**
```html
<img src="/icons/dashboard.png" alt="Dashboard" width="24" height="24">
```

---

## KIỂM TRA SAU KHI VIẾT CODE (BẮT BUỘC)

Mỗi lần viết code xong, **tự kiểm tra lại toàn bộ** theo checklist:

### Layui 2.13.3
- [ ] HTML structure đúng chuẩn gốc Layui (form, layout, nav, table...)
- [ ] Admin layout dùng `layui-layout-admin` + `layui-header` + `layui-side` + `layui-body`
- [ ] `layui.use` dùng positional args: `function (form, layer)`, KHÔNG destructure object
- [ ] `form.render()` sau mỗi lần thay đổi DOM chứa form elements
- [ ] **KHÔNG dùng `!important`** — mọi thay đổi CSS sửa trực tiếp trong source `public/layui/css/layui.css`
- [ ] **KHÔNG override CSS gốc Layui bằng file riêng** — sửa thẳng source, build lại

### SPA Architecture
- [ ] Layout render 1 lần — module chỉ swap nội dung trong content area
- [ ] Public route render trực tiếp `#app`, private route render trong layout
- [ ] Không có logic/state duplicate giữa layout và module
- [ ] Event listener cleanup khi unmount module
- [ ] **Mỗi module PHẢI export `destroy()`** — dù rỗng, router gọi `currentModule?.destroy()`
- [ ] Mọi user data trong `innerHTML` PHẢI qua `escapeHtml()` — kể cả `error.message`
- [ ] File không vượt 300 dòng — split nếu cần

### Axios 1.x
- [ ] 1 instance duy nhất (`http.js`), không tạo thêm
- [ ] Token inject qua request interceptor, không set thủ công
- [ ] Lỗi 401 xử lý tập trung ở response interceptor

### Vite 5.x
- [ ] Import path đúng (có `.js` extension cho local modules)
- [ ] Static assets trong `public/`, không trong `app/`
- [ ] Lazy load module theo route: `() => import('../modules/x/index.js')`

### Icons
- [ ] Chỉ dùng local từ `public/icons/` — KHÔNG CDN, KHÔNG URL ngoài
- [ ] Đổi tên file cho đúng nghĩa trước khi dùng
- [ ] layui-icon cho icon hệ thống form, PNG local cho icon trang trí/minh hoạ

### Vanilla JS ES2022
- [ ] `const`/`let` only, zero `var`
- [ ] Zero: inline style, console.log, magic number/string, dead code
- [ ] Named constants từ `constants/index.js`
- [ ] **Token chỉ đọc qua `getToken()`** — KHÔNG `localStorage.getItem('token')` trực tiếp
- [ ] Layui `table.render({ headers })` dùng `getToken()`, không `localStorage.getItem`
- [ ] Không import module mà không sử dụng (unused imports)

---

## ⛔ TUYỆT ĐỐI KHÔNG OVERRIDE CSS

**KHÔNG BAO GIỜ ĐƯỢC OVERRIDE thuộc tính CSS gốc Layui bằng file riêng.**
- Cần sửa `left`, `top`, `padding`, `background`... của Layui → **sửa thẳng trong `src/css/layui.css` (SOURCE)**
- Cần thêm thuộc tính mới (custom class, animation) → OK viết trong file CSS riêng
- KHÔNG dùng `!important`
- KHÔNG dùng ID selector hay specificity trick để "thắng" Layui CSS
- Nếu bị conflict → tìm đúng rule gốc trong `src/css/layui.css` → sửa tại đó

## ⛔ KHÔNG SỬA DIST — CHỈ SỬA SOURCE

**TUYỆT ĐỐI KHÔNG sửa file trong `public/layui/` (dist) trực tiếp.**
- Source: `src/css/layui.css`, `src/css/modules/`
- Dist: `public/layui/css/layui.css`, `public/layui/css/modules/`
- Quy trình: **Sửa source (`src/css/`) → Copy sang dist (`public/layui/css/`)**
- Copy lệnh: `cp src/css/layui.css public/layui/css/layui.css`

---

## QUY TẮC BẮT BUỘC

### Code Quality
- Zero: code thừa, comment, console.log, TODO, placeholder, dead code
- Zero: inline style — chỉ dùng CSS class
- Zero: `var` — chỉ dùng `const`/`let`
- Zero: `any` nếu dùng TypeScript
- Mỗi function: 1 nhiệm vụ, tối đa 15 dòng
- DRY: lặp 2+ lần → extract ngay
- Early return, không nested if/else
- Named constants cho mọi magic number/string
- Không jQuery, không thư viện ngoài chưa được duyệt

### Naming Convention
```
camelCase    → variables, functions
PascalCase   → classes, components
UPPER_SNAKE  → constants
kebab-case   → CSS classes, file names
```

---

## CẤU TRÚC DỰ ÁN

```
src/
├── api/
│   ├── http.js          # axios instance + interceptors duy nhất
│   └── [module].js      # endpoints theo từng module
├── router/
│   └── index.js         # hash-based SPA router
├── store/
│   └── index.js         # global state thuần JS
├── modules/
│   └── [feature]/
│       ├── index.js     # render + logic
│       └── index.css    # styles riêng
├── utils/
│   └── index.js         # helpers dùng chung
├── constants/
│   └── index.js         # toàn bộ hằng số
└── main.js              # entry point
```

---

## LAYUI 2.13.3 — CHUẨN SỬ DỤNG

### Load Module
```js
// ✅ Đúng — positional args, load 1 lần
layui.use(['table', 'form', 'layer'], function (table, form, layer) {
  // logic ở đây
})

// ❌ Sai — destructure object (layui truyền positional, KHÔNG truyền object)
layui.use(['form', 'layer'], ({ form, layer }) => { ... })

// ❌ Sai — load lại nhiều lần
layui.use('table', ...)
layui.use('form', ...)
```

### Table
```js
table.render({
  elem: '#tableId',
  url: API.LIST,
  headers: { Authorization: getToken() },
  cols: [[
    { field: 'id', title: 'ID', width: 80 },
    { field: 'name', title: 'Tên' },
    { toolbar: '#toolbar', title: 'Thao tác', width: 150 }
  ]],
  page: true,
  limit: PAGE_SIZE,
  limits: [10, 20, 50]
})

// Reload giữ nguyên trang
table.reload('tableId', { where: filters })
```

### Form — LƯU Ý QUAN TRỌNG

**LUÔN dùng cấu trúc HTML chuẩn gốc Layui, sau đó mới cải tiến thành SPA.**
- Tham khảo docs: https://layui.dev/docs/2/form.html
- Tham khảo source: `FRONTEND/docs/form/`, `FRONTEND/examples/form.html`
- Tham khảo CSS gốc: `FRONTEND/src/css/layui.css`
- KHÔNG tự chế HTML structure — phải đúng nesting mà Layui yêu cầu
- Chỉ thêm CSS class bổ sung, KHÔNG override CSS gốc của Layui

**Cấu trúc input chuẩn (có icon prefix/suffix):**
```html
<div class="layui-form-item">
  <div class="layui-input-wrap">
    <div class="layui-input-prefix">
      <i class="layui-icon layui-icon-username"></i>
    </div>
    <input type="text" name="username" class="layui-input"
      lay-verify="required" placeholder="Tên đăng nhập" lay-affix="clear">
  </div>
</div>
```

**Password với toggle eye (dùng lay-affix, KHÔNG tự code):**
```html
<div class="layui-input-wrap">
  <div class="layui-input-prefix">
    <i class="layui-icon layui-icon-password"></i>
  </div>
  <input type="password" name="password" class="layui-input"
    lay-verify="required" placeholder="Mật khẩu" lay-affix="eye">
</div>
```

**Nút submit full-width:**
```html
<button class="layui-btn layui-btn-fluid" lay-submit lay-filter="filterName">
  Đăng nhập
</button>
```

```js
// lay-filter bắt buộc trên mỗi form
form.on('submit(filterName)', ({ field }) => {
  if (!field.name) return layer.msg('Thiếu tên')
  submitData(field)
  return false
})

// Render lại sau khi thay đổi DOM
form.render()
```

### Layer
```js
// Thông báo
layer.msg('Thành công', { icon: 1 })
layer.msg('Lỗi', { icon: 2 })

// Xác nhận
layer.confirm('Bạn chắc chắn?', { icon: 3 }, (idx) => {
  doAction()
  layer.close(idx)
})

// Mở popup iframe
layer.open({
  type: 2,
  title: 'Chi tiết',
  area: ['800px', '600px'],
  content: '#/detail'
})
```

### Upload
```js
upload.render({
  elem: '#uploadBtn',
  url: API.UPLOAD,
  headers: { Authorization: getToken() },
  accept: 'file',
  size: MAX_FILE_SIZE,
  done: ({ code, data }) => {
    if (code !== 0) return layer.msg('Upload thất bại')
    handleUploadSuccess(data)
  }
})
```

### Laydate
```js
laydate.render({
  elem: '#dateInput',
  type: 'datetime',
  format: 'yyyy-MM-dd HH:mm:ss',
  done: (value) => handleDateChange(value)
})
```

---

## API & AXIOS

### Instance Duy Nhất
```js
// src/api/http.js
import axios from 'axios'
import { getToken, clearToken } from '../utils'
import { STORAGE_KEY } from '../constants'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  ({ data }) => {
    if (data.code !== 0) return Promise.reject(data)
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      location.hash = '#/login'
    }
    return Promise.reject(error)
  }
)

export default http
```

### Module API
```js
// src/api/user.js
import http from './http'

export const userApi = {
  list:   (params) => http.get('/users', { params }),
  create: (data)   => http.post('/users', data),
  update: (id, data) => http.put(`/users/${id}`, data),
  remove: (id)     => http.delete(`/users/${id}`)
}
```

---

## ROUTER

```js
// src/router/index.js
const ROUTES = {
  '#/dashboard': () => import('../modules/dashboard'),
  '#/users':     () => import('../modules/users'),
  '#/login':     () => import('../modules/login')
}

const PUBLIC_ROUTES = new Set(['#/login'])

const getHash = () => location.hash || '#/dashboard'

const guard = (hash) => {
  if (PUBLIC_ROUTES.has(hash)) return true
  return !!getToken()
}

const navigate = async (hash = getHash()) => {
  if (!guard(hash)) return (location.hash = '#/login')
  const mod = ROUTES[hash]
  if (!mod) return (location.hash = '#/dashboard')
  const { render } = await mod()
  document.getElementById('main-content').innerHTML = ''
  render()
  setActiveMenu(hash)
}

window.addEventListener('hashchange', () => navigate())
export { navigate }
```

---

## STATE MANAGEMENT

```js
// src/store/index.js
const state = {
  user: null,
  token: localStorage.getItem('token') || null
}

const listeners = {}

const emit = (key) => listeners[key]?.forEach((fn) => fn(state[key]))

export const store = {
  get: (key) => state[key],
  set: (key, value) => {
    state[key] = value
    emit(key)
  },
  on: (key, fn) => {
    listeners[key] = listeners[key] || []
    listeners[key].push(fn)
  }
}
```

---

## PERFORMANCE

- Lazy load module theo route: `import('../modules/x')`
- Layui modules cache: load 1 lần, không gọi lại `layui.use`
- Debounce search input: 300ms
- Throttle scroll/resize: 100ms
- Table reload thay vì re-render toàn bộ
- Cleanup event listener khi unmount module

```js
// Debounce utility
const debounce = (fn, ms) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
```

---

## VITE CONFIG

```js
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    build: {
      target: 'es2022',
      minify: 'terser',
      sourcemap: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            layui: ['layui'],
            axios: ['axios']
          }
        }
      }
    },
    server: {
      proxy: {
        '/api': { target: env.VITE_API_BASE, changeOrigin: true }
      }
    }
  }
})
```

---

## CONSTANTS

```js
// src/constants/index.js
export const PAGE_SIZE     = 20
export const MAX_FILE_SIZE = 5 * 1024  // 5MB (KB đơn vị layui)
export const TOKEN_KEY     = 'token'
export const DATE_FORMAT   = 'yyyy-MM-dd HH:mm:ss'
export const API_CODE_OK   = 0

export const API = {
  LOGIN:  '/api/auth/login',
  UPLOAD: '/api/upload'
}
```

---

## UTILS

```js
// src/utils/index.js
import { TOKEN_KEY } from '../constants'

export const getToken  = () => localStorage.getItem(TOKEN_KEY)
export const setToken  = (v) => localStorage.setItem(TOKEN_KEY, v)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export const debounce = (fn, ms = 300) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

export const throttle = (fn, ms = 100) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    fn(...args)
  }
}

export const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN')
```

---

## MODULE PATTERN

```js
// src/modules/users/index.js
import { userApi } from '../../api/user'
import { PAGE_SIZE } from '../../constants'

let tableIns = null

const initTable = () => {
  layui.use(['table', 'layer'], ({ table, layer }) => {
    tableIns = table.render({
      elem: '#userTable',
      url: '/api/users',
      cols: [[
        { field: 'id', title: 'ID', width: 80 },
        { field: 'name', title: 'Tên' },
        { field: 'status', title: 'Trạng thái' },
        { toolbar: '#userToolbar', title: '', width: 150 }
      ]],
      page: true,
      limit: PAGE_SIZE
    })

    table.on('toolbar(userTable)', ({ event, data }) => {
      if (event === 'edit') openEditModal(data)
      if (event === 'del') confirmDelete(data.id)
    })
  })
}

const confirmDelete = (id) => {
  layui.use('layer', ({ layer }) => {
    layer.confirm('Xoá người dùng này?', { icon: 3 }, async (idx) => {
      await userApi.remove(id)
      layer.close(idx)
      tableIns.reload()
    })
  })
}

export const render = () => {
  document.getElementById('main-content').innerHTML = `
    <div class="layui-card">
      <table id="userTable" lay-filter="userTable"></table>
      <script type="text/html" id="userToolbar">
        <a class="layui-btn layui-btn-xs" lay-event="edit">Sửa</a>
        <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">Xoá</a>
      </script>
    </div>
  `
  initTable()
}
```

---

## PRODUCTION CHECKLIST

- [ ] `NODE_ENV=production` trong `.env.production`
- [ ] Không có `console.log` trong source
- [ ] `sourcemap: false` trong vite.config
- [ ] Token không log ra bất kỳ đâu
- [ ] API errors hiển thị qua `layer.msg`, không alert
- [ ] Bundle size audit: `vite build --report`
- [ ] CORS whitelist đúng domain production
- [ ] HTTP → HTTPS redirect ở nginx/server

---

## SKILL: CÁCH DÙNG FILE NÀY VỚI CLAUDE

Khi bắt đầu session mới, paste vào đầu prompt:

```
Đọc và tuân thủ toàn bộ quy tắc trong CLAUDE.md đính kèm.
Tài liệu Layui: https://layui.dev/docs/2/
Version: 2.13.3

Yêu cầu: [mô tả tính năng cần làm]
```

Claude sẽ:
1. Đọc CLAUDE.md trước khi viết code
2. Tạo skeleton → trình bày → được duyệt → implement
3. Implement từng module, test được mới sang tiếp
4. Không thay đổi code đã làm tốt
5. Báo breaking risk trước khi sửa

---

*Layui 2.13.3 — Final major release of 2.x series (Nov 2024)*