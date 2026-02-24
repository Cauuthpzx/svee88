import { authApi } from '../../api/auth.js'
import { setToken, isValidEmail } from '../../utils/index.js'
import { classifyError } from '../../utils/error.js'
import {
  ROUTES,
  MSG,
  PASSWORD_MIN_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_PATTERN,
  INTENDED_ROUTE_KEY
} from '../../constants/index.js'
import './index.css'

const loginTemplate = () => `
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <img src="/logo.png" alt="HuB" class="auth-logo">
        <svg class="auth-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 42" role="img" aria-label="HUB LOGIN">
          <defs>
            <linearGradient id="authLogoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff4060"/>
              <stop offset="50%" stop-color="#ff8020"/>
              <stop offset="100%" stop-color="#ffcc00"/>
            </linearGradient>
          </defs>
          <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
            font-family="'Arial Black','Impact',sans-serif" font-size="28" font-weight="900"
            letter-spacing="1" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3.5" stroke-linejoin="round">HUB LOGIN</text>
          <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
            font-family="'Arial Black','Impact',sans-serif" font-size="28" font-weight="900"
            letter-spacing="1" fill="url(#authLogoGrad)" stroke="#cc1833" stroke-width="0.4"
            paint-order="stroke fill" style="filter:drop-shadow(1px 2px 2px rgba(0,0,0,.35))">HUB LOGIN</text>
        </svg>
        <p>Chào mừng bạn quay trở lại</p>
      </div>
      <div class="auth-body">
        <form class="layui-form" lay-filter="loginForm" role="form" aria-label="Đăng nhập">
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-username"></i>
              </div>
              <input type="text" name="username" class="layui-input"
                placeholder="Tên đăng nhập hoặc email" autocomplete="username"
                lay-verify="required" lay-reqtext="Vui lòng nhập tên đăng nhập"
                lay-affix="clear">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-password"></i>
              </div>
              <input type="password" name="password" class="layui-input"
                placeholder="Mật khẩu" autocomplete="current-password"
                lay-verify="required" lay-reqtext="Vui lòng nhập mật khẩu"
                lay-affix="eye">
            </div>
          </div>
          <div class="layui-form-item">
            <button class="layui-btn layui-btn-fluid" lay-submit
              lay-filter="submitLogin">Đăng nhập</button>
          </div>
        </form>
      </div>
    </div>
  </div>
`

const registerTemplate = () => `
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Đăng ký</h2>
        <p>Tạo tài khoản mới</p>
      </div>
      <div class="auth-body">
        <form class="layui-form" lay-filter="registerForm" role="form" aria-label="Đăng ký">
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-user"></i>
              </div>
              <input type="text" name="name" class="layui-input"
                placeholder="Họ và tên" autocomplete="name"
                lay-verify="required|nameLength"
                lay-reqtext="Vui lòng nhập họ tên" lay-affix="clear">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-username"></i>
              </div>
              <input type="text" name="username" class="layui-input"
                placeholder="Tên đăng nhập" autocomplete="username"
                lay-verify="required|usernameRule"
                lay-reqtext="Vui lòng nhập tên đăng nhập" lay-affix="clear">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-email"></i>
              </div>
              <input type="text" name="email" class="layui-input"
                placeholder="Email" autocomplete="email"
                lay-verify="required|emailRule"
                lay-reqtext="Vui lòng nhập email" lay-affix="clear">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-password"></i>
              </div>
              <input type="password" name="password" id="regPassword"
                class="layui-input" placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                autocomplete="new-password"
                lay-verify="required|passwordRule"
                lay-reqtext="Vui lòng nhập mật khẩu" lay-affix="eye">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-wrap">
              <div class="layui-input-prefix">
                <i class="layui-icon layui-icon-password"></i>
              </div>
              <input type="password" name="confirmPassword"
                class="layui-input" placeholder="Xác nhận mật khẩu"
                autocomplete="new-password"
                lay-verify="required|confirmPwd"
                lay-reqtext="Vui lòng xác nhận mật khẩu" lay-affix="eye">
            </div>
          </div>
          <div class="layui-form-item">
            <button class="layui-btn layui-btn-fluid" lay-submit
              lay-filter="submitRegister">Đăng ký</button>
          </div>
        </form>
      </div>
    </div>
  </div>
`

const registerCustomValidators = (form) => {
  form.verify({
    nameLength: (value) => {
      if (value.length < NAME_MIN_LENGTH || value.length > NAME_MAX_LENGTH) {
        return MSG.NAME_LENGTH
      }
    },
    usernameRule: (value) => {
      if (value.length < USERNAME_MIN_LENGTH || value.length > USERNAME_MAX_LENGTH) {
        return MSG.USERNAME_LENGTH
      }
      if (!USERNAME_PATTERN.test(value)) return MSG.USERNAME_INVALID
    },
    emailRule: (value) => {
      if (!isValidEmail(value)) return MSG.INVALID_EMAIL
    },
    passwordRule: (value) => {
      if (value.length < PASSWORD_MIN_LENGTH) return MSG.PASSWORD_TOO_SHORT
    },
    confirmPwd: (value) => {
      const pwd = document.getElementById('regPassword')
      if (pwd && value !== pwd.value) return MSG.PASSWORD_MISMATCH
    }
  })
}

const handleLogin = async (field, layer) => {
  const loadIdx = layer.load(2)
  try {
    const res = await authApi.login(field.username, field.password)
    setToken(res.access_token)
    layer.msg(MSG.LOGIN_SUCCESS, { icon: 1 })
    const intended = sessionStorage.getItem(INTENDED_ROUTE_KEY)
    sessionStorage.removeItem(INTENDED_ROUTE_KEY)
    setTimeout(() => { location.hash = intended || ROUTES.DASHBOARD }, 600)
  } catch (error) {
    layer.msg(classifyError(error).message, { icon: 2 })
  } finally {
    layer.close(loadIdx)
  }
}

const handleRegister = async (field, layer) => {
  const loadIdx = layer.load(2)
  try {
    await authApi.register({
      name: field.name,
      username: field.username,
      email: field.email,
      password: field.password
    })
    layer.msg(MSG.REGISTER_SUCCESS, { icon: 1 })
    setTimeout(() => { location.hash = ROUTES.LOGIN }, 1000)
  } catch (error) {
    layer.msg(classifyError(error).message, { icon: 2 })
  } finally {
    layer.close(loadIdx)
  }
}

const initLoginForm = () => {
  layui.use(['form', 'layer'], function (form, layer) {
    registerCustomValidators(form)
    form.on('submit(submitLogin)', (data) => {
      handleLogin(data.field, layer)
      return false
    })
    form.render()
  })
}

const initRegisterForm = () => {
  layui.use(['form', 'layer'], function (form, layer) {
    registerCustomValidators(form)
    form.on('submit(submitRegister)', (data) => {
      handleRegister(data.field, layer)
      return false
    })
    form.render()
  })
}

export const render = (hash) => {
  const container = document.getElementById('app')
  if (hash === ROUTES.REGISTER) {
    container.innerHTML = registerTemplate()
    initRegisterForm()
  } else {
    container.innerHTML = loginTemplate()
    initLoginForm()
  }
}

export const destroy = () => {}
