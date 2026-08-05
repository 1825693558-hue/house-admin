import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Input, Badge, Avatar, Dropdown, Drawer, Select } from 'antd'
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
  FontSizeOutlined,
} from '@ant-design/icons'
import { getUser, removeToken } from '../../utils/auth'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/communities', icon: <HomeOutlined />, label: '小区管理' },
  { key: '/appliances', icon: <ToolOutlined />, label: '家电管理' },
  { key: '/users', icon: <TeamOutlined />, label: '账号管理' },
  { key: '/houses/sale', icon: <HomeOutlined />, label: '出售房源' },
  { key: '/houses/rent', icon: <HomeOutlined />, label: '出租房源' },
]

const pageTitleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/communities': '小区管理',
  '/appliances': '家电管理',
  '/users': '账号管理',
  '/houses/sale': '出售房源',
  '/houses/rent': '出租房源',
  '/houses/new': '新增房源',
}

const roleLabelMap: Record<string, string> = {
  ADMIN: '管理员',
  USER: '普通用户',
}

const FONT_SCALE_KEY = 'admin_font_scale'
const FONT_OPTIONS = [
  { value: '0.9', label: '小' },
  { value: '1', label: '标准' },
  { value: '1.15', label: '大' },
  { value: '1.3', label: '超大' },
  { value: '1.5', label: '特大' },
]

function loadFontScale(): string {
  const saved = localStorage.getItem(FONT_SCALE_KEY)
  if (saved && FONT_OPTIONS.some((o) => o.value === saved)) return saved
  return '1'
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [fontScale, setFontScale] = useState<string>(loadFontScale)
  const location = useLocation()
  const navigate = useNavigate()
  const { modal } = App.useApp()

  const user = getUser()
  const nickname = user?.nickname || user?.username || '未登录'
  const roleLabel = roleLabelMap[user?.role || ''] || user?.role || ''

  const selectedKey = location.pathname
  const pageTitle = pageTitleMap[location.pathname] || '仪表盘'

  // 监听窗口大小变化，检测移动端
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 应用字体缩放
  useEffect(() => {
    document.documentElement.style.setProperty('--ah-font-scale', fontScale)
    localStorage.setItem(FONT_SCALE_KEY, fontScale)
  }, [fontScale])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
    if (isMobile) {
      setMobileOpen(false)
    }
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

  // 侧边栏菜单内容（PC + 移动端共用）
  const sidebarContent = (
    <>
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
        {!collapsed && !isMobile && (
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
            建华中介
          </span>
        )}
        {isMobile && (
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
            建华中介
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
      {!collapsed && !isMobile && (
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
      {collapsed && !isMobile && (
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
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* PC 端侧边栏 */}
      {!isMobile && (
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
          {sidebarContent}
        </Sider>
      )}

      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          width={240}
          bodyStyle={{ padding: 0 }}
          className="ah-mobile-drawer"
        >
          {sidebarContent}
        </Drawer>
      )}

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
          className="ah-layout-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
              {pageTitle}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="ah-header-actions">
            <Input
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="搜索..."
              style={{ width: 240, borderRadius: 8 }}
              className="ah-header-search"
            />
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            </Badge>
            <Select
              value={fontScale}
              onChange={(val) => setFontScale(val)}
              options={FONT_OPTIONS}
              variant="borderless"
              style={{ width: 80 }}
              suffixIcon={<FontSizeOutlined />}
              popupMatchSelectWidth={false}
            />
            <Button type="text" icon={<SettingOutlined style={{ fontSize: 18 }} />} className="ah-header-setting" />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size={32} style={{ background: '#2d8f5e' }} icon={<UserOutlined />} />
                <span style={{ fontSize: 14, color: '#1f2937' }} className="ah-header-nickname">
                  {nickname}
                </span>
                <DownOutlined style={{ fontSize: 12, color: '#6b7280' }} className="ah-header-down" />
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
          className="ah-layout-content"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
