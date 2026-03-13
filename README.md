# PartnerHub

全栈项目：Next.js (前端) + Nest.js (后端) + PostgreSQL (数据库)

## 技术栈

| 层级 | 技术 | 部署平台 |
|------|------|----------|
| 前端 | Next.js 16 + TypeScript + Tailwind CSS | Vercel |
| 后端 | Nest.js 11 + TypeScript + Prisma 5 | Railway |
| 数据库 | PostgreSQL | Neon |

## 项目结构

```
PartnerHub/
├── frontend/          # Next.js 前端应用
│   ├── app/           # App Router 页面
│   ├── public/        # 静态资源
│   └── .env.local     # 前端环境变量（不提交到 Git）
├── backend/           # Nest.js 后端应用
│   ├── src/           # 源代码
│   │   ├── prisma/    # Prisma 数据库服务
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── prisma/        # Prisma schema & migrations
│   ├── .env           # 后端环境变量（不提交到 Git）
│   └── railway.toml   # Railway 部署配置
├── package.json       # 根目录 monorepo 脚本
└── README.md
```

## 本地开发

### 前置要求

- Node.js >= 18
- 一个 PostgreSQL 数据库（本地安装或使用 Neon 免费版）

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd PartnerHub
```

### 2. 配置环境变量

```bash
# 后端
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入你的数据库连接字符串

# 前端
cp frontend/.env.example frontend/.env.local
```

### 3. 安装依赖

```bash
# 根目录
npm install

# 前端
cd frontend && npm install

# 后端
cd ../backend && npm install
```

### 4. 初始化数据库

```bash
cd backend
npx prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
# 在根目录同时启动前后端
cd ..
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查（含数据库连接状态） |

## 部署

详细的从零部署指南请看 [DEPLOY.md](./DEPLOY.md)
