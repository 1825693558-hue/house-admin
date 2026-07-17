// Token 存储与认证工具

const TOKEN_KEY = 'ai_house_token'
const USER_KEY = 'ai_house_user'
const REMEMBER_KEY = 'ai_house_remember'
const SAVED_USERNAME_KEY = 'ai_house_saved_username'
const SAVED_PASSWORD_KEY = 'ai_house_saved_password'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  role: 'ADMIN' | 'USER'
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function setUser(user: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function isAdmin(): boolean {
  const user = getUser()
  return user?.role === 'ADMIN'
}

// ---------- 记住密码 ----------

export function getRememberedCredentials(): { username: string; password: string } | null {
  if (localStorage.getItem(REMEMBER_KEY) !== 'true') return null
  const u = localStorage.getItem(SAVED_USERNAME_KEY)
  const p = localStorage.getItem(SAVED_PASSWORD_KEY)
  if (u && p) return { username: u, password: p }
  return null
}

export function saveCredentials(username: string, password: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, 'true')
    localStorage.setItem(SAVED_USERNAME_KEY, username)
    localStorage.setItem(SAVED_PASSWORD_KEY, password)
  } else {
    localStorage.removeItem(REMEMBER_KEY)
    localStorage.removeItem(SAVED_USERNAME_KEY)
    localStorage.removeItem(SAVED_PASSWORD_KEY)
  }
}

export function clearSavedCredentials() {
  localStorage.removeItem(REMEMBER_KEY)
  localStorage.removeItem(SAVED_USERNAME_KEY)
  localStorage.removeItem(SAVED_PASSWORD_KEY)
}