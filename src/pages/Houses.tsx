import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, Table, Tag, Select, Space, Spin, Popconfirm } from 'antd'
import { App } from 'antd'
import { SearchOutlined, FilterOutlined, ReloadOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons'
import { getHouses, deleteHouse } from '../api/house'
import type { HouseItem } from '../api/house'
import { statusClassMap, decorationClassMap, keyClassMap } from '../types'

interface HousesProps {
  type: 'sale' | 'rent'
}

const saleStatusOptions = ['在售', '已售', '空闲', '下架']
const rentStatusOptions = ['出租中', '已租', '空闲', '下架']

export default function Houses({ type }: HousesProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<HouseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [decorationFilter, setDecorationFilter] = useState<string | undefined>(undefined)
  const [keyFilter, setKeyFilter] = useState<string | undefined>(undefined)
  const [filterVisible, setFilterVisible] = useState(false)
  const { message } = App.useApp()

  const isSale = type === 'sale'
  const pageTitle = isSale ? '出售房源' : '出租房源'
  const addButtonText = isSale ? '新增出售房源' : '新增出租房源'
  const statusOptions = isSale ? saleStatusOptions : rentStatusOptions

  const fetchData = async (page = currentPage, size = pageSize) => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page, size, house_use_type: type }
      if (search) params.keyword = search
      if (statusFilter) params.status = statusFilter
      if (decorationFilter) params.decoration = decorationFilter
      if (keyFilter) params.key_type = keyFilter

      const res = await getHouses(params)
      setData(res.items)
      setTotal(res.total)
      setCurrentPage(page)
      setPageSize(size)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // 类型变化时重置到第 1 页
  useEffect(() => {
    setCurrentPage(1)
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, decorationFilter, keyFilter, type])

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchData(1)
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleReset = () => {
    setSearch('')
    setStatusFilter(undefined)
    setDecorationFilter(undefined)
    setKeyFilter(undefined)
    setCurrentPage(1)
    // 由于 state 是异步的，直接传入重置后的参数调用
    setTimeout(() => fetchData(1), 0)
    message.success('筛选已重置')
  }

  const handleTableChange = (page: number, size: number) => {
    fetchData(page, size)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteHouse(id)
      message.success('删除成功')
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败'
      message.error(msg)
    }
  }

  const priceColumn = isSale
    ? {
        title: '出售价(万)',
        dataIndex: 'sale_price',
        key: 'sale_price',
        width: 110,
        render: (v: number) => <span style={{ color: '#2d8f5e', fontWeight: 600 }}>{v || '-'}</span>,
      }
    : {
        title: '出租价(元/月)',
        dataIndex: 'rent_price',
        key: 'rent_price',
        width: 130,
        render: (v: number) => <span style={{ color: '#2980b9', fontWeight: 600 }}>{v || '-'}</span>,
      }

  const columns = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '小区',
      dataIndex: 'community_name',
      key: 'community_name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text || '-'}</span>,
    },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '面积(m²)', dataIndex: 'area', key: 'area', width: 100 },
    priceColumn,
    {
      title: '价格备注',
      dataIndex: 'price_note',
      key: 'price_note',
      width: 120,
      render: (v: string) => <span style={{ color: '#6b7280' }}>{v || '-'}</span>,
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
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: HouseItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => message.info(`查看房源: ${record.community_name || record.id}`)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/houses/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该房源吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{pageTitle}</h2>
          <Space>
            <Input
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="搜索小区或地址..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />
            <Button icon={<FilterOutlined />} onClick={() => setFilterVisible(!filterVisible)}>
              筛选
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/houses/new?type=${type}`)}>
              {addButtonText}
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
                  {statusOptions.map((s) => (
                    <Select.Option key={s} value={s}>{s}</Select.Option>
                  ))}
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
              current: currentPage,
              pageSize: pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: handleTableChange,
            }}
          />
        </Card>
      </div>
    </Spin>
  )
}
