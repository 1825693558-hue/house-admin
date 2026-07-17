import { useEffect, useState } from 'react'
import { Card, Button, Input, Table, Modal, Form, Select, Tag, Space, Spin } from 'antd'
import { App } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, KeyOutlined, DeleteOutlined } from '@ant-design/icons'
import { getUsers, createUser, updateUser, deleteUser } from '../api/user'
import type { UserItem } from '../api/user'

const roleTagMap: Record<string, string> = {
  ADMIN: 'role-admin',
  USER: 'role-editor',
}

const roleLabelMap: Record<string, string> = {
  ADMIN: '管理员',
  USER: '普通用户',
}

export default function Users() {
  const [data, setData] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [form] = Form.useForm()
  const { message, modal } = App.useApp()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page: 1, size: 100 })
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
      item.username.includes(search) ||
      (item.nickname || '').includes(search) ||
      item.role.includes(search)
  )

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: UserItem) => {
    setEditing(record)
    form.setFieldsValue({
      username: record.username,
      nickname: record.nickname,
      role: record.role,
    })
    setModalOpen(true)
  }

  const handleResetPassword = (record: UserItem) => {
    modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 "${record.nickname || record.username}" 的密码吗？`,
      okText: '重置',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateUser(record.id, { password: '123456' })
          message.success('密码已重置为 123456')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '重置失败'
          message.error(msg)
        }
      },
    })
  }

  const handleDelete = (record: UserItem) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.nickname || record.username}" 吗？`,
      okText: '删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(record.id)
          message.success('删除成功')
          fetchData()
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '删除失败'
          message.error(msg)
        }
      },
    })
  }

  const handleSave = async (values: { username: string; nickname: string; role: string; password?: string }) => {
    try {
      if (editing) {
        await updateUser(editing.id, {
          nickname: values.nickname,
          role: values.role,
        })
        message.success('修改成功')
      } else {
        await createUser({
          username: values.username,
          nickname: values.nickname,
          role: values.role,
          password: values.password || '123456',
        })
        message.success('创建成功')
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v: string) => <Tag className={roleTagMap[v] || ''}>{roleLabelMap[v] || v}</Tag>,
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: unknown, record: UserItem) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="text" size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)}>
            重置密码
          </Button>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
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
            placeholder="搜索用户名、昵称或角色..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建账号
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
          title={editing ? '编辑账号' : '创建账号'}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={() => form.submit()}
          okText="保存"
          cancelText="取消"
          forceRender
        >
          <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" disabled={!!editing} />
            </Form.Item>
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                <Select.Option value="ADMIN">管理员</Select.Option>
                <Select.Option value="USER">普通用户</Select.Option>
              </Select>
            </Form.Item>
            {!editing && (
              <Form.Item
                name="password"
                label="初始密码"
                rules={[{ required: true, message: '请输入初始密码' }]}
              >
                <Input.Password placeholder="请输入初始密码" />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </Spin>
  )
}