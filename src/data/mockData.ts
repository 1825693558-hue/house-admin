import type { DashboardStats, Community, Appliance, User, House } from '../types'

export const mockStats: DashboardStats = {
  totalHouses: 1248,
  forSale: 456,
  forRent: 312,
  totalCommunities: 28,
}

export interface StatusDistributionItem {
  label: string
  value: number
  color: string
}

export const mockStatusDistribution: StatusDistributionItem[] = [
  { label: '在售', value: 456, color: '#2d8f5e' },
  { label: '出租中', value: 312, color: '#1677ff' },
  { label: '已售', value: 280, color: '#fa8c16' },
  { label: '已租', value: 150, color: '#722ed1' },
  { label: '下架', value: 50, color: '#8c8c8c' },
]

export const mockRecentHouses: House[] = [
  { id: 1001, title: '阳光花园 3室2厅 南北通透', community: '阳光花园', area: 128, price: 385, status: '在售', decoration: '精装', keyType: '钥匙在店', createdAt: '2026-07-15' },
  { id: 1002, title: '万科城 2室1厅 精装修', community: '万科城', area: 89, price: 210, status: '在售', decoration: '精装', keyType: '密码锁', createdAt: '2026-07-14' },
  { id: 1003, title: '龙湖天街 4室2厅 豪装', community: '龙湖天街', area: 156, price: 520, status: '出租中', decoration: '豪装', keyType: '联系房东', createdAt: '2026-07-13' },
  { id: 1004, title: '中海国际 1室1厅 拎包入住', community: '中海国际', area: 56, price: 120, status: '在售', decoration: '简装', keyType: '临时密码', createdAt: '2026-07-12' },
  { id: 1005, title: '保利心语 3室2厅 江景房', community: '保利心语', area: 142, price: 460, status: '在售', decoration: '精装', keyType: '钥匙在店', createdAt: '2026-07-11' },
]

export const mockCommunities: Community[] = [
  { id: 1, name: '阳光花园', address: '朝阳区建国路88号', houseCount: 156, createdAt: '2024-03-15' },
  { id: 2, name: '万科城', address: '海淀区中关村大街1号', houseCount: 234, createdAt: '2024-05-20' },
  { id: 3, name: '龙湖天街', address: '西城区金融街7号', houseCount: 89, createdAt: '2024-06-10' },
  { id: 4, name: '中海国际', address: '东城区东直门外大街', houseCount: 178, createdAt: '2024-08-01' },
  { id: 5, name: '保利心语', address: '丰台区南四环西路', houseCount: 112, createdAt: '2024-09-15' },
  { id: 6, name: '华润悦府', address: '通州区运河西大街', houseCount: 267, createdAt: '2025-01-10' },
  { id: 7, name: '绿地中心', address: '顺义区天竺镇', houseCount: 95, createdAt: '2025-03-22' },
]

export const mockAppliances: Appliance[] = [
  { id: 1, name: '空调', icon: '❄️', sortOrder: 1 },
  { id: 2, name: '冰箱', icon: '🧊', sortOrder: 2 },
  { id: 3, name: '洗衣机', icon: '🌀', sortOrder: 3 },
  { id: 4, name: '电视', icon: '📺', sortOrder: 4 },
  { id: 5, name: '热水器', icon: '🔥', sortOrder: 5 },
  { id: 6, name: '油烟机', icon: '💨', sortOrder: 6 },
  { id: 7, name: '微波炉', icon: '⚡', sortOrder: 7 },
  { id: 8, name: '洗碗机', icon: '🍽️', sortOrder: 8 },
]

export const mockUsers: User[] = [
  { id: 1, username: 'zhangjianguo', nickname: '张建国', role: '管理员', createdAt: '2024-01-10' },
  { id: 2, username: 'liwei', nickname: '李薇', role: '编辑', createdAt: '2024-03-15' },
  { id: 3, username: 'wanghao', nickname: '王浩', role: '编辑', createdAt: '2024-06-20' },
  { id: 4, username: 'zhaomin', nickname: '赵敏', role: '查看员', createdAt: '2025-01-08' },
  { id: 5, username: 'sunliang', nickname: '孙亮', role: '查看员', createdAt: '2025-04-12' },
]

export const mockHouses: House[] = [
  { id: 1001, title: '阳光花园 3室2厅 南北通透', community: '阳光花园', area: 128, price: 385, status: '在售', decoration: '精装', keyType: '钥匙在店', createdAt: '2026-07-15' },
  { id: 1002, title: '万科城 2室1厅 精装修', community: '万科城', area: 89, price: 210, status: '在售', decoration: '精装', keyType: '密码锁', createdAt: '2026-07-14' },
  { id: 1003, title: '龙湖天街 4室2厅 豪装', community: '龙湖天街', area: 156, price: 520, status: '出租中', decoration: '豪装', keyType: '联系房东', createdAt: '2026-07-13' },
  { id: 1004, title: '中海国际 1室1厅 拎包入住', community: '中海国际', area: 56, price: 120, status: '在售', decoration: '简装', keyType: '临时密码', createdAt: '2026-07-12' },
  { id: 1005, title: '保利心语 3室2厅 江景房', community: '保利心语', area: 142, price: 460, status: '在售', decoration: '精装', keyType: '钥匙在店', createdAt: '2026-07-11' },
  { id: 1006, title: '华润悦府 2室2厅 现代简约', community: '华润悦府', area: 96, price: 268, status: '出租中', decoration: '精装', keyType: '密码锁', createdAt: '2026-07-10' },
  { id: 1007, title: '绿地中心 5室3厅 复式', community: '绿地中心', area: 210, price: 780, status: '在售', decoration: '豪装', keyType: '联系房东', createdAt: '2026-07-09' },
  { id: 1008, title: '阳光花园 1室1厅 单身公寓', community: '阳光花园', area: 48, price: 98, status: '已租', decoration: '简装', keyType: '钥匙在店', createdAt: '2026-07-08' },
  { id: 1009, title: '万科城 3室1厅 学区房', community: '万科城', area: 108, price: 325, status: '已售', decoration: '精装', keyType: '密码锁', createdAt: '2026-07-07' },
  { id: 1010, title: '龙湖天街 2室2厅 拎包入住', community: '龙湖天街', area: 92, price: 245, status: '下架', decoration: '毛坯', keyType: '临时密码', createdAt: '2026-07-06' },
]
