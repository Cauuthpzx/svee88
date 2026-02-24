export const TOKEN_KEY = 'token'

export const PASSWORD_MIN_LENGTH = 8
export const USERNAME_MIN_LENGTH = 2
export const USERNAME_MAX_LENGTH = 20
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 30
export const USERNAME_PATTERN = /^[a-z0-9]+$/

export const ROUTES = {
  LOGIN: '#/login',
  REGISTER: '#/register',
  DASHBOARD: '#/dashboard'
}

export const API = {
  LOGIN: '/api/v1/login',
  REGISTER: '/api/v1/user',
  LOGOUT: '/api/v1/logout',
  USER_ME: '/api/v1/user/me/'
}

export const MSG = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công, vui lòng đăng nhập',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu tối thiểu 8 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  USERNAME_INVALID: 'Tên đăng nhập chỉ gồm chữ thường và số',
  USERNAME_LENGTH: 'Tên đăng nhập từ 2–20 ký tự',
  NAME_LENGTH: 'Họ tên từ 2–30 ký tự',
  NETWORK_ERROR: 'Lỗi kết nối, vui lòng thử lại',
  SERVER_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau'
}
