import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getToken, removeToken } from '../utils/auth'
import { navigateTo } from '../utils/navigate'

// 从环境变量读取配置
// 空字符串表示使用相对路径（同域名部署，由 Nginx 代理到后端）
const envBase = import.meta.env.VITE_API_BASE_URL
const BASE_URL = envBase !== undefined && envBase !== null ? envBase : 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 导出配置供外部使用
export { BASE_URL, USE_MOCK }

/** 后端统一响应结构 */
interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/**
 * 由于响应拦截器提取 response.data.data，
 * 所有请求方法的真实返回类型是 Promise<T>（业务数据），而非 Promise<AxiosResponse<T>>。
 * 这里通过接口重新声明方法签名，使 TypeScript 类型与运行时行为一致。
 */
interface HttpRequest extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'> {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
}

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：自动附加 Token
instance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一提取 {code, msg, data} 中的 data
instance.interceptors.response.use(
  (response): any => {
    const payload = response.data as ApiResponse

    // 401 未授权
    if (response.status === 401) {
      removeToken()
      navigateTo('/login')
      return Promise.reject(new Error(payload?.msg || '登录已过期，请重新登录'))
    }

    // 业务错误（HTTP 2xx 但 code 不为 200）
    if (payload && typeof payload.code === 'number' && payload.code !== 200) {
      return Promise.reject(new Error(payload.msg || '请求失败'))
    }

    // 正常返回：提取 data 字段
    return payload?.data
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      navigateTo('/login')
      const payload = error.response?.data as ApiResponse | undefined
      return Promise.reject(new Error(payload?.msg || '登录已过期，请重新登录'))
    }

    // 优先取后端统一返回的 msg，降级取 HTTP 状态描述
    const payload = error.response?.data as ApiResponse | undefined
    const msg: string =
      payload?.msg ||
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      '网络错误'
    return Promise.reject(new Error(msg))
  }
)

const request = instance as unknown as HttpRequest

export default request
