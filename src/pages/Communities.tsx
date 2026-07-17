import { useEffect, useState } from 'react'
import { Card, Button, Input, Table, Modal, Form, Popconfirm, Space, Spin } from 'antd'
import { App } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
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
      const res = await getCommunities({ page: 1, size: 100 })
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
    form.setFieldsValue({ name: record.name, address: record.address })
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

  const handleSave = async (values: { name: string; address?: string }) => {
    try {
      if (editing) {
        await updateCommunity(editing.id, values)
        message.success('修改成功')
      } else {
        await createCommunity(values)
        message.success('新增成功')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败'
      message.error(msg)
    }
  }

  const columns = [
    { title: '编号', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: CommunityItem) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除小区 "${record.name}" 吗？`}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            placeholder="搜索小区名称或地址..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增小区
          </Button>
        </div>
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
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
          </Form>
        </Modal>
      </div>
    </Spin>
  )
}