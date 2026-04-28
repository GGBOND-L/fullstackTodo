import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/auth'


interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

instance.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('todo-auth')
  const token = authStorage ? JSON.parse(authStorage)?.state?.token : ''
  // console.log('token', token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<ApiResponse<T>>(config)
  const result = response.data

  if (result.code === 4010) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error(result.message || '登录已过期，请重新登录')
  }

  if (result.code !== 0) {
    message.error(result.message || '请求失败')
  }

  return result.data
}

export default instance
