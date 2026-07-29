import { useEffect, useState } from 'react'
import { Card, Button, Modal, Form, Input, InputNumber, Table, Spin, Dropdown, type MenuProps } from 'antd'
import { App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getAppliances, createAppliance, updateAppliance, deleteAppliance } from '../api/appliance'
import type { ApplianceItem } from '../api/appliance'

export default function Appliances() {
  const [data, setData] = useState<ApplianceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ApplianceItem | null>(null)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAppliances()
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

  const handleAdd = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: ApplianceItem) => {
    setEditing(record)
    form.setFieldsValue({ name: record.name, icon: record.icon, sort_order: record.sort_order })
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAppliance(id)
      message.success('删除成功')
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败'
      message.error(msg)
    }
  }

  const handleSave = async (values: { name: string; icon?: string; sort_order?: number }) => {
    try {
      if (editing) {
        await updateAppliance(editing.id, values)
        message.success('修改成功')
      } else {
        await createAppliance({ ...values, sort_order: values.sort_order || 0 })
        message.success('新增成功')
      }
      setModalOpen(false)
      fetchData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失败'
      message.error(msg)
    }
  }

  return (
    <Spin spinning={loading}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增类型
          </Button>
        </div>
        <Card>
          <Table
            dataSource={data}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
            columns={[
              {
                title: '图标',
                dataIndex: 'icon',
                width: 80,
                render: (icon: string) => <span style={{ fontSize: 20 }}>{icon || '📦'}</span>,
              },
              {
                title: '名称',
                dataIndex: 'name',
                render: (name: string) => <span style={{ fontWeight: 600, fontSize: 15 }}>{name}</span>,
              },
              {
                title: '排序',
                dataIndex: 'sort_order',
                width: 100,
                responsive: ['md'],
                render: (sort: number) => <span style={{ color: '#9ca3af', fontSize: 13 }}>{sort}</span>,
              },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: (_: unknown, record: ApplianceItem) => {
                  const menuItems: MenuProps['items'] = [
                    {
                      key: 'edit',
                      icon: <EditOutlined />,
                      label: '编辑',
                      onClick: () => handleEdit(record),
                    },
                    {
                      type: 'divider',
                      key: 'divider',
                    },
                    {
                      key: 'delete',
                      icon: <DeleteOutlined />,
                      label: '删除',
                      danger: true,
                      onClick: () => {
                        Modal.confirm({
                          title: '确认删除',
                          content: `确定要删除家电类型 "${record.name}" 吗？`,
                          okText: '删除',
                          okType: 'danger',
                          cancelText: '取消',
                          onOk: () => handleDelete(record.id),
                        })
                      },
                    },
                  ]
                  return (
                    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                      <Button type="text" size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                  )
                },
              },
            ] as ColumnsType<ApplianceItem>}
          />
        </Card>

        <Modal
          title={editing ? '编辑家电类型' : '新增家电类型'}
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
              label="名称"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>
            <Form.Item
              name="icon"
              label="图标 Emoji"
            >
              <Input placeholder="例如: ❄️ 🧊 📺" />
            </Form.Item>
            <Form.Item
              name="sort_order"
              label="排序权重"
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="数字越大越靠前" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  )
}