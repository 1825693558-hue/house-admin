import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Communities from './pages/Communities'
import Appliances from './pages/Appliances'
import Users from './pages/Users'
import Houses from './pages/Houses'
import { isLoggedIn } from './utils/auth'
import { setNavigate } from './utils/navigate'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

// 在 Router 内部注册 navigate，供 axios 拦截器使用
function NavigateRegister() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate((path) => navigate(path, { replace: true }))
  }, [navigate])
  return null
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2d8f5e',
          borderRadius: 10,
          fontFamily: "'DM Sans', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <NavigateRegister />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="communities" element={<PrivateRoute><Communities /></PrivateRoute>} />
              <Route path="appliances" element={<PrivateRoute><Appliances /></PrivateRoute>} />
              <Route path="users" element={<PrivateRoute><Users /></PrivateRoute>} />
              <Route path="houses" element={<PrivateRoute><Houses /></PrivateRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}