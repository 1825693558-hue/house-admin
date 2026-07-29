import { useEffect, useState } from 'react'
import { Card, Button, Input, InputNumber, Table, Modal, Form, Dropdown, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { App } from 'antd'
import { PlusOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons'
import { getCommunities, createCommunity, updateCommunity, deleteCommunity } from '../api/community'
import type { CommunityItem } from '../api/community'

export default function Communities() {
  const [data, setData] = useState<CommunityItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CommunityItem | null>(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getCommunities({
        page: 1,
        size: 100,
        sort_by: 'sort_order',
        sort_order: 'asc',
      })
      setData(res.items)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '加载失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = data.filter(
    (item) =>
      item.name.includes(search) ||
      (item.address || '').includes(search)
  )

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: CommunityItem) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      sort_order: record.sort_order,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCommunity(id)
      message.success('删除成功')
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败'
      message.error(msg)
    }
  }

  const handleSave = async (values: { name: string; address?: string; sort_order?: number }) => {
    try {
      if (editing) {
        await updateCommunity(editing.id, values)
        message.success('修改成功')
      } else {
        await createCommunity({ ...values, sort_order: values.sort_order || 0 })
        message.success('新增成功')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败'
      message.error(msg)
    }
  }

  const columns: ColumnsType<CommunityItem> = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      render: (sort: number) => <span style={{ color: '#9ca3af', fontSize: 13 }}>{sort}</span>,
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, responsive: ['md'] },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: CommunityItem) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: '编辑',
                onClick: () => handleEdit(record),
              },
              {
                key: 'delete',
                label: '删除',
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: '确认删除',
                    content: `确定要删除小区 "${record.name}" 吗？`,
                    okText: '删除',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk: () => handleDelete(record.id),
                  })
                },
              },
            ],
          }}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Spin spinning={loading}>
      <div className="ah-page-communities">
        {/* 工具栏：响应式布局 */}
        <div className="ah-toolbar">
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="搜索小区名称或地址..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="ah-toolbar-search"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="ah-toolbar-btn">
            新增小区
          </Button>
        </div>

        {/* 表格：响应式滚动 */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 'max-content' }}
            className="ah-responsive-table"
          />
        </Card>

        <Modal
          title={editing ? '编辑小区' : '新增小区'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
          okText="保存"
          cancelText="取消"
          forceRender
        >
          <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
            <Form.Item
              name="name"
              label="小区名称"
              rules={[{ required: true, message: '请输入小区名称' }]}
            >
              <Input placeholder="请输入小区名称" />
            </Form.Item>
            <Form.Item
              name="address"
              label="地址"
            >
              <Input placeholder="请输入地址" />
            </Form.Item>
            <Form.Item
              name="sort_order"
              label="排序权重"
              initialValue={0}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越小越靠前" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  )
}
