# 梦境解构师 (Dream Decoder)

一款基于 AI 的梦境记录与解析应用，帮助用户记录梦境并通过 DeepSeek AI 进行深度解构分析。

## 功能

- **梦境记录** - 用文字记录你的梦境，支持标题、内容、情绪标签
- **AI 解构** - 基于 DeepSeek 大模型对梦境进行象征意义和心理分析
- **梦境时间线** - 按时间浏览所有梦境记录
- **对话式交互** - 通过聊天面板与 AI 深入探讨梦境含义
- **邮箱验证码登录** - 无需密码，邮箱验证码快速登录

## 技术栈

**前端**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画)
- React Router

**后端**
- Express + TypeScript
- Prisma (ORM)
- PostgreSQL
- JWT 认证
- DeepSeek API

## 快速开始

### 前置条件

- Node.js >= 18
- PostgreSQL
- DeepSeek API Key

### 1. 克隆项目

```bash
git clone https://github.com/AxelWT/dream-decoder.git
cd dream-decoder
```

### 2. 后端配置

```bash
cd backend
npm install

# 复制环境变量并填写
cp .env.example .env
```

编辑 `.env` 文件，填写以下配置：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接地址 |
| `JWT_SECRET` | JWT 密钥 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | 邮箱 SMTP 配置（用于发送验证码） |

```bash
# 初始化数据库
npm run db:push
npm run db:generate

# 启动后端
npm run dev
```

### 3. 前端配置

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，后端默认运行在 `http://localhost:3001`。

## 项目结构

```
dream-decoder/
├── frontend/                # 前端
│   └── src/
│       ├── components/      # UI 组件
│       │   ├── Auth/        # 登录注册
│       │   ├── Chat/        # AI 对话
│       │   ├── Dream/       # 梦境相关
│       │   ├── Layout/      # 布局（侧栏、头部）
│       │   └── UI/          # 通用组件
│       ├── pages/           # 页面
│       ├── services/        # API 请求
│       ├── stores/          # Zustand 状态
│       └── hooks/           # 自定义 Hooks
├── backend/                 # 后端
│   └── src/
│       ├── routes/          # 路由
│       ├── services/        # 业务逻辑
│       ├── middleware/      # 中间件
│       └── utils/           # 工具函数
│   └── prisma/
│       └── schema.prisma    # 数据库模型
```

## License

MIT
