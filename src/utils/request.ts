import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { toast } from 'sonner'

// API 响应接口
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页结果接口
export interface PageResult<T> {
  items: T[]
  total: number
  pageIndex: number
  pageSize: number
  totalPages: number
}

// 分页请求接口
export interface PageRequest {
  pageIndex: number
  pageSize: number
  keyword?: string
  orderBy?: string
  isAsc?: boolean
}

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加 token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const res = response.data
    if (res.code !== 200) {
      toast.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  (error) => {
    // 处理 401 未授权错误（开发模式：仅提示，不跳转）
    if (error.response?.status === 401) {
      toast.error('未授权访问（开发模式：已跳过登录验证）')
      return Promise.reject(error)
    }

    toast.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 封装请求方法
const request = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return service.get(url, config).then((res) => res.data)
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return service.post(url, data, config).then((res) => res.data)
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return service.put(url, data, config).then((res) => res.data)
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResult<T>> {
    return service.delete(url, config).then((res) => res.data)
  },
}

export default request
