# PartnerHub 从零部署指南

本文档记录如何将 PartnerHub 完整部署到云端，使前后端和数据库连通。

> **部署架构**：
> - 前端 → **Vercel**（免费）
> - 后端 → **Railway**（免费额度 $5/月）
> - 数据库 → **Neon**（免费额度 0.5GB）

---

## 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **New repository**
3. 仓库名填 `PartnerHub`，选 **Private**（私有）
4. **不要**勾选 README/.gitignore（我们已有）
5. 点击 **Create repository**

在本地推送代码：

```bash
cd PartnerHub
git init
git add .
git commit -m "feat: initial project scaffold with Next.js + Nest.js + Prisma"
git branch -M main
git remote add origin https://github.com/<你的用户名>/PartnerHub.git
git push -u origin main
```

---

## 第二步：Neon 配置数据库

1. 打开 [Neon Console](https://console.neon.tech)
2. 点击 **New Project**
3. 填写：
   - **Project Name**: `partnerhub`
   - **Region**: 选离你最近的区域（推荐 `US East` 或 `Singapore`）
   - **Database Name**: `partnerhub`
4. 创建完成后，在 **Connection Details** 页面：
   - 选择 **Connection string** 标签
   - 复制连接字符串，格式类似：
     ```
     postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/partnerhub?sslmode=require
     ```
5. **保存好这个连接字符串**，后面要用

### 执行数据库迁移

在本地执行（使用 Neon 的连接字符串）：

```bash
cd backend
# 临时设置 DATABASE_URL 为 Neon 的连接字符串
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/partnerhub?sslmode=require" npx prisma migrate dev --name init
```

或者修改 `backend/.env` 中的 `DATABASE_URL` 为 Neon 的值，然后执行：

```bash
npx prisma migrate dev --name init
```

---

## 第三步：Railway 部署后端

1. 打开 [Railway](https://railway.app)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 授权 GitHub 并选择 `PartnerHub` 仓库
4. Railway 会检测到 monorepo，需要配置：
   - 点击新建的 Service → **Settings**
   - **Root Directory**: 设为 `backend`
   - 这样 Railway 知道只构建 `backend/` 目录
5. 配置环境变量（**Settings → Variables**）：
   - `DATABASE_URL` = Neon 的连接字符串（第二步获取的）
   - `PORT` = `3001`
   - `FRONTEND_URL` = 先留空，等 Vercel 部署后填写
6. 部署后，在 **Settings → Networking** 中：
   - 点击 **Generate Domain** 生成公开域名
   - 记录域名，如：`partnerhub-backend-production.up.railway.app`
7. 验证部署：浏览器打开 `https://你的域名/api/health`
   - 应返回：`{"status":"ok","database":"connected","timestamp":"..."}`

---

## 第四步：Vercel 部署前端

1. 打开 [Vercel](https://vercel.com)
2. 点击 **Add New... → Project**
3. 导入 GitHub 仓库 `PartnerHub`
4. 配置：
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: 点击 **Edit**，设为 `frontend`
   - **Environment Variables**: 添加
     - `NEXT_PUBLIC_API_URL` = `https://你的Railway域名`（第三步获取的域名，要带 https://）
5. 点击 **Deploy**
6. 部署成功后，记录 Vercel 给你的域名，如：`partnerhub.vercel.app`

---

## 第五步：回填 CORS 配置

1. 回到 **Railway** 控制面板
2. 找到 `FRONTEND_URL` 环境变量
3. 修改为 Vercel 的域名：`https://partnerhub.vercel.app`
4. Railway 会自动重新部署

---

## 第六步：验证全链路

1. 打开 Vercel 前端页面
2. 你应该看到三个状态卡片全部显示绿色：
   - ✅ Frontend (Next.js) - Running
   - ✅ Backend (Nest.js) - Connected
   - ✅ Database (PostgreSQL) - Connected

如果看到红色/黄色，检查：
- Backend 红色 → 确认 Railway 部署成功，`NEXT_PUBLIC_API_URL` 配置正确
- Database 红色 → 确认 Neon 的 `DATABASE_URL` 配置正确，已执行 `prisma migrate dev`

---

## 环境变量速查表

### 后端 (Railway)

| 变量名 | 值 | 说明 |
|--------|---|------|
| `DATABASE_URL` | `postgresql://...@neon.tech/partnerhub?sslmode=require` | Neon 连接串 |
| `PORT` | `3001` | 服务端口 |
| `FRONTEND_URL` | `https://partnerhub.vercel.app` | CORS 白名单 |

### 前端 (Vercel)

| 变量名 | 值 | 说明 |
|--------|---|------|
| `NEXT_PUBLIC_API_URL` | `https://partnerhub-backend-xxx.up.railway.app` | 后端地址 |

---

## 常见问题

### Q: Railway 构建失败？

检查 `backend/railway.toml` 是否存在，构建命令是否正确：
```
npm install && npx prisma generate && npm run build
```

### Q: CORS 报错？

确认 Railway 环境变量 `FRONTEND_URL` 设置为完整的 Vercel 域名（含 `https://`）。

### Q: 数据库连接失败？

1. 确认 Neon 项目状态是 Active
2. 确认连接字符串包含 `?sslmode=require`
3. 在 Neon 控制台的 SQL Editor 中执行 `SELECT 1` 测试连接

### Q: 本地想同时开发前后端？

```bash
# 在根目录运行
npm run dev
```

这会同时启动前端（3000）和后端（3001）。
