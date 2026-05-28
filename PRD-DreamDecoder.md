
# AI 梦境解构师 (DreamDecoder) — 产品需求文档

## 一、产品概述

### 1.1 产品名称
**梦境解构师** / DreamDecoder

### 1.2 一句话定位
> 不只是解梦，而是读懂你的潜意识 —— 结合心理学派的 AI 梦境长期追踪与深度解析平台。

### 1.3 核心差异化

| 维度 | 现有产品（Dreambook 等） | 梦境解构师 |
|------|--------------------------|------------|
| 交互模式 | 输入一段话 → 返回一段套话 | 多轮引导式对话，AI 追问细节 |
| 分析深度 | 符号字典式匹配 | 荣格/弗洛伊德心理学派深度解析 |
| 个人化 | 无记忆，每次独立 | 个人背景档案 + 历史梦境关联分析 |
| 长期价值 | 无 | 潜意识焦虑曲线、梦境主题演化图 |
| 输出物 | 纯文字 | 精美梦境视觉卡片 + 可分享内容 |
| 心理学支撑 | 无 | 荣格原型、弗洛伊德释梦理论、认知心理学 |

### 1.4 目标用户
- **主用户群**：25-40 岁，关注心理健康与自我探索的都市人群
- **次用户群**：心理学爱好者、冥想/正念实践者、创意工作者
- **场景**：早晨醒来记录梦境、睡前回顾、心理咨询辅助

---

## 二、功能架构

### 2.1 功能全景图

```
┌─────────────────────────────────────────────────────────┐
│                    梦境解构师 DreamDecoder                │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  梦境记录  │  AI 解构  │  长期追踪  │  视觉卡片  │   用户系统    │
│          │          │          │          │              │
│ · 快速记录 │ · 多轮对话 │ · 焦虑曲线 │ · 梦境卡片 │ · 注册/登录  │
│ · 语音输入 │ · 学派选择 │ · 主题图谱 │ · 分享海报 │ · 个人档案   │
│ · 标签分类 │ · 符号解读 │ · 重复梦境 │ · 导出PDF  │ · 订阅付费   │
│ · 情绪标注 │ · 原型分析 │ · 月度报告 │ · 梦境画廊 │ · 设置偏好   │
│ · 梦境日记 │ · 潜意识映射│ · 对比分析 │           │              │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

---

## 三、核心功能详细设计

### 3.1 梦境记录系统

#### 3.1.1 快速记录
- **入口**：首页大按钮「记录今晚的梦」，降低记录门槛
- **输入方式**：
  - 文字输入（主）
  - 语音输入 → Whisper API 转文字（次）
- **结构化字段**：
  ```
  梦境内容（必填）
  ├── 梦境标题（可选，AI 自动生成）
  ├── 情绪标签（多选）：恐惧/焦虑/愉悦/悲伤/愤怒/困惑/平静/兴奋
  ├── 清晰度：模糊/一般/清晰/非常清晰
  ├── 梦境类型：噩梦/反复梦/清醒梦/预知梦/日常梦
  ├── 出现场景（多选）：水/高空/追逐/坠落/考试/故人/死亡/飞行/迷路/裸体
  ├── 出场人物（标签）：自己/陌生人/亲人/朋友/名人/已故者
  ├── 色彩感知：黑白/灰暗/正常/鲜艳/超现实色彩
  └── 记录时间（自动）
  ```

#### 3.1.2 情绪标注
- 记录时选择梦境情绪（支持多选 + 强度滑块）
- 醒后补充「醒来情绪」
- 为后续焦虑曲线提供数据源

#### 3.1.3 梦境日记视图
- 时间线形式展示历史梦境
- 支持按情绪、标签、日期筛选
- 卡片式布局，显示标题 + 情绪标签 + 一句话摘要

### 3.2 AI 解构系统（核心差异化）

#### 3.2.1 引导式多轮对话
**不同于「输入→输出」的套话模式，AI 会主动追问：**

```
用户：我梦见在一片黑暗的森林里迷路了，怎么走都走不出去。

AI：这个梦境很有意思。森林在荣格心理学中常代表「无意识」本身。
   让我问你几个问题来更深入地理解：

   1. 你在梦里感到的是恐惧，还是一种平静的迷失？
   2. 森林里有什么声音吗？比如风声、动物声、或者人声？
   3. 最近生活中，是否有什么事情让你感到"找不到方向"？

用户：我感到很焦虑。好像有水声。最近确实在纠结要不要换工作...

AI：「水声」这个意象非常关键。在弗洛伊德的理论中，水常象征...
   结合你的职业困惑，这个梦可能是你的潜意识在处理...
   [生成深度解析]
```

#### 3.2.2 心理学派选择
用户可选择不同的解析视角：

| 学派 | 特点 | 适合用户 |
|------|------|---------|
| **荣格分析心理学** | 原型、集体无意识、个体化过程 | 对自我探索有兴趣的用户 |
| **弗洛伊德精神分析** | 潜意识欲望、压抑、象征解读 | 想了解深层欲望的用户 |
| **认知心理学** | 梦境与日间思维的关系、情绪调节 | 偏理性、科学视角的用户 |
| **超个人心理学** | 灵性层面、超越性体验 | 有冥想/灵性实践的用户 |
| **综合模式（默认）** | 融合多学派视角 | 大多数用户 |

#### 3.2.3 符号智能解读
- **不是字典式匹配**，而是结合上下文的智能解读
- 例：「水」在不同语境下含义不同
  - 平静的湖水 → 内心平静 / 潜意识深处
  - 洪水 → 情绪失控 / 被淹没的感觉
  - 清澈的溪流 → 生命力 / 情感流动
- 结合用户个人背景（职业、近期事件、关系状态）给出个性化解读

#### 3.2.4 梦境符号可视化
- 解析结果中自动标注关键符号
- 点击符号可展开详细解读
- 符号之间的关联关系图

### 3.3 个人背景档案（核心差异化）

#### 3.3.1 档案字段
```
个人背景档案
├── 基本信息
│   ├── 年龄段
│   ├── 性别
│   └── 职业领域
├── 心理状态
│   ├── 当前压力水平（1-10）
│   ├── 主要困扰（多选标签）
│   └── 正在经历的生活变化
├── 性格倾向（可选）
│   ├── MBTI 类型
│   └── 大五人格自评
├── 梦境习惯
│   ├── 记梦频率
│   ├── 是否有清醒梦经验
│   └── 对心理学的了解程度
└── 隐私设置
    └── 档案数据仅用于 AI 分析，不对外展示
```

#### 3.3.2 档案的作用
- AI 解梦时自动参考用户背景
- 「你最近压力水平较高，结合这个噩梦，可能是...」
- 长期追踪时，结合背景变化分析梦境变化

### 3.4 长期追踪系统（核心差异化）

#### 3.4.1 潜意识焦虑曲线
- **数据源**：梦境情绪标注 + AI 情感分析
- **展示**：折线图，X 轴为时间，Y 轴为焦虑/压力指数
- **功能**：
  - 7 天 / 30 天 / 90 天视图切换
  - 标记重大生活事件（用户手动标注）
  - 发现焦虑高峰期与梦境内容的关联
  - 点击数据点跳转到对应梦境

#### 3.4.2 梦境主题图谱
- **词云/网络图**：展示用户梦境中反复出现的主题
- **主题演化**：追踪某个主题（如「水」「追逐」）随时间的频率变化
- **关联发现**：「你最近 30 天的梦境中，'迷路' 出现了 8 次，与 '工作压力' 标签强相关」

#### 3.4.3 重复梦境识别
- AI 自动识别相似梦境模式
- 「这与你 3 月 15 日的梦境高度相似：同样是'被追逐'主题，但追逐者的身份从'陌生人'变成了'动物'，这可能意味着...」

#### 3.4.4 月度/周度报告
- 自动生成「梦境月报」
- 包含：梦境数量、情绪分布、高频符号、焦虑趋势、关键洞察
- 可导出为 PDF 或图片

### 3.5 梦境视觉卡片系统

#### 3.5.1 梦境卡片生成
每条梦境解析后，自动生成一张精美的「梦境视觉卡片」：

```
┌──────────────────────────────────────┐
│  ☽  梦境解构师                        │
│                                      │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │    [AI 生成的梦境插画]          │  │
│  │    深夜森林 / 迷雾 / 水面倒影    │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│                                      │
│  「暗夜森林中的迷途者」               │
│                                      │
│  核心符号：森林 · 水 · 迷路           │
│  潜意识主题：方向感缺失 · 内心探索     │
│  情绪基调：焦虑 (●●●○○)              │
│                                      │
│  "你的潜意识正在寻找一条通往            │
│   真实自我的道路。"                    │
│                                      │
│  ── 荣格分析心理学视角                 │
│                                      │
│  2026.05.28  DreamDecoder            │
└──────────────────────────────────────┘
```

#### 3.5.2 卡片风格
- **深色神秘风**：深蓝/紫色背景，星空/月光元素
- **清新水彩风**：浅色背景，水彩晕染效果
- **极简文字风**：纯文字排版，强调内容
- **超现实风**：AI 生成的超现实主义插画

#### 3.5.3 卡片用途
- 社交媒体分享（小红书、朋友圈、微博）
- 个人梦境画廊收藏
- 导出高清图片 / PDF

### 3.6 AI 对话引擎

#### 3.6.1 System Prompt 设计（核心）

```
你是一位专业的梦境分析师，融合荣格分析心理学、弗洛伊德精神分析和
认知心理学的视角。

你的工作方式：
1. 先倾听用户的梦境描述，不急于下结论
2. 提出 2-3 个有针对性的问题，帮助用户回忆更多细节
3. 结合用户的个人背景（如果有）进行分析
4. 识别梦境中的关键符号，给出多层次解读
5. 将梦境与用户的现实生活建立连接
6. 最后给出一个核心洞察，用诗意但不失专业的方式表达

你不是在"算命"，而是在帮助用户理解自己的潜意识。
你的语气温暖、有洞察力、像一位智慧的长者。
```

#### 3.6.2 上下文管理
- 每次对话携带：当前梦境 + 个人档案 + 近期梦境摘要
- AI 能引用用户历史梦境：「这与你上周的那个梦有相似之处...」

---

## 四、技术架构

### 4.1 前端技术栈

```
框架:       React 18 + TypeScript
构建:       Vite 5
路由:       React Router v6
样式:       Tailwind CSS 3 + CSS Variables（主题系统）
状态管理:   Zustand
图表:       Recharts（焦虑曲线、数据可视化）
Markdown:   react-markdown + remark-gfm + rehype-highlight
动画:       Framer Motion（页面过渡、卡片动画）
图标:       Lucide React
日期:       date-fns
HTTP:       Fetch API + 自封装请求层
语音:       Web Speech API / Whisper API
```

### 4.2 后端技术栈

```
框架:       Node.js + Express + TypeScript
数据库:     PostgreSQL（结构化数据）
缓存:       Redis（会话缓存、限流）
ORM:        Prisma
认证:       JWT + 邮箱验证码
AI:         Google Gemini API / OpenAI API
语音转文字:  OpenAI Whisper API
图片生成:    DALL-E 3 / Stable Diffusion API
邮件:       Resend
支付:       Stripe
部署:       Vercel (前端) + Railway (后端)
```

### 4.3 项目结构

```
dream-decoder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dream/              # 梦境相关
│   │   │   │   ├── DreamForm.tsx       # 梦境记录表单
│   │   │   │   ├── DreamCard.tsx       # 梦境卡片组件
│   │   │   │   ├── DreamTimeline.tsx   # 梦境时间线
│   │   │   │   ├── SymbolTag.tsx       # 符号标签
│   │   │   │   └── EmotionPicker.tsx   # 情绪选择器
│   │   │   ├── Chat/               # AI 对话
│   │   │   │   ├── ChatPanel.tsx       # 对话面板
│   │   │   │   ├── MessageBubble.tsx   # 消息气泡
│   │   │   │   ├── SchoolSelector.tsx  # 学派选择器
│   │   │   │   └── StreamText.tsx      # 流式文本渲染
│   │   │   ├── Analytics/          # 数据分析
│   │   │   │   ├── AnxietyCurve.tsx    # 焦虑曲线图
│   │   │   │   ├── ThemeCloud.tsx      # 主题词云
│   │   │   │   ├── PatternMatrix.tsx   # 模式矩阵
│   │   │   │   └── MonthlyReport.tsx   # 月度报告
│   │   │   ├── VisualCard/         # 视觉卡片
│   │   │   │   ├── CardGenerator.tsx   # 卡片生成器
│   │   │   │   ├── CardTemplate.tsx    # 卡片模板
│   │   │   │   └── CardGallery.tsx     # 卡片画廊
│   │   │   ├── Profile/            # 用户档案
│   │   │   │   ├── BackgroundForm.tsx  # 背景档案表单
│   │   │   │   ├── PsychProfile.tsx    # 心理档案
│   │   │   │   └── PrivacySettings.tsx # 隐私设置
│   │   │   ├── Auth/               # 认证
│   │   │   ├── Layout/             # 布局
│   │   │   └── UI/                 # 基础组件
│   │   ├── pages/
│   │   │   ├── Home.tsx                # 首页
│   │   │   ├── Record.tsx              # 记录梦境
│   │   │   ├── Analyze.tsx             # AI 解构（对话）
│   │   │   ├── Timeline.tsx            # 梦境时间线
│   │   │   ├── Insights.tsx            # 数据洞察
│   │   │   ├── Gallery.tsx             # 卡片画廊
│   │   │   ├── Profile.tsx             # 个人档案
│   │   │   ├── Settings.tsx            # 设置
│   │   │   └── Login.tsx               # 登录
│   │   ├── stores/                 # Zustand 状态
│   │   ├── services/               # API 封装
│   │   ├── hooks/                  # 自定义 Hooks
│   │   ├── utils/
│   │   │   ├── dreamSymbols.ts         # 梦境符号库
│   │   │   ├── emotionScale.ts         # 情绪量表
│   │   │   └── cardRenderer.ts         # 卡片渲染工具
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   │   └── symbols/                # 符号图标资源
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts                 # 认证
│   │   │   ├── dreams.ts               # 梦境 CRUD
│   │   │   ├── analysis.ts             # AI 分析
│   │   │   ├── insights.ts             # 数据洞察
│   │   │   ├── cards.ts                # 视觉卡片
│   │   │   ├── profile.ts              # 用户档案
│   │   │   └── stripe.ts               # 支付
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── gemini.ts               # Gemini 客户端
│   │   │   │   ├── prompts.ts              # Prompt 模板库
│   │   │   │   ├── contextBuilder.ts       # 上下文构建器
│   │   │   │   └── emotionAnalyzer.ts      # 情感分析
│   │   │   ├── dream/
│   │   │   │   ├── baziEngine.ts           #（可选）八字/命理关联
│   │   │   │   ├── symbolMatcher.ts        # 符号匹配引擎
│   │   │   │   ├── patternDetector.ts      # 重复模式检测
│   │   │   │   └── reportGenerator.ts      # 报告生成
│   │   │   ├── card/
│   │   │   │   ├── imageGen.ts             # AI 图片生成
│   │   │   │   ├── cardComposer.ts         # 卡片合成
│   │   │   │   └── templates.ts            # 卡片模板
│   │   │   ├── auth.ts
│   │   │   ├── email.ts
│   │   │   └── stripe.ts
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── README.md
```

---

## 五、数据模型设计

### 5.1 User（用户）

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  nickname      String?
  avatar        String?
  credits       Int       @default(10)  // 免费额度
  plan          Plan      @default(FREE)
  createdAt     DateTime  @default(now())

  profile       Profile?
  dreams        Dream[]
  sessions      ChatSession[]
  subscriptions Subscription?
}

enum Plan {
  FREE
  PRO
  PREMIUM
}
```

### 5.2 Profile（个人背景档案）

```prisma
model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  ageRange        String?  // "18-24", "25-34", "35-44", "45+"
  gender          String?
  occupation      String?
  stressLevel     Int?     // 1-10
  concerns        String[] // 主要困扰标签
  lifeChanges     String[] // 正在经历的变化
  mbti            String?  // MBTI 类型
  dreamFrequency  String?  // "daily", "weekly", "rare"
  lucidDreamExp   Boolean? @default(false)
  psychKnowledge  String?  // "none", "basic", "intermediate", "advanced"
  preferredSchool String?  // 偏好的心理学派

  user            User     @relation(fields: [userId], references: [id])
}
```

### 5.3 Dream（梦境记录）

```prisma
model Dream {
  id              String   @id @default(cuid())
  userId          String
  title           String?  // 用户填写或 AI 生成
  content         String   // 梦境描述
  voiceUrl        String?  // 语音记录 URL

  // 结构化数据
  emotions        DreamEmotion[]
  clarity         String?  // "blurry", "normal", "clear", "vivid"
  dreamType       String?  // "nightmare", "recurring", "lucid", "prophetic", "normal"
  scenes          String[] // 场景标签
  characters      String[] // 人物标签
  colorPerception String?  // "bw", "dim", "normal", "vivid", "surreal"
  sleepQuality    Int?     // 1-5

  // AI 分析结果
  aiSummary       String?  // AI 生成的一句话摘要
  aiSymbols       DreamSymbol[]  // 关键符号
  aiThemes        String[] // AI 识别的主题
  anxietyScore    Float?   // AI 评估的焦虑分数 0-100

  recordedAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])
  chatSessions    ChatSession[]
}

model DreamEmotion {
  id        String @id @default(cuid())
  dreamId   String
  emotion   String // "fear", "anxiety", "joy", "sadness", "anger", "confusion", "calm", "excitement"
  intensity Int    // 1-5

  dream     Dream  @relation(fields: [dreamId], references: [id])
}

model DreamSymbol {
  id          String @id @default(cuid())
  dreamId     String
  symbol      String // 符号名称
  meaning     String // AI 解读
  school      String // 心理学派

  dream       Dream  @relation(fields: [dreamId], references: [id])
}
```

### 5.4 ChatSession（对话会话）

```prisma
model ChatSession {
  id          String    @id @default(cuid())
  userId      String
  dreamId     String?   // 关联的梦境
  school      String    // 使用的心理学派
  title       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
  dream       Dream?    @relation(fields: [dreamId], references: [id])
  messages    Message[]
}

model Message {
  id          String   @id @default(cuid())
  sessionId   String
  role        String   // "user" | "assistant" | "system"
  content     String
  createdAt   DateTime @default(now())

  session     ChatSession @relation(fields: [sessionId], references: [id])
}
```

### 5.5 DreamCard（梦境视觉卡片）

```prisma
model DreamCard {
  id          String   @id @default(cuid())
  userId      String
  dreamId     String
  style       String   // "mystic", "watercolor", "minimal", "surreal"
  imageUrl    String   // 生成的图片 URL
  thumbnailUrl String?
  isPublic    Boolean  @default(false)
  likes       Int      @default(0)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  dream       Dream    @relation(fields: [dreamId], references: [id])
}
```

---

## 六、API 接口设计

### 6.1 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/send-code` | 发送邮箱验证码 |
| POST | `/api/auth/verify` | 验证码登录/注册 |
| POST | `/api/auth/login-password` | 密码登录 |
| POST | `/api/auth/set-password` | 设置密码 |
| GET | `/api/auth/me` | 获取当前用户 |

### 6.2 梦境模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/dreams` | 创建梦境记录 |
| GET | `/api/dreams` | 获取梦境列表（支持筛选、分页） |
| GET | `/api/dreams/:id` | 获取梦境详情 |
| PUT | `/api/dreams/:id` | 更新梦境 |
| DELETE | `/api/dreams/:id` | 删除梦境 |
| POST | `/api/dreams/voice` | 上传语音梦境 |

### 6.3 AI 分析模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/analysis/deconstruct` | 开始梦境解构对话 |
| POST | `/api/analysis/chat` | 对话消息（流式响应） |
| POST | `/api/analysis/symbols` | 获取符号解读 |
| GET | `/api/analysis/context/:dreamId` | 获取分析上下文 |

### 6.4 数据洞察模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/insights/anxiety-curve` | 焦虑曲线数据 |
| GET | `/api/insights/theme-cloud` | 主题词云数据 |
| GET | `/api/insights/patterns` | 重复模式分析 |
| GET | `/api/insights/monthly-report` | 月度报告 |
| GET | `/api/insights/compare` | 对比分析 |

### 6.5 视觉卡片模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cards/generate` | 生成梦境卡片 |
| GET | `/api/cards` | 获取卡片画廊 |
| GET | `/api/cards/:id` | 获取卡片详情 |
| PUT | `/api/cards/:id` | 更新卡片样式 |
| DELETE | `/api/cards/:id` | 删除卡片 |
| POST | `/api/cards/:id/share` | 生成分享链接 |

### 6.6 用户档案模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/profile` | 获取个人档案 |
| PUT | `/api/profile` | 更新个人档案 |
| GET | `/api/profile/stats` | 个人数据统计 |

### 6.7 支付模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plans` | 获取订阅计划 |
| POST | `/api/stripe/create-checkout` | 创建支付会话 |
| POST | `/api/stripe/confirm` | 确认支付 |
| POST | `/api/stripe/cancel` | 取消订阅 |

---

## 七、UI/UX 设计规范

### 7.1 设计语言
- **主色调**：深蓝渐变（`#0F172A` → `#1E3A5F`）— 夜空感
- **强调色**：月光金（`#C9B97A`）— 神秘感
- **辅助色**：薄雾紫（`#7C3AED`）、梦境粉（`#EC4899`）
- **背景**：深色主题为主，浅色主题可选
- **字体**：标题用 `Noto Serif SC`（思源宋体），正文用系统字体

### 7.2 页面布局

```
┌─────────────────────────────────────────────────┐
│  ☽ 梦境解构师    [记录] [解构] [洞察] [画廊]  [头像] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │              │  │                          │ │
│  │  侧边栏       │  │    主内容区               │ │
│  │              │  │                          │ │
│  │  · 最近梦境   │  │    （对话 / 表单 / 图表）  │ │
│  │  · 快速筛选   │  │                          │ │
│  │  · 标签云     │  │                          │ │
│  │  · 情绪概览   │  │                          │ │
│  │              │  │                          │ │
│  └──────────────┘  └──────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7.3 关键页面

| 页面 | 功能 | 交互特点 |
|------|------|---------|
| **首页** | 引导记录、今日梦境回顾、焦虑曲线预览 | 大按钮引导，氛围感背景 |
| **记录页** | 梦境输入表单 | 沉浸式全屏，渐进式填写 |
| **解构页** | AI 对话 | 左侧梦境原文，右侧 AI 对话 |
| **洞察页** | 数据可视化 | 图表为主，支持时间范围筛选 |
| **画廊页** | 梦境卡片 | 瀑布流布局，卡片翻转动效 |
| **档案页** | 个人背景 | 分步骤表单，隐私提示 |

### 7.4 动效设计
- **页面切换**：Framer Motion 淡入淡出
- **卡片生成**：从模糊到清晰的「显现」动效
- **焦虑曲线**：绘制动画
- **情绪选择**：呼吸灯效果
- **AI 回复**：逐字打字机效果 + 符号高亮动画

---

## 八、商业模式

### 8.1 定价策略

| 计划 | 价格 | 包含 |
|------|------|------|
| **免费版** | ¥0 | 每月 5 次 AI 解构、基础符号解读、7 天历史 |
| **探索版** | ¥19/月 | 无限 AI 解构、完整心理学派分析、30 天追踪、基础卡片 |
| **深度版** | ¥39/月 | 全部功能 + 月度报告、高级卡片模板、语音输入、数据导出 |
| **终身版** | ¥299 | 深度版终身使用权 |

### 8.2 免费额度设计
- 新用户注册赠送 10 次 AI 解构额度
- 每日登录赠送 1 次额度（鼓励留存）
- 分享卡片到社交平台奖励 3 次额度

---

## 九、开发路线图

### Phase 1：MVP（3-4 周）
- [ ] 项目初始化（React + Vite + Tailwind + Express）
- [ ] 用户认证系统（邮箱验证码登录）
- [ ] 梦境记录表单（文字输入 + 结构化标签）
- [ ] AI 解构对话（Gemini API + 流式响应）
- [ ] 基础 UI 框架（深色主题、布局、导航）

### Phase 2：核心体验（3-4 周）
- [ ] 个人背景档案系统
- [ ] 多学派 Prompt 优化
- [ ] 引导式多轮对话体验
- [ ] 符号智能解读
- [ ] 梦境时间线视图

### Phase 3：数据洞察（2-3 周）
- [ ] 焦虑曲线图表（Recharts）
- [ ] 主题词云
- [ ] 重复梦境识别
- [ ] 月度报告生成

### Phase 4：视觉卡片（2 周）
- [ ] 卡片模板系统
- [ ] AI 配图生成（DALL-E 3）
- [ ] 卡片画廊
- [ ] 社交分享功能

### Phase 5：商业化（1-2 周）
- [ ] Stripe 支付集成
- [ ] 订阅计划管理
- [ ] 额度系统
- [ ] 邀请奖励机制

### Phase 6：优化上线（2 周）
- [ ] 性能优化（懒加载、缓存）
- [ ] SEO 优化（meta tags、结构化数据）
- [ ] PWA 支持（离线记录）
- [ ] 部署上线
- [ ] 数据监控

**总计预估：13-17 周**

---

## 十、关键技术挑战与解决方案

### 10.1 Prompt 工程（最高优先级）
**挑战**：AI 解梦质量直接决定产品价值
**方案**：
- 分层 Prompt 架构：基础角色 → 学派特化 → 用户上下文 → 对话历史
- 持续 A/B 测试不同 Prompt 模板
- 建立「符号-解读」知识库辅助 AI

### 10.2 长期数据关联分析
**挑战**：如何从历史梦境中提取有价值的模式
**方案**：
- 梦境向量化存储（Embedding），支持语义相似度搜索
- 定时任务：每日凌晨分析前一天梦境，更新统计
- 使用简单的时序分析算法（移动平均、异常检测）

### 10.3 视觉卡片生成
**挑战**：生成高质量、风格统一的梦境配图
**方案**：
- 方案 A：DALL-E 3 API 生成配图 + Canvas 合成文字（推荐）
- 方案 B：预设模板 + SVG 动态渲染（成本低）
- 方案 C：Stable Diffusion 自部署（质量可控但成本高）

### 10.4 情感分析精度
**挑战**：准确评估梦境情绪和焦虑水平
**方案**：
- 用户手动标注（主）+ AI 分析（辅）双轨制
- 使用情绪量表（PANAS）标准化评估
- 长期数据训练个性化模型

---

## 十一、隐私与安全

### 11.1 数据隐私
- 梦境内容属于高度敏感的个人数据
- 明确告知用户数据用途（仅用于 AI 分析）
- 支持数据导出和账号删除
- 梦境数据加密存储

### 11.2 AI 安全
- 添加免责声明：「本产品仅供娱乐和自我探索，不构成心理咨询或医疗建议」
- AI 检测到用户表达自伤倾向时，自动提示专业求助渠道
- 限制 AI 不做诊断性表述

---

## 十二、与聊瓜的技术复用

由于两个项目技术栈高度一致，以下模块可直接复用或微调：

| 模块 | 复用度 | 说明 |
|------|--------|------|
| 认证系统 | 95% | 邮箱验证码 + JWT，几乎直接复用 |
| AI 对话引擎 | 80% | 流式响应、会话管理复用，Prompt 需重写 |
| 支付系统 | 90% | Stripe 集成直接复用 |
| 主题系统 | 95% | 深色/浅色主题切换复用 |
| 路由框架 | 90% | React Router 配置复用 |
| UI 组件库 | 70% | Button/Modal/Input 等基础组件复用，业务组件需新开发 |
| 数据可视化 | 0% | 全新开发（Recharts 图表） |
| 视觉卡片 | 0% | 全新开发 |

---

## 十三、总结

梦境解构师的核心竞争力在于：

1. **心理学深度** — 不是算命套话，而是有理论支撑的深度分析
2. **长期追踪** — 从单次解梦升级为潜意识洞察工具
3. **引导式交互** — AI 主动追问，而非被动回答
4. **视觉输出** — 精美的梦境卡片带来社交传播力
5. **个人化** — 基于用户背景和历史的定制分析

这是一个「AI + 心理学 + 数据可视化」的垂直应用，技术门槛适中，差异化明显，有清晰的商业化路径。
