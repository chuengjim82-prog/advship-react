import request from '@/utils/request'

// SSO 登录 URL 响应
export interface SsoLoginResponse {
  authorizationUrl: string
  state: string
}

// SSO 用户信息
export interface SsoUserInfo {
  userId: string
  username: string
  email?: string
  roles?: string[]
}

// 登录结果
export interface LoginResult {
  accessToken: string
  userInfo: SsoUserInfo | null
}

// SSO 回调请求
export interface SsoCallbackRequest {
  code: string
  state: string
}

// SSO API 服务
export const ssoApi = {
  // 获取 SSO 登录 URL
  getLoginUrl(returnUrl?: string) {
    const params = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''
    return request.get<SsoLoginResponse>(`/sso/api/auth/login-url${params}`)
  },
  // 使用授权码换取 Token
  callback(data: SsoCallbackRequest) {
    return request.post<LoginResult>('/sso/api/auth/callback', data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get<SsoUserInfo>('/sso/api/auth/userinfo')
  },

  // 获取登出 URL
  getLogoutUrl(redirectUri?: string) {
    const params = redirectUri ? `?redirectUri=${encodeURIComponent(redirectUri)}` : ''
    return request.get<string>(`/sso/api/auth/logout-url${params}`)
  },

  // 验证 Token
  validateToken(token: string) {
    return request.post<boolean>('/sso/api/auth/validate-token', { token })
  }
}

export default ssoApi
