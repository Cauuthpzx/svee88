import { authApi } from '../../api/auth.js'
import { setToken, isValidEmail } from '../../utils/index.js'
import { store } from '../../store/index.js'
import {
  ROUTES,
  MSG,
  PASSWORD_MIN_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_PATTERN
} from '../../constants/index.js'
import './index.css'

const loginTemplate = () => `
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Đăng nhập</h2>
        <p>Chào mừng bạn quay trở lại</p>
      </div>
      <div class="auth-body">
        <form class="layui-form" lay-filter="loginForm">
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-username"></i>
              <input type="text" name="username" placeholder="Tên đăng nhập hoặc email"
                autocomplete="username" class="layui-input" lay-verify="required"
                lay-reqtext="Vui lòng nhập tên đăng nhập">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-password"></i>
              <input type="password" name="password" id="loginPassword"
                placeholder="Mật khẩu" autocomplete="current-password"
                class="layui-input" lay-verify="required"
                lay-reqtext="Vui lòng nhập mật khẩu">
              <i class="layui-icon layui-icon-show auth-password-toggle"
                id="toggleLoginPwd"></i>
            </div>
          </div>
          <div class="layui-form-item">
            <button type="submit" class="auth-submit-btn" lay-submit
              lay-filter="submitLogin">Đăng nhập</button>
          </div>
        </form>
      </div>
      <div class="auth-footer">
        <span>Chưa có tài khoản? </span>
        <a href="${ROUTES.REGISTER}">Đăng ký ngay</a>
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
        <form class="layui-form" lay-filter="registerForm">
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-user"></i>
              <input type="text" name="name" placeholder="Họ và tên"
                autocomplete="name" class="layui-input"
                lay-verify="required|nameLength"
                lay-reqtext="Vui lòng nhập họ tên">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-username"></i>
              <input type="text" name="username" placeholder="Tên đăng nhập"
                autocomplete="username" class="layui-input"
                lay-verify="required|usernameRule"
                lay-reqtext="Vui lòng nhập tên đăng nhập">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-email"></i>
              <input type="text" name="email" placeholder="Email"
                autocomplete="email" class="layui-input"
                lay-verify="required|emailRule"
                lay-reqtext="Vui lòng nhập email">
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-password"></i>
              <input type="password" name="password" id="regPassword"
                placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                autocomplete="new-password" class="layui-input"
                lay-verify="required|passwordRule"
                lay-reqtext="Vui lòng nhập mật khẩu">
              <i class="layui-icon layui-icon-show auth-password-toggle"
                id="toggleRegPwd"></i>
            </div>
          </div>
          <div class="layui-form-item">
            <div class="layui-input-prefix">
              <i class="layui-icon layui-icon-password"></i>
              <input type="password" name="confirmPassword" id="regConfirmPwd"
                placeholder="Xác nhận mật khẩu"
                autocomplete="new-password" class="layui-input"
                lay-verify="required|confirmPwd"
                lay-reqtext="Vui lòng xác nhận mật khẩu">
              <i class="layui-icon layui-icon-show auth-password-toggle"
                id="toggleRegConfirmPwd"></i>
            </div>
          </div>
          <div class="layui-form-item">
            <button type="submit" class="auth-submit-btn" lay-submit
              lay-filter="submitRegister">Đăng ký</button>
          </div>
        </form>
      </div>
      <div class="auth-footer">
        <span>Đã có tài khoản? </span>
        <a href="${ROUTES.LOGIN}">Đăng nhập</a>
      </div>
    </div>
  </div>
`

const togglePasswordVisibility = (toggleId, inputId) => {
  const toggle = document.getElementById(toggleId)
  const input = document.getElementById(inputId)
  if (!toggle || !input) return
  toggle.addEventListener('click', () => {
    const isHidden = input.type === 'password'
    input.type = isHidden ? 'text' : 'password'
    toggle.classList.toggle('layui-icon-show', !isHidden)
    toggle.classList.toggle('layui-icon-hide', isHidden)
  })
}

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

const getErrorMessage = (error) => {
  const response = error?.response
  if (!response) return MSG.NETWORK_ERROR
  const data = response.data
  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) return data.detail[0]?.msg || MSG.SERVER_ERROR
  }
  if (data?.message) return data.message
  return MSG.SERVER_ERROR
}

const handleLogin = async (field, layer) => {
  const loadIdx = layer.load(2)
  try {
    const res = await authApi.login(field.username, field.password)
    setToken(res.access_token)
    store.set('token', res.access_token)
    layer.msg(MSG.LOGIN_SUCCESS, { icon: 1 })
    setTimeout(() => { location.hash = ROUTES.DASHBOARD }, 600)
  } catch (error) {
    layer.msg(getErrorMessage(error), { icon: 2 })
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
    layer.msg(getErrorMessage(error), { icon: 2 })
  } finally {
    layer.close(loadIdx)
  }
}

const initLoginForm = () => {
  layui.use(['form', 'layer'], ({ form, layer }) => {
    registerCustomValidators(form)

    form.on('submit(submitLogin)', ({ field }) => {
      handleLogin(field, layer)
      return false
    })

    togglePasswordVisibility('toggleLoginPwd', 'loginPassword')
    form.render()
  })
}

const initRegisterForm = () => {
  layui.use(['form', 'layer'], ({ form, layer }) => {
    registerCustomValidators(form)

    form.on('submit(submitRegister)', ({ field }) => {
      handleRegister(field, layer)
      return false
    })

    togglePasswordVisibility('toggleRegPwd', 'regPassword')
    togglePasswordVisibility('toggleRegConfirmPwd', 'regConfirmPwd')
    form.render()
  })
}

export const render = (mode = 'login') => {
  const container = document.getElementById('app')
  if (mode === 'register') {
    container.innerHTML = registerTemplate()
    initRegisterForm()
  } else {
    container.innerHTML = loginTemplate()
    initLoginForm()
  }
}
