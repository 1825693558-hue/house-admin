import request from './request'

export interface ApplianceItem {
  id: number
  name: string
  icon: string | null
  sort_order: number
  created_at: string
}

export interface ApplianceListResult {
  total: number
  items: ApplianceItem[]
}

export function getAppliances() {
  return request.get<ApplianceListResult>('/api/v1/appliances')
}

export function createAppliance(data: { name: string; icon?: string; sort_order?: number }) {
  return request.post<ApplianceItem>('/api/v1/appliances', data)
}

export function updateAppliance(id: number, data: { name?: string; icon?: string; sort_order?: number }) {
  return request.put<ApplianceItem>(`/api/v1/appliances/${id}`, data)
}

export function deleteAppliance(id: number) {
  return request.delete(`/api/v1/appliances/${id}`)
}