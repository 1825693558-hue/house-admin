import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, Checkbox } from 'antd'
import { App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { login, getMe } from '../api/auth'
import { setToken, setUser, getRememberedCredentials, saveCredentials } from '../utils/auth'

const { Title } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { message } = App.useApp()

  // 页面加载时，如果有记住的账号密码则自动填充
  useEffect(() => {
    const saved = getRememberedCredentials()
    if (saved) {
      form.setFieldsValue({ username: saved.username, password: saved.password })
      setRemember(true)
    }
  }, [])

  const handleFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      // 1. 获取 token
      const tokenRes = await login(values)
      setToken(tokenRes.access_token)
      saveCredentials(values.username, values.password, remember)
      // 2. 用 token 获取当前用户信息
      const user = await getMe()
      setUser(user)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2d8f5e 0%, #1e6b46 50%, #145232 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 36px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2d8f5e, #1e6b46)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 24,
              marginBottom: 16,
            }}
          >
            A
          </div>
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>
            AI House 管理后台
          </Title>
          <p style={{ color: '#6b7280', marginTop: 8, marginBottom: 0 }}>
            请输入您的账号密码登录系统
          </p>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={handleFinish}
          autoComplete="off"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              >
                记住密码
              </Checkbox>
            </div>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}