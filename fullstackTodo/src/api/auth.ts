import { request } from './request'

export interface User {
  id: number
  username: string
  email: string
}
export const loginApi = (params: { email: string; password: string }) => {
  return request<{ token: string; user: User }>({
    url: '/auth/login',
    method: 'POST',
    data: { ...params },
  })
}

export const registerApi = (params: {
  username: string
  email: string
  password: string
}) => {
  return request<User>({
    url: '/auth/register',
    method: 'POST',
    data: { ...params },
  })
}

export const getCurrentUserApi = () => {
  return request<User>({
    url: '/auth/current',
    method: 'GET',
  })
}
