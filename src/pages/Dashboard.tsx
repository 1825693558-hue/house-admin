import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Spin } from 'antd'
import { App } from 'antd'
import {
  HomeOutlined,
  ShoppingOutlined,
  KeyOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import { getHouses } from '../api/house'
import { getCommunities } from '../api/community'
import type { HouseItem } from '../api/house'
import { statusClassMap } from '../types'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHouses: 0,
    forSale: 0,
    forRent: 0,
    totalCommunities: 0,
  })
  const [recentHouses, setRecentHouses] = useState<HouseItem[]>([])
  const [statusDistribution, setStatusDistribution] = useState<Array<{ label: string; value: number; color: string }>>([])
  const { message } = App.useApp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [houseRes, communityRes] = await Promise.all([
          getHouses({ page: 1, size: 5 }),
          getCommunities({ page: 1, size: 1 }),
        ])

        const houses = houseRes.items
        const total = houseRes.total
        const communitiesTotal = communityRes.total

        const forSale = houses.filter((h) => h.status === '在售').length
        const forRent = houses.filter((h) => h.status === '出租中').length

        setStats({
          totalHouses: total,
          forSale,
          forRent,
          totalCommunities: communitiesTotal,
        })

        setRecentHouses(houses.slice(0, 5))

        // 状态分布
        const statusMap: Record<string, { label: string; color: string }> = {
          '在售': { label: '在售', color: '#1677ff' },
          '已售': { label: '已售', color: '#52c41a' },
          '空闲': { label: '空闲', color: '#8c8c8c' },
          '出租中': { label: '出租中', color: '#722ed1' },
          '已租': { label: '已租', color: '#fa8c16' },
          '下架': { label: '下架', color: '#f5222d' },
        }
        const dist = Object.entries(statusMap).map(([key, val]) => ({
          label: val.label,
          value: houses.filter((h) => h.status === key).length,
          color: val.color,
        }))
        setStatusDistribution(dist)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '加载数据失败'
        message.error(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [message])

  const statCards = [
    {
      title: '房源总数',
      value: stats.totalHouses,
      label: '全部房源',
      icon: <HomeOutlined />,
      color: '#2d8f5e',
    },
    {
      title: '在售房源',
      value: stats.forSale,
      label: '正在出售',
      icon: <ShoppingOutlined />,
      color: '#1677ff',
    },
    {
      title: '出租中',
      value: stats.forRent,
      label: '正在出租',
      icon: <KeyOutlined />,
      color: '#722ed1',
    },
    {
      title: '小区数',
      value: stats.totalCommunities,
      label: '覆盖小区',
      icon: <ApartmentOutlined />,
      color: '#fa8c16',
    },
  ]

  const maxValue = Math.max(...statusDistribution.map((d) => d.value), 1)

  const columns = [
    { title: '编号', dataIndex: 'id', key: 'id' },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    { title: '小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '面积(m²)', dataIndex: 'area', key: 'area' },
    {
      title: '价格(万)',
      dataIndex: 'price',
      key: 'price',
      render: (v: number) => <span style={{ color: '#2d8f5e', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag className={statusClassMap[v] || ''} style={{ borderWidth: 1, borderStyle: 'solid' }}>
          {v}
        </Tag>
      ),
    },
    { title: '录入时间', dataIndex: 'created_at', key: 'created_at' },
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <Row gutter={[24, 24]}>
          {statCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <Card styles={{ body: { padding: 24 } }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>{card.title}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>
                      {card.value}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#9ca3af', fontSize: 13 }}>{card.label}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="房源状态分布" styles={{ body: { padding: 24 } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {statusDistribution.map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ fontWeight: 500, color: '#374151' }}>{item.label}</span>
                      <span style={{ color: '#6b7280' }}>
                        {item.value} 套 ({stats.totalHouses > 0 ? ((item.value / stats.totalHouses) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 12, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(item.value / maxValue) * 100}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: 6,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="最近录入" styles={{ body: { padding: 0 } }}>
              <Table
                columns={columns}
                dataSource={recentHouses}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}