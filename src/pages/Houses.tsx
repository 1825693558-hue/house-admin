import { useEffect, useState } from 'react'
import { Card, Button, Input, Table, Tag, Select, Space, Spin } from 'antd'
import { App } from 'antd'
import { SearchOutlined, FilterOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { getHouses } from '../api/house'
import type { HouseItem } from '../api/house'
import { statusClassMap, decorationClassMap, keyClassMap } from '../types'

export default function Houses() {
  const [data, setData] = useState<HouseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [decorationFilter, setDecorationFilter] = useState<string | undefined>(undefined)
  const [keyFilter, setKeyFilter] = useState<string | undefined>(undefined)
  const [filterVisible, setFilterVisible] = useState(false)
  const { message } = App.useApp()

  const fetchData = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: 1, size: 20 }
      if (search) params.keyword = search
      if (statusFilter) params.status = statusFilter
      if (decorationFilter) params.decoration = decorationFilter
      if (keyFilter) params.key_type = keyFilter

      const res = await getHouses(params)
      setData(res.items)
      setTotal(res.total)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, decorationFilter, keyFilter])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleReset = () => {
    setSearch('')
    setStatusFilter(undefined)
    setDecorationFilter(undefined)
    setKeyFilter(undefined)
    message.success('筛选已重置')
    fetchData()
  }

  const columns = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    { title: '小区', dataIndex: 'community_name', key: 'community_name' },
    { title: '面积(m²)', dataIndex: 'area', key: 'area', width: 100 },
    {
      title: '价格(万)',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v: number) => <span style={{ color: '#2d8f5e', fontWeight: 600 }}>{v}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => (
        <Tag className={statusClassMap[v] || ''} style={{ borderWidth: 1, borderStyle: 'solid' }}>
          {v}
        </Tag>
      ),
    },
    {
      title: '装修',
      dataIndex: 'decoration',
      key: 'decoration',
      width: 90,
      render: (v: string) => v ? <Tag className={decorationClassMap[v] || ''}>{v}</Tag> : '-',
    },
    {
      title: '钥匙',
      dataIndex: 'key_type',
      key: 'key_type',
      width: 110,
      render: (v: string) => v ? <Tag className={keyClassMap[v] || ''}>{v}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: HouseItem) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => message.info(`查看房源: ${record.title}`)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="搜索房源标题或小区..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterVisible(!filterVisible)}>
              筛选
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>

        {filterVisible && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Space size="large" wrap>
              <div>
                <span style={{ color: '#6b7280', marginRight: 8 }}>状态:</span>
                <Select
                  placeholder="全部状态"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 140 }}
                  allowClear
                >
                  <Select.Option value="在售">在售</Select.Option>
                  <Select.Option value="出租中">出租中</Select.Option>
                  <Select.Option value="已售">已售</Select.Option>
                  <Select.Option value="已租">已租</Select.Option>
                  <Select.Option value="空闲">空闲</Select.Option>
                  <Select.Option value="下架">下架</Select.Option>
                </Select>
              </div>
              <div>
                <span style={{ color: '#6b7280', marginRight: 8 }}>装修:</span>
                <Select
                  placeholder="全部装修"
                  value={decorationFilter}
                  onChange={setDecorationFilter}
                  style={{ width: 140 }}
                  allowClear
                >
                  <Select.Option value="精装">精装</Select.Option>
                  <Select.Option value="简装">简装</Select.Option>
                  <Select.Option value="毛坯">毛坯</Select.Option>
                  <Select.Option value="豪装">豪装</Select.Option>
                </Select>
              </div>
              <div>
                <span style={{ color: '#6b7280', marginRight: 8 }}>钥匙:</span>
                <Select
                  placeholder="全部钥匙类型"
                  value={keyFilter}
                  onChange={setKeyFilter}
                  style={{ width: 160 }}
                  allowClear
                >
                  <Select.Option value="物理钥匙">物理钥匙</Select.Option>
                  <Select.Option value="密码锁">密码锁</Select.Option>
                  <Select.Option value="无钥匙">无钥匙</Select.Option>
                </Select>
              </div>
            </Space>
          </Card>
        )}

        <Card styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              total,
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </Card>
      </div>
    </Spin>
  )
}