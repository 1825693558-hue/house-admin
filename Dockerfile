# ============================================================
# AI House Admin - 前端构建 + Nginx 托管
# 构建阶段：编译 React 静态文件（Vite 构建时注入环境变量）
# 运行阶段：用 Nginx 提供静态文件服务
# ============================================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 构建参数：API 地址（必须在构建时传入）
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_USE_MOCK=${VITE_USE_MOCK}

# 安装依赖（删除 lock 文件重新安装，避免 Windows 生成的 lock 在 Linux 下不兼容）
COPY package.json ./
RUN npm install

# 复制源码并构建
COPY . .
RUN npm run build

# ---------- 运行阶段 ----------
FROM nginx:alpine

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
