import request from './request'
import type { UserInfo } from '../utils/auth'

// RESTful: POST /api/v1/auth/token  (OAuth2 Password Flow)
// 请求体: { username, password }
// 响应体: { access_token, token_type }
export interface TokenResult {
  access_token: string
  token_type: string
}

export function login(data: { username: string; password: string }) {
  // OAuth2 标准使用 form-urlencoded
  return request.post<TokenResult>('/api/v1/auth/token', new URLSearchParams(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

// RESTful: GET /api/v1/users/me  (当前登录用户信息)
export function getMe() {
  return request.get<UserInfo>('/api/v1/users/me')
}