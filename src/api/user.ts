import request from './request'

export interface UserItem {
  id: number
  username: string
  nickname: string | null
  role: 'ADMIN' | 'USER'
  created_at: string
  updated_at: string
}

export interface PaginatedList<T> {
  total: number
  page: number
  size: number
  items: T[]
}

export function getUsers(params?: { page?: number; size?: number }) {
  return request.get<PaginatedList<UserItem>>('/api/v1/users', { params })
}

export function createUser(data: { username: string; password: string; nickname?: string; role?: string }) {
  return request.post<UserItem>('/api/v1/users', data)
}

export function updateUser(id: number, data: { nickname?: string; role?: string; password?: string }) {
  return request.put<UserItem>(`/api/v1/users/${id}`, data)
}

export function deleteUser(id: number) {
  return request.delete(`/api/v1/users/${id}`)
}