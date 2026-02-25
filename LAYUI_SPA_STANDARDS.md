# 🎯 LAYUI + VANILLA JS SPA CODING STANDARDS
## Chuẩn code công nghiệp cho Layui 2.13.3 | Axios 1.x | Vite 5.x | ES2022

---

## 1. PROJECT STRUCTURE (SPA)

```
project/
├── public/
│   └── favicon.ico
├── index.html                  # Single entry point
├── src/
│   ├── main.js                 # App bootstrap
│   ├── app.js                  # App core
│   │
│   ├── config/
│   │   ├── index.js
│   │   ├── constants.js        # APP_NAME, API_URL, PAGE_SIZE...
│   │   └── api.endpoints.js    # API endpoints map
│   │
│   ├── core/
│   │   ├── router.js           # SPA Router (hash-based)
│   │   ├── store.js            # Global state management
│   │   ├── eventBus.js         # Pub/Sub events
│   │   └── component.js        # Base component class
│   │
│   ├── api/
│   │   ├── http.js             # Axios instance + interceptors
│   │   ├── auth.api.js
│   │   ├── user.api.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── auth.service.js     # Login, logout, token
│   │   ├── storage.service.js  # LocalStorage wrapper
│   │   └── notify.service.js   # layer.msg wrapper
│   │
│   ├── pages/
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── users/
│   │   │   ├── index.js        # List
│   │   │   └── form.js         # Create/Edit
│   │   └── not-found.js
│   │
│   ├── components/
│   │   ├── layout.js           # Main layout (header + sidebar + content)
│   │   ├── sidebar.js
│   │   ├── header.js
│   │   ├── data-table.js       # Reusable layui table
│   │   └── confirm-modal.js
│   │
│   ├── utils/
│   │   ├── dom.js              # $, $$, createElement...
│   │   ├── format.js           # formatDate, formatMoney...
│   │   ├── validate.js         # Form validators
│   │   └── helpers.js
│   │
│   └── styles/
│       ├── main.css
│       ├── variables.css
│       └── layui-overrides.css
│
├── vite.config.js
├── package.json
└── .env
```

---

## 2. NAMING CONVENTIONS

```javascript
// ✅ ĐÚNG

// Files: kebab-case
user-list.js
data-table.js
auth.service.js
format.utils.js

// Classes: PascalCase
class UserListPage {}
class DataTable {}
class Router {}

// Functions, variables: camelCase
function getUserById(id) {}
const isLoading = false;
const currentUser = null;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '/api/v1';
const MAX_PAGE_SIZE = 100;
const TOKEN_KEY = 'access_token';

// Private: prefix _
class MyClass {
    _privateMethod() {}
    _internalState = {};
}

// Event handlers: prefix handle hoặc on
const handleSubmit = () => {};
const onTableRowClick = () => {};

// Boolean: prefix is, has, can, should
const isVisible = true;
const hasPermission = false;
const canEdit = true;

// API functions: prefix theo HTTP method
const getUsers = () => {};
const createUser = () => {};
const updateUser = () => {};
const deleteUser = () => {};

// ❌ SAI
const UserList = () => {};      // Function không phải class
class userService {}            // Class phải PascalCase  
const apibaseurl = '';          // Constant phải UPPER_CASE
```

---

## 3. CORE MODULES

### 3.1 Router (Hash-based SPA)

```javascript
// src/core/router.js

/**
 * Simple hash-based SPA Router
 */
class Router {
    #routes = new Map();
    #currentRoute = null;
    #beforeEachGuards = [];
    #afterEachHooks = [];

    constructor() {
        window.addEventListener('hashchange', () => this.#handleRouteChange());
        window.addEventListener('load', () => this.#handleRouteChange());
    }

    /**
     * Đăng ký route
     * @param {string} path - Route path (e.g., '/users', '/users/:id')
     * @param {Function} handler - Page handler function
     * @param {Object} meta - Route metadata (title, requiresAuth...)
     */
    register(path, handler, meta = {}) {
        this.#routes.set(path, { handler, meta });
        return this;
    }

    /**
     * Đăng ký nhiều routes
     * @param {Array} routes - Array of route objects
     */
    registerAll(routes) {
        routes.forEach(({ path, handler, meta }) => {
            this.register(path, handler, meta);
        });
        return this;
    }

    /**
     * Navigation guard - chạy trước mỗi route change
     * @param {Function} guard - (to, from, next) => {}
     */
    beforeEach(guard) {
        this.#beforeEachGuards.push(guard);
        return this;
    }

    /**
     * Hook sau khi route change
     * @param {Function} hook - (to, from) => {}
     */
    afterEach(hook) {
        this.#afterEachHooks.push(hook);
        return this;
    }

    /**
     * Navigate to path
     * @param {string} path 
     * @param {Object} params - Query params
     */
    push(path, params = {}) {
        const query = new URLSearchParams(params).toString();
        window.location.hash = query ? `${path}?${query}` : path;
    }

    /**
     * Replace current route (no history)
     */
    replace(path, params = {}) {
        const query = new URLSearchParams(params).toString();
        const hash = query ? `${path}?${query}` : path;
        window.location.replace(`${window.location.pathname}#${hash}`);
    }

    /**
     * Get current route info
     */
    get current() {
        return this.#currentRoute;
    }

    /**
     * Get query params
     */
    get query() {
        const hash = window.location.hash.slice(1);
        const [, queryString] = hash.split('?');
        return Object.fromEntries(new URLSearchParams(queryString || ''));
    }

    async #handleRouteChange() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        
        const { route, params } = this.#matchRoute(path);
        
        if (!route) {
            this.push('/404');
            return;
        }

        const to = { 
            path, 
            params, 
            query: Object.fromEntries(new URLSearchParams(queryString || '')),
            meta: route.meta 
        };
        const from = this.#currentRoute;

        // Run guards
        for (const guard of this.#beforeEachGuards) {
            const result = await guard(to, from);
            if (result === false) return;
            if (typeof result === 'string') {
                this.push(result);
                return;
            }
        }

        // Update current route
        this.#currentRoute = to;

        // Execute handler
        try {
            await route.handler(params, to.query);
        } catch (error) {
            console.error('[Router] Error:', error);
        }

        // Run after hooks
        this.#afterEachHooks.forEach(hook => hook(to, from));
    }

    #matchRoute(path) {
        for (const [pattern, route] of this.#routes) {
            const params = this.#matchPattern(pattern, path);
            if (params !== null) {
                return { route, params };
            }
        }
        return { route: null, params: {} };
    }

    #matchPattern(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }

        return params;
    }
}

export const router = new Router();
export default router;
```

### 3.2 Store (State Management)

```javascript
// src/core/store.js

/**
 * Simple reactive state management
 */
class Store {
    #state = {};
    #listeners = new Map();

    constructor(initialState = {}) {
        this.#state = this.#deepClone(initialState);
    }

    /**
     * Get state value
     * @param {string} key - Dot notation supported (e.g., 'user.profile.name')
     */
    get(key) {
        if (!key) return this.#deepClone(this.#state);
        return this.#getNestedValue(this.#state, key);
    }

    /**
     * Set state value
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        const oldValue = this.get(key);
        this.#setNestedValue(this.#state, key, value);
        this.#notify(key, value, oldValue);
    }

    /**
     * Update state với partial object
     * @param {string} key 
     * @param {Object} partial 
     */
    update(key, partial) {
        const current = this.get(key) || {};
        this.set(key, { ...current, ...partial });
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - (newValue, oldValue) => {}
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.#listeners.has(key)) {
            this.#listeners.set(key, new Set());
        }
        this.#listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            this.#listeners.get(key)?.delete(callback);
        };
    }

    /**
     * Reset state
     */
    reset(initialState = {}) {
        this.#state = this.#deepClone(initialState);
        this.#listeners.forEach((callbacks, key) => {
            callbacks.forEach(cb => cb(this.get(key), undefined));
        });
    }

    #notify(key, newValue, oldValue) {
        // Notify exact key listeners
        this.#listeners.get(key)?.forEach(cb => cb(newValue, oldValue));
        
        // Notify parent key listeners
        const parts = key.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentKey = parts.slice(0, i).join('.');
            this.#listeners.get(parentKey)?.forEach(cb => cb(this.get(parentKey)));
        }

        // Notify root listeners
        this.#listeners.get('*')?.forEach(cb => cb(this.#state));
    }

    #getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    #setNestedValue(obj, path, value) {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((acc, part) => {
            if (acc[part] === undefined) acc[part] = {};
            return acc[part];
        }, obj);
        target[last] = value;
    }

    #deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}

// Global store instance
export const store = new Store({
    auth: {
        user: null,
        token: null,
        isAuthenticated: false,
    },
    ui: {
        isLoading: false,
        sidebarCollapsed: false,
    },
});

export default store;
```

### 3.3 Event Bus

```javascript
// src/core/eventBus.js

/**
 * Pub/Sub Event Bus
 */
class EventBus {
    #events = new Map();

    /**
     * Subscribe to event
     * @param {string} event 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.#events.has(event)) {
            this.#events.set(event, new Set());
        }
        this.#events.get(event).add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Subscribe once
     */
    once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * Unsubscribe
     */
    off(event, callback) {
        this.#events.get(event)?.delete(callback);
    }

    /**
     * Emit event
     */
    emit(event, ...args) {
        this.#events.get(event)?.forEach(cb => {
            try {
                cb(...args);
            } catch (error) {
                console.error(`[EventBus] Error in "${event}" handler:`, error);
            }
        });
    }

    /**
     * Clear all listeners for event
     */
    clear(event) {
        if (event) {
            this.#events.delete(event);
        } else {
            this.#events.clear();
        }
    }
}

export const eventBus = new EventBus();

// Event constants
export const EVENTS = {
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    USER_UPDATED: 'user:updated',
    TABLE_REFRESH: 'table:refresh',
    NOTIFY_SUCCESS: 'notify:success',
    NOTIFY_ERROR: 'notify:error',
};

export default eventBus;
```

---

## 4. API LAYER

### 4.1 HTTP Client (Axios)

```javascript
// src/api/http.js
import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../config/constants.js';
import { storage } from '../services/storage.service.js';
import { notify } from '../services/notify.service.js';
import { router } from '../core/router.js';
import { store } from '../core/store.js';

/**
 * Axios instance với interceptors
 */
const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
http.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = storage.get(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Show loading (optional)
        if (config.showLoading !== false) {
            store.set('ui.isLoading', true);
        }

        return config;
    },
    (error) => {
        store.set('ui.isLoading', false);
        return Promise.reject(error);
    }
);

// Response interceptor
http.interceptors.response.use(
    (response) => {
        store.set('ui.isLoading', false);
        return response.data;
    },
    (error) => {
        store.set('ui.isLoading', false);

        const { response } = error;

        if (!response) {
            notify.error('Lỗi kết nối mạng');
            return Promise.reject(error);
        }

        const { status, data } = response;

        switch (status) {
            case 401:
                // Token expired
                storage.remove(TOKEN_KEY);
                store.set('auth.isAuthenticated', false);
                router.push('/login');
                notify.warning('Phiên đăng nhập hết hạn');
                break;

            case 403:
                notify.error('Không có quyền truy cập');
                break;

            case 404:
                notify.error('Không tìm thấy dữ liệu');
                break;

            case 422:
                // Validation error
                const message = data?.errors 
                    ? Object.values(data.errors).flat().join('<br>')
                    : data?.message || 'Dữ liệu không hợp lệ';
                notify.error(message);
                break;

            case 500:
                notify.error('Lỗi hệ thống, vui lòng thử lại sau');
                break;

            default:
                notify.error(data?.message || 'Có lỗi xảy ra');
        }

        return Promise.reject(error);
    }
);

export { http };
export default http;
```

### 4.2 API Modules

```javascript
// src/api/auth.api.js
import http from './http.js';

export const authApi = {
    /**
     * Đăng nhập
     * @param {Object} credentials - { username, password }
     * @returns {Promise<{ user, token }>}
     */
    login: (credentials) => http.post('/auth/login', credentials),

    /**
     * Đăng xuất
     */
    logout: () => http.post('/auth/logout'),

    /**
     * Lấy thông tin user hiện tại
     */
    me: () => http.get('/auth/me'),

    /**
     * Refresh token
     */
    refresh: () => http.post('/auth/refresh'),
};


// src/api/user.api.js
import http from './http.js';

export const userApi = {
    /**
     * Lấy danh sách users
     * @param {Object} params - { page, limit, search, status }
     */
    getList: (params = {}) => http.get('/users', { params }),

    /**
     * Lấy chi tiết user
     * @param {number|string} id 
     */
    getById: (id) => http.get(`/users/${id}`),

    /**
     * Tạo user mới
     * @param {Object} data 
     */
    create: (data) => http.post('/users', data),

    /**
     * Cập nhật user
     * @param {number|string} id 
     * @param {Object} data 
     */
    update: (id, data) => http.put(`/users/${id}`, data),

    /**
     * Xóa user
     * @param {number|string} id 
     */
    delete: (id) => http.delete(`/users/${id}`),

    /**
     * Xóa nhiều users
     * @param {Array<number>} ids 
     */
    deleteMany: (ids) => http.post('/users/delete-many', { ids }),

    /**
     * Export Excel
     * @param {Object} params 
     */
    export: (params = {}) => http.get('/users/export', { 
        params, 
        responseType: 'blob' 
    }),
};


// src/api/index.js
export { authApi } from './auth.api.js';
export { userApi } from './user.api.js';
export { http } from './http.js';
```

---

## 5. SERVICES

### 5.1 Auth Service

```javascript
// src/services/auth.service.js
import { authApi } from '../api/index.js';
import { storage } from './storage.service.js';
import { store } from '../core/store.js';
import { eventBus, EVENTS } from '../core/eventBus.js';
import { TOKEN_KEY, USER_KEY } from '../config/constants.js';

export const authService = {
    /**
     * Đăng nhập
     */
    async login(credentials) {
        const { user, token } = await authApi.login(credentials);
        
        storage.set(TOKEN_KEY, token);
        storage.set(USER_KEY, user);
        
        store.set('auth.user', user);
        store.set('auth.token', token);
        store.set('auth.isAuthenticated', true);
        
        eventBus.emit(EVENTS.AUTH_LOGIN, user);
        
        return user;
    },

    /**
     * Đăng xuất
     */
    async logout() {
        try {
            await authApi.logout();
        } catch {
            // Ignore error
        }
        
        storage.remove(TOKEN_KEY);
        storage.remove(USER_KEY);
        
        store.set('auth.user', null);
        store.set('auth.token', null);
        store.set('auth.isAuthenticated', false);
        
        eventBus.emit(EVENTS.AUTH_LOGOUT);
    },

    /**
     * Kiểm tra đã đăng nhập
     */
    isAuthenticated() {
        return !!storage.get(TOKEN_KEY);
    },

    /**
     * Lấy user hiện tại
     */
    getCurrentUser() {
        return storage.get(USER_KEY);
    },

    /**
     * Khôi phục session từ storage
     */
    restoreSession() {
        const token = storage.get(TOKEN_KEY);
        const user = storage.get(USER_KEY);
        
        if (token && user) {
            store.set('auth.user', user);
            store.set('auth.token', token);
            store.set('auth.isAuthenticated', true);
            return true;
        }
        return false;
    },

    /**
     * Kiểm tra quyền
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        return user?.permissions?.includes(permission) || false;
    },

    /**
     * Kiểm tra role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    },
};

export default authService;
```

### 5.2 Storage Service

```javascript
// src/services/storage.service.js

/**
 * LocalStorage wrapper với JSON support
 */
export const storage = {
    /**
     * Get item
     * @param {string} key 
     * @param {any} defaultValue 
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    /**
     * Set item
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('[Storage] Error:', error);
            return false;
        }
    },

    /**
     * Remove item
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * Clear all
     */
    clear() {
        localStorage.clear();
    },

    /**
     * Check if key exists
     */
    has(key) {
        return localStorage.getItem(key) !== null;
    },
};

export default storage;
```

### 5.3 Notify Service (Layui layer)

```javascript
// src/services/notify.service.js

/**
 * Notification service sử dụng Layui layer
 */
export const notify = {
    /**
     * Success message
     */
    success(message, options = {}) {
        return layer.msg(message, {
            icon: 1,
            time: 2000,
            ...options,
        });
    },

    /**
     * Error message
     */
    error(message, options = {}) {
        return layer.msg(message, {
            icon: 2,
            time: 3000,
            ...options,
        });
    },

    /**
     * Warning message
     */
    warning(message, options = {}) {
        return layer.msg(message, {
            icon: 0,
            time: 2500,
            ...options,
        });
    },

    /**
     * Info message
     */
    info(message, options = {}) {
        return layer.msg(message, {
            icon: 6,
            time: 2000,
            ...options,
        });
    },

    /**
     * Loading
     */
    loading(message = 'Đang xử lý...') {
        return layer.load(2, { shade: [0.3, '#000'] });
    },

    /**
     * Close loading
     */
    closeLoading(index) {
        if (index) {
            layer.close(index);
        } else {
            layer.closeAll('loading');
        }
    },

    /**
     * Confirm dialog
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            layer.confirm(message, {
                icon: 3,
                title: options.title || 'Xác nhận',
                btn: options.btn || ['Đồng ý', 'Hủy'],
                ...options,
            }, (index) => {
                layer.close(index);
                resolve(true);
            }, () => {
                resolve(false);
            });
        });
    },

    /**
     * Alert dialog
     */
    alert(message, options = {}) {
        return new Promise((resolve) => {
            layer.alert(message, {
                icon: options.icon ?? 6,
                title: options.title || 'Thông báo',
                ...options,
            }, (index) => {
                layer.close(index);
                resolve();
            });
        });
    },

    /**
     * Open modal/popup
     */
    open(options) {
        return layer.open({
            type: 1,
            area: ['500px', 'auto'],
            shadeClose: false,
            ...options,
        });
    },

    /**
     * Close modal
     */
    close(index) {
        layer.close(index);
    },

    /**
     * Close all
     */
    closeAll(type) {
        layer.closeAll(type);
    },
};

export default notify;
```

---

## 6. PAGES & COMPONENTS

### 6.1 Base Page Pattern

```javascript
// src/pages/users/index.js
import { userApi } from '../../api/index.js';
import { notify } from '../../services/notify.service.js';
import { router } from '../../core/router.js';
import { formatDate, formatMoney } from '../../utils/format.js';
import { debounce } from '../../utils/helpers.js';

/**
 * User List Page
 */
export async function render(params, query) {
    const app = document.getElementById('app-content');
    
    // Render template
    app.innerHTML = `
        <div class="layui-card">
            <div class="layui-card-header">
                <h3>Quản lý người dùng</h3>
            </div>
            <div class="layui-card-body">
                <!-- Search form -->
                <form class="layui-form" id="searchForm">
                    <div class="layui-form-item">
                        <div class="layui-inline">
                            <input type="text" name="keyword" placeholder="Tìm kiếm..." 
                                   class="layui-input" autocomplete="off">
                        </div>
                        <div class="layui-inline">
                            <select name="status">
                                <option value="">-- Trạng thái --</option>
                                <option value="1">Hoạt động</option>
                                <option value="0">Khóa</option>
                            </select>
                        </div>
                        <div class="layui-inline">
                            <button type="submit" class="layui-btn">
                                <i class="layui-icon layui-icon-search"></i> Tìm kiếm
                            </button>
                            <button type="reset" class="layui-btn layui-btn-primary">
                                <i class="layui-icon layui-icon-refresh"></i> Reset
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Toolbar -->
                <div class="table-toolbar">
                    <button class="layui-btn layui-btn-sm" id="btnAdd">
                        <i class="layui-icon layui-icon-add-1"></i> Thêm mới
                    </button>
                    <button class="layui-btn layui-btn-sm layui-btn-danger" id="btnDeleteSelected">
                        <i class="layui-icon layui-icon-delete"></i> Xóa đã chọn
                    </button>
                    <button class="layui-btn layui-btn-sm layui-btn-warm" id="btnExport">
                        <i class="layui-icon layui-icon-export"></i> Xuất Excel
                    </button>
                </div>

                <!-- Table -->
                <table id="userTable" lay-filter="userTable"></table>
            </div>
        </div>
    `;

    // Initialize
    await initTable();
    bindEvents();
}

/**
 * Initialize Layui table
 */
async function initTable() {
    const { table } = layui;

    table.render({
        elem: '#userTable',
        url: '/api/users',
        method: 'get',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        parseData: (res) => ({
            code: res.code || 0,
            msg: res.message || '',
            count: res.data?.total || 0,
            data: res.data?.items || [],
        }),
        page: true,
        limit: 20,
        limits: [10, 20, 50, 100],
        toolbar: true,
        defaultToolbar: ['filter', 'print', 'exports'],
        cols: [[
            { type: 'checkbox', fixed: 'left' },
            { field: 'id', title: 'ID', width: 80, sort: true },
            { field: 'username', title: 'Tài khoản', width: 150 },
            { field: 'name', title: 'Họ tên', minWidth: 150 },
            { field: 'email', title: 'Email', minWidth: 200 },
            { 
                field: 'status', 
                title: 'Trạng thái', 
                width: 120,
                templet: (d) => d.status 
                    ? '<span class="layui-badge layui-bg-green">Hoạt động</span>'
                    : '<span class="layui-badge layui-bg-gray">Khóa</span>',
            },
            { 
                field: 'created_at', 
                title: 'Ngày tạo', 
                width: 160,
                templet: (d) => formatDate(d.created_at),
            },
            { 
                title: 'Thao tác', 
                width: 150, 
                fixed: 'right',
                toolbar: '#tableToolbar',
            },
        ]],
    });

    // Row toolbar template
    if (!document.getElementById('tableToolbar')) {
        const tpl = document.createElement('script');
        tpl.type = 'text/html';
        tpl.id = 'tableToolbar';
        tpl.innerHTML = `
            <button class="layui-btn layui-btn-xs" lay-event="edit">
                <i class="layui-icon layui-icon-edit"></i>
            </button>
            <button class="layui-btn layui-btn-xs layui-btn-danger" lay-event="delete">
                <i class="layui-icon layui-icon-delete"></i>
            </button>
        `;
        document.body.appendChild(tpl);
    }

    // Table events
    table.on('tool(userTable)', async ({ data, event }) => {
        switch (event) {
            case 'edit':
                router.push(`/users/${data.id}/edit`);
                break;
            case 'delete':
                await handleDelete(data.id);
                break;
        }
    });
}

/**
 * Bind page events
 */
function bindEvents() {
    const { form, table } = layui;

    // Search form
    form.on('submit(searchForm)', (data) => {
        table.reload('userTable', {
            where: data.field,
            page: { curr: 1 },
        });
        return false;
    });

    // Add button
    document.getElementById('btnAdd')?.addEventListener('click', () => {
        router.push('/users/create');
    });

    // Delete selected
    document.getElementById('btnDeleteSelected')?.addEventListener('click', async () => {
        const checkStatus = table.checkStatus('userTable');
        const ids = checkStatus.data.map(item => item.id);
        
        if (ids.length === 0) {
            notify.warning('Vui lòng chọn ít nhất 1 bản ghi');
            return;
        }

        await handleDeleteMany(ids);
    });

    // Export
    document.getElementById('btnExport')?.addEventListener('click', handleExport);
}

/**
 * Handle delete single
 */
async function handleDelete(id) {
    const confirmed = await notify.confirm('Bạn có chắc muốn xóa?');
    if (!confirmed) return;

    try {
        await userApi.delete(id);
        notify.success('Xóa thành công');
        layui.table.reload('userTable');
    } catch (error) {
        // Error handled by interceptor
    }
}

/**
 * Handle delete many
 */
async function handleDeleteMany(ids) {
    const confirmed = await notify.confirm(`Bạn có chắc muốn xóa ${ids.length} bản ghi?`);
    if (!confirmed) return;

    try {
        await userApi.deleteMany(ids);
        notify.success('Xóa thành công');
        layui.table.reload('userTable');
    } catch (error) {
        // Error handled by interceptor
    }
}

/**
 * Handle export
 */
async function handleExport() {
    const loadingIndex = notify.loading('Đang xuất file...');
    
    try {
        const blob = await userApi.export();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        notify.success('Xuất file thành công');
    } catch (error) {
        // Error handled by interceptor
    } finally {
        notify.closeLoading(loadingIndex);
    }
}

export default { render };
```

### 6.2 Form Page Pattern

```javascript
// src/pages/users/form.js
import { userApi } from '../../api/index.js';
import { notify } from '../../services/notify.service.js';
import { router } from '../../core/router.js';

/**
 * User Form Page (Create/Edit)
 */
export async function render(params, query) {
    const { id } = params;
    const isEdit = !!id;
    let userData = null;

    // Load data for edit
    if (isEdit) {
        try {
            userData = await userApi.getById(id);
        } catch {
            router.push('/users');
            return;
        }
    }

    const app = document.getElementById('app-content');
    
    app.innerHTML = `
        <div class="layui-card">
            <div class="layui-card-header">
                <h3>${isEdit ? 'Cập nhật' : 'Thêm mới'} người dùng</h3>
            </div>
            <div class="layui-card-body">
                <form class="layui-form" id="userForm" lay-filter="userForm">
                    <div class="layui-form-item">
                        <label class="layui-form-label">Tài khoản <span class="required">*</span></label>
                        <div class="layui-input-block">
                            <input type="text" name="username" 
                                   value="${userData?.username || ''}"
                                   lay-verify="required|username"
                                   placeholder="Nhập tài khoản"
                                   autocomplete="off"
                                   class="layui-input"
                                   ${isEdit ? 'disabled' : ''}>
                        </div>
                    </div>

                    <div class="layui-form-item">
                        <label class="layui-form-label">Họ tên <span class="required">*</span></label>
                        <div class="layui-input-block">
                            <input type="text" name="name" 
                                   value="${userData?.name || ''}"
                                   lay-verify="required"
                                   placeholder="Nhập họ tên"
                                   autocomplete="off"
                                   class="layui-input">
                        </div>
                    </div>

                    <div class="layui-form-item">
                        <label class="layui-form-label">Email <span class="required">*</span></label>
                        <div class="layui-input-block">
                            <input type="text" name="email" 
                                   value="${userData?.email || ''}"
                                   lay-verify="required|email"
                                   placeholder="Nhập email"
                                   autocomplete="off"
                                   class="layui-input">
                        </div>
                    </div>

                    ${!isEdit ? `
                    <div class="layui-form-item">
                        <label class="layui-form-label">Mật khẩu <span class="required">*</span></label>
                        <div class="layui-input-block">
                            <input type="password" name="password" 
                                   lay-verify="required|password"
                                   placeholder="Nhập mật khẩu"
                                   autocomplete="new-password"
                                   class="layui-input">
                        </div>
                    </div>
                    ` : ''}

                    <div class="layui-form-item">
                        <label class="layui-form-label">Trạng thái</label>
                        <div class="layui-input-block">
                            <input type="checkbox" name="status" 
                                   lay-skin="switch" 
                                   lay-text="Hoạt động|Khóa"
                                   ${userData?.status !== 0 ? 'checked' : ''}>
                        </div>
                    </div>

                    <div class="layui-form-item">
                        <div class="layui-input-block">
                            <button type="submit" class="layui-btn" lay-submit lay-filter="submitBtn">
                                <i class="layui-icon layui-icon-ok"></i> Lưu
                            </button>
                            <button type="button" class="layui-btn layui-btn-primary" id="btnCancel">
                                <i class="layui-icon layui-icon-return"></i> Quay lại
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    initForm(isEdit, id);
}

/**
 * Initialize form
 */
function initForm(isEdit, id) {
    const { form } = layui;

    // Custom validators
    form.verify({
        username: [/^[a-zA-Z0-9_]{3,20}$/, 'Tài khoản 3-20 ký tự, chỉ chứa chữ, số, _'],
        password: [/^.{6,}$/, 'Mật khẩu tối thiểu 6 ký tự'],
    });

    // Render form
    form.render();

    // Submit handler
    form.on('submit(submitBtn)', async (data) => {
        const formData = {
            ...data.field,
            status: data.field.status === 'on' ? 1 : 0,
        };

        const loadingIndex = notify.loading();

        try {
            if (isEdit) {
                await userApi.update(id, formData);
                notify.success('Cập nhật thành công');
            } else {
                await userApi.create(formData);
                notify.success('Thêm mới thành công');
            }
            router.push('/users');
        } catch (error) {
            // Error handled by interceptor
        } finally {
            notify.closeLoading(loadingIndex);
        }

        return false;
    });

    // Cancel button
    document.getElementById('btnCancel')?.addEventListener('click', () => {
        router.push('/users');
    });
}

export default { render };
```

---

## 7. UTILITIES

### 7.1 DOM Helpers

```javascript
// src/utils/dom.js

/**
 * Query selector shorthand
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * Create element with attributes
 */
export function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
        } else if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            el.setAttribute(key, value);
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    });

    return el;
}

/**
 * Add event listener với auto cleanup
 */
export function on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
}

/**
 * Delegate event
 */
export function delegate(parent, selector, event, handler) {
    parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e, target);
        }
    });
}

/**
 * Show/hide element
 */
export const show = (el) => el.style.display = '';
export const hide = (el) => el.style.display = 'none';
export const toggle = (el) => el.style.display = el.style.display === 'none' ? '' : 'none';

/**
 * Add/remove class
 */
export const addClass = (el, ...classes) => el.classList.add(...classes);
export const removeClass = (el, ...classes) => el.classList.remove(...classes);
export const toggleClass = (el, className, force) => el.classList.toggle(className, force);
export const hasClass = (el, className) => el.classList.contains(className);
```

### 7.2 Formatters

```javascript
// src/utils/format.js

/**
 * Format date
 * @param {string|Date} date 
 * @param {string} format - 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(date, format = 'DD/MM/YYYY HH:mm') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const pad = (n) => String(n).padStart(2, '0');

    const tokens = {
        YYYY: d.getFullYear(),
        MM: pad(d.getMonth() + 1),
        DD: pad(d.getDate()),
        HH: pad(d.getHours()),
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds()),
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => tokens[match]);
}

/**
 * Format money (VNĐ)
 */
export function formatMoney(value, suffix = 'đ') {
    if (value == null || isNaN(value)) return '';
    return Number(value).toLocaleString('vi-VN') + (suffix ? ` ${suffix}` : '');
}

/**
 * Format number với separator
 */
export function formatNumber(value, decimals = 0) {
    if (value == null || isNaN(value)) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    return phone;
}

/**
 * Truncate text
 */
export function truncate(text, length = 50, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.slice(0, length).trim() + suffix;
}
```

### 7.3 Helpers

```javascript
// src/utils/helpers.js

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Throttle function
 */
export function throttle(fn, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(deepClone);
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
    );
}

/**
 * Deep merge objects
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Sleep/delay
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate unique ID
 */
export function uniqueId(prefix = '') {
    return prefix + Math.random().toString(36).slice(2, 11);
}

/**
 * Parse query string
 */
export function parseQuery(queryString) {
    return Object.fromEntries(new URLSearchParams(queryString));
}

/**
 * Build query string
 */
export function buildQuery(params) {
    return new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
}

/**
 * Download file from blob
 */
export function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    }
}
```

---

## 8. APP BOOTSTRAP

```javascript
// src/main.js
import './styles/main.css';
import { router } from './core/router.js';
import { store } from './core/store.js';
import { authService } from './services/auth.service.js';
import { routes } from './router/routes.js';
import { authGuard } from './router/guards.js';

/**
 * Bootstrap application
 */
async function bootstrap() {
    console.log('[App] Starting...');

    // Restore auth session
    authService.restoreSession();

    // Setup router
    router
        .beforeEach(authGuard)
        .afterEach((to) => {
            // Update page title
            document.title = to.meta?.title 
                ? `${to.meta.title} - Admin` 
                : 'Admin Panel';
        })
        .registerAll(routes);

    // Wait for Layui
    layui.use(['layer', 'form', 'table', 'element'], () => {
        console.log('[App] Layui loaded');
        
        // Navigate to initial route
        if (!window.location.hash) {
            router.replace('/dashboard');
        }
    });

    console.log('[App] Ready');
}

// Start app
bootstrap().catch(console.error);


// src/router/routes.js
import { render as LoginPage } from '../pages/login.js';
import { render as DashboardPage } from '../pages/dashboard.js';
import { render as UserListPage } from '../pages/users/index.js';
import { render as UserFormPage } from '../pages/users/form.js';
import { render as NotFoundPage } from '../pages/not-found.js';

export const routes = [
    {
        path: '/login',
        handler: LoginPage,
        meta: { title: 'Đăng nhập', guest: true },
    },
    {
        path: '/dashboard',
        handler: DashboardPage,
        meta: { title: 'Dashboard', requiresAuth: true },
    },
    {
        path: '/users',
        handler: UserListPage,
        meta: { title: 'Người dùng', requiresAuth: true },
    },
    {
        path: '/users/create',
        handler: UserFormPage,
        meta: { title: 'Thêm người dùng', requiresAuth: true },
    },
    {
        path: '/users/:id/edit',
        handler: UserFormPage,
        meta: { title: 'Sửa người dùng', requiresAuth: true },
    },
    {
        path: '/404',
        handler: NotFoundPage,
        meta: { title: '404' },
    },
];


// src/router/guards.js
import { authService } from '../services/auth.service.js';

/**
 * Auth guard - kiểm tra đăng nhập
 */
export function authGuard(to, from) {
    const isAuthenticated = authService.isAuthenticated();

    // Trang yêu cầu đăng nhập
    if (to.meta?.requiresAuth && !isAuthenticated) {
        return '/login';
    }

    // Trang chỉ cho guest (login page)
    if (to.meta?.guest && isAuthenticated) {
        return '/dashboard';
    }

    return true;
}
```

---

## 9. REVIEW PROMPT

```markdown
Bạn là Senior Frontend Developer với 10+ năm kinh nghiệm. 
Review code Layui + Vanilla JS SPA theo checklist sau:

## CHECKLIST

### 🔴 Critical
- [ ] XSS vulnerabilities (innerHTML không escape)
- [ ] Memory leaks (event listeners không cleanup)
- [ ] API credentials exposed
- [ ] Infinite loops, blocking UI

### 🟠 High  
- [ ] Error handling không đầy đủ
- [ ] Missing loading states
- [ ] API calls không có try-catch
- [ ] Form validation thiếu/yếu
- [ ] Router guards không chặt

### 🟡 Medium
- [ ] Code duplication
- [ ] Magic strings/numbers
- [ ] Functions quá dài (>50 lines)
- [ ] Naming không rõ ràng
- [ ] Missing JSDoc comments

### 🟢 Low
- [ ] Code style không consistent
- [ ] Unused variables/imports
- [ ] Console.log còn sót

## PATTERNS PHẢI FOLLOW

1. **API Layer**: Tách riêng http.js + *.api.js
2. **Services**: Business logic tách riêng
3. **Router**: Hash-based với guards
4. **Store**: Simple reactive state
5. **Pages**: render() function pattern
6. **Utils**: Pure functions, reusable

## OUTPUT

Với mỗi file:
1. Liệt kê vấn đề [Severity] - Line X
2. Code đã fix hoàn chỉnh
3. Giải thích ngắn gọn

Bắt đầu review:
[PASTE CODE]
```

---

## 10. CHECKLIST TRƯỚC KHI COMMIT

- [ ] JSDoc cho public functions
- [ ] Error handling với try-catch
- [ ] Loading states cho async
- [ ] Form validation đầy đủ
- [ ] Event listeners cleanup
- [ ] No console.log
- [ ] No hardcoded values
- [ ] No innerHTML với user input (XSS)
- [ ] API errors handled
- [ ] Router guards working
- [ ] Responsive tested
- [ ] Cross-browser tested
