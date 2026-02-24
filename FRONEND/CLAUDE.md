# CLAUDE.md — Layui 2.13.3 SPA Frontend


Commit all tiếng việt offline



## STACK
Layui 2.13.3 | Axios 1.x | Vite 5.x | Vanilla JS ES2022

## TÀI LIỆU THAM KHẢO
- Docs chính thức: https://layui.dev/docs/2/
- Changelog 2.13.3: https://layui.dev/docs/2/versions.html#v2.13.3
- GitHub: https://github.com/layui/layui
- NPM: https://www.npmjs.com/package/layui
- Axios: https://axios-http.com/docs/intro
- Vite: https://vitejs.dev/guide/

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
// ✅ Đúng — load 1 lần, cache lại
layui.use(['table', 'form', 'layer'], ({ table, form, layer }) => {
  // logic ở đây
})

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

### Form
```js
// lay-filter bắt buộc trên mỗi form
form.on('submit(filterName)', ({ field }) => {
  // validate phía client trước
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