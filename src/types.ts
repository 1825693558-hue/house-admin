export interface Community {
  id: number
  name: string
  address: string
  houseCount: number
  createdAt: string
}

export interface Appliance {
  id: number
  name: string
  icon: string
  sortOrder: number
}

export interface User {
  id: number
  username: string
  nickname: string
  role: '管理员' | '编辑' | '查看员'
  createdAt: string
}

export interface House {
  id: number
  community: string
  area: number
  price: number
  status: string
  decoration: string
  keyType: string
  createdAt: string
}

export interface DashboardStats {
  totalHouses: number
  forSale: number
  forRent: number
  totalCommunities: number
}

export const statusClassMap: Record<string, string> = {
  '在售': 'status-sale',
  '出租中': 'status-rent',
  '已售': 'status-sold',
  '已租': 'status-rented',
  '下架': 'status-off',
}

export const decorationClassMap: Record<string, string> = {
  '精装': 'decoration-fine',
  '简装': 'decoration-simple',
  '毛坯': 'decoration-rough',
  '豪装': 'decoration-luxury',
}

export const keyClassMap: Record<string, string> = {
  '钥匙在店': 'key-inshop',
  '联系房东': 'key-contact',
  '密码锁': 'key-password',
  '临时密码': 'key-temp',
}
