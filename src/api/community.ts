import request from './request'

export interface CommunityItem {
  id: number
  name: string
  address: string | null
  created_at: string
}

export interface PaginatedList<T> {
  total: number
  page: number
  size: number
  items: T[]
}

export function getCommunities(params?: { keyword?: string; page?: number; size?: number; simple?: boolean }) {
  return request.get<PaginatedList<CommunityItem>>('/api/v1/communities', { params })
}

export function createCommunity(data: { name: string; address?: string }) {
  return request.post<CommunityItem>('/api/v1/communities', data)
}

export function updateCommunity(id: number, data: { name?: string; address?: string }) {
  return request.put<CommunityItem>(`/api/v1/communities/${id}`, data)
}

export function deleteCommunity(id: number) {
  return request.delete(`/api/v1/communities/${id}`)
}