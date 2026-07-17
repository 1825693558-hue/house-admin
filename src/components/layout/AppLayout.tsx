import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Input, Badge, Avatar, Dropdown } from 'antd'
import { App } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  HomeOutlined,
  ToolOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons'
import { getUser, removeToken } from '../../utils/auth'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/communities', icon: <HomeOutlined />, label: '小区管理' },
  { key: '/appliances', icon: <ToolOutlined />, label: '家电管理' },
  { key: '/users', icon: <TeamOutlined />, label: '账号管理' },
  { key: '/houses', icon: <HomeOutlined />, label: '房源数据' },
]

const pageTitleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/communities': '小区管理',
  '/appliances': '家电管理',
  '/users': '账号管理',
  '/houses': '房源数据',
}

const roleLabelMap: Record<string, string> = {
  ADMIN: '管理员',
  USER: '普通用户',
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { modal } = App.useApp()

  const user = getUser()
  const nickname = user?.nickname || user?.username || '未登录'
  const roleLabel = roleLabelMap[user?.role || ''] || user?.role || ''

  const selectedKey = location.pathname
  const pageTitle = pageTitleMap[location.pathname] || '仪表盘'

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '退出',
      cancelText: '取消',
      onOk: () => {
        removeToken()
        navigate('/login')
      },
    })
  }

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '账号设置' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#fff',
          boxShadow: '1px 0 4px rgba(0,0,0,0.04)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2d8f5e, #1e6b46)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            A
          </div>
          {!collapsed && (
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
              AI House
            </span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 20px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#fff',
            }}
          >
            <Avatar size={36} style={{ background: '#2d8f5e' }} icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{nickname}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{roleLabel}</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 0',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'center',
              background: '#fff',
            }}
          >
            <Avatar size={36} style={{ background: '#2d8f5e' }} icon={<UserOutlined />} />
          </div>
        )}
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
              {pageTitle}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="搜索..."
              style={{ width: 240, borderRadius: 8 }}
            />
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Button type="text" icon={<SettingOutlined style={{ fontSize: 18 }} />} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: '#2d8f5e' }} icon={<UserOutlined />} />
                <span style={{ fontSize: 14, color: '#1f2937' }}>{nickname}</span>
                <DownOutlined style={{ fontSize: 12, color: '#6b7280' }} />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 10,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}