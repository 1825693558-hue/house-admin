import request from './request'

export interface HouseItem {
  id: number
  community_id: number | null
  community_name: string | null
  address: string | null
  area: number | null
  floor: number | null
  total_floors: number | null
  price: number | null
  sale_price: number | null
  rent_price: number | null
  price_note: string | null
  status: string
  house_type: string | null
  decoration: string | null
  key_type: string
  has_lock_password: boolean
  images: string[] | null
  created_at: string
  updated_at: string
}

export interface HouseDetail {
  id: number
  community_id: number | null
  community: { id: number; name: string } | null
  address: string | null
  area: number | null
  floor: number | null
  total_floors: number | null
  price: number | null
  sale_price: number | null
  rent_price: number | null
  price_note: string | null
  status: string
  house_type: string | null
  decoration: string | null
  key_type: string
  lock_password: string | null
  video_url: string | null
  images: string[] | null
  description: string | null
  contacts: Array<{
    id: number
    name: string
    phone: string | null
    role: string | null
    is_primary: number
  }>
  appliances: Array<{
    id: number
    appliance_id: number
    appliance_name: string | null
    note: string | null
  }>
  created_at: string
  updated_at: string
}

export interface HouseListParams {
  page?: number
  size?: number
  keyword?: string
  community_id?: number
  status?: string
  decoration?: string
  key_type?: string
  min_area?: number
  max_area?: number
  min_floor?: number
  max_floor?: number
  start_date?: string
  end_date?: string
}

export interface PaginatedList<T> {
  total: number
  page: number
  size: number
  items: T[]
}

export interface HouseContactInput {
  name: string
  phone?: string | null
  role?: string | null
  is_primary?: number
}

export interface HouseApplianceInput {
  appliance_id: number
  note?: string | null
}

/** 创建/更新房源的请求体 */
export interface HouseWriteData {
  community_id?: number | null
  address?: string | null
  area?: number | null
  floor?: number | null
  total_floors?: number | null
  price?: number | null
  sale_price?: number | null
  rent_price?: number | null
  price_note?: string | null
  status?: string
  house_type?: string | null
  decoration?: string | null
  key_type?: string
  lock_password?: string | null
  video_url?: string | null
  images?: string[] | null
  description?: string | null
  contacts?: HouseContactInput[]
  appliances?: HouseApplianceInput[]
}

export type HouseCreateData = HouseWriteData
export type HouseUpdateData = Partial<HouseWriteData>

export function getHouses(params?: HouseListParams) {
  return request.get<PaginatedList<HouseItem>>('/api/v1/houses', { params })
}

export function getHouseDetail(id: number) {
  return request.get<HouseDetail>(`/api/v1/houses/${id}`)
}

export function createHouse(data: HouseCreateData) {
  return request.post<{ id: number }>('/api/v1/houses', data)
}

export function updateHouse(id: number, data: HouseUpdateData) {
  return request.put<{ id: number }>(`/api/v1/houses/${id}`, data)
}

// RESTful: PATCH 部分更新状态
export function patchHouseStatus(id: number, status: string) {
  return request.patch<HouseItem>(`/api/v1/houses/${id}`, { status })
}

export function deleteHouse(id: number) {
  return request.delete(`/api/v1/houses/${id}`)
}