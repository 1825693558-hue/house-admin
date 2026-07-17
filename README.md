# Admin - 房源管理后台

房源管理系统的 Web 管理后台，基于 React + Ant Design，用于小区管理、家电类型管理、账号管理和房源数据查看。

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.7 | 类型安全 |
| Ant Design | 5.24 | 组件库 |
| React Router | 7 | 路由 |
| Axios | 1.18 | HTTP 请求 |
| Vite | 6.3 | 构建工具 |

## 目录结构

```
admin/
├── src/
│   ├── api/                    # 后端 API 封装
│   │   ├── request.ts          # Axios 实例、拦截器、环境变量读取
│   │   ├── auth.ts             # 登录、获取当前用户
│   │   ├── house.ts            # 房源接口
│   │   ├── community.ts        # 小区接口
│   │   ├── appliance.ts        # 家电类型接口
│   │   └── user.ts             # 账号管理接口
│   ├── components/
│   │   └── layout/
│   │       └── AppLayout.tsx   # 侧边栏 + 顶栏布局
│   ├── pages/                  # 页面组件
│   │   ├── Login.tsx           # 登录页
│   │   ├── Dashboard.tsx       # 仪表盘（统计卡片 + 状态分布 + 最近录入）
│   │   ├── Houses.tsx          # 房源列表（多条件筛选）
│   │   ├── Communities.tsx     # 小区管理（CRUD）
│   │   ├── Appliances.tsx      # 家电类型管理（CRUD）
│   │   └── Users.tsx           # 账号管理（CRUD + 重置密码）
│   ├── utils/
│   │   └── auth.ts             # Token / 用户信息 localStorage 读写
│   ├── data/
│   │   └── mockData.ts         # Mock 数据（备用，当前未使用）
│   ├── App.tsx                 # 路由配置 + 路由守卫
│   ├── types.ts                # 类型定义 + CSS 类名映射
│   ├── global.css              # 全局样式
│   ├── main.tsx                # 入口
│   └── vite-env.d.ts           # 环境变量类型声明
├── .env                        # 环境变量（gitignore）
├── .env.example                # 环境变量模板
├── index.html                  # HTML 模板
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```ini
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:8000

# 是否使用 Mock 数据（true=mock，false=真实接口）
VITE_USE_MOCK=false
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`，默认管理员账号 `admin` / `admin123`。

### 4. 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 后端 API 基础地址 |
| `VITE_USE_MOCK` | `false` | `true` 使用前端 Mock 数据，`false` 请求后端真实接口 |

修改 `.env` 后需重启开发服务器。

## 页面功能

| 页面 | 路由 | 功能 | 权限 |
|------|------|------|------|
| 登录 | `/login` | 账号密码登录，JWT Token 存储 | 公开 |
| 仪表盘 | `/dashboard` | 房源统计卡片、状态分布图、最近录入列表 | 登录用户 |
| 房源数据 | `/houses` | 多条件筛选（状态/装修/钥匙类型）、关键词搜索、分页 | 登录用户 |
| 小区管理 | `/communities` | 新增/编辑/删除小区 | ADMIN |
| 家电管理 | `/appliances` | 新增/编辑/删除家电类型 | ADMIN |
| 账号管理 | `/users` | 创建/编辑/删除账号、重置密码 | ADMIN |

## 认证机制

- 登录成功后将 `access_token` 和用户信息存入 `localStorage`
- 所有请求通过 Axios 请求拦截器自动附加 `Authorization: Bearer <token>` 头
- 401 响应自动清除 Token 并跳转登录页
- 路由层通过 `PrivateRoute` 组件守卫，未登录自动跳转 `/login`

## 前后端联调

确保后端服务已启动：

```bash
# 终端 1：启动后端
cd backend
python -m uvicorn main:app --reload --port 8000

# 终端 2：启动前端
cd admin
npm run dev
```

前端默认请求 `http://localhost:8000`，如后端地址不同请修改 `.env` 中的 `VITE_API_BASE_URL`。