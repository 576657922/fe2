# FE 刷题平台 - 技术选型方案 (Tech Stack)

## 1. 选型核心原则

- **Simplicity (简单)**: 减少运维负担，使用 Serverless 和托管服务，避免手动配置服务器。
- **Robustness (健壮)**: 全链路 TypeScript 类型安全，使用工业级 PostgreSQL 数据库。
- **Speed (速度)**: 快速迭代 MVP，利用现成的 UI 组件库和 Auth 服务。

---

## 2. 核心技术栈概览

| 模块 | 选型 | 核心理由 |
| :--- | :--- | :--- |
| **全栈框架** | **Next.js (App Router)** | 目前 React 生态事实标准，SEO 友好，路由与 API 一体化，部署极简。 |
| **编程语言** | **TypeScript** | 健壮性的基石。从前端到数据库全链路类型提示，大幅减少 Runtime 错误。 |
| **后端服务 (BaaS)** | **Supabase** | 开源 Firebase 替代品。提供 **PostgreSQL**、**Auth**、**API**。省去写 80% 后端 CRUD 代码的时间。 |
| **样式方案** | **Tailwind CSS** | 原子化 CSS，开发速度极快，配合 UI 库可快速构建响应式界面。 |
| **UI 组件库** | **shadcn/ui** | 基于 Radix UI，复制粘贴式组件。既美观又健壮，方便后续定制（特别是做游戏化皮肤）。 |
| **状态管理** | **Zustand** | 比 Redux 简单 10 倍，比 Context API 性能好。非常适合管理**番茄钟状态**、**答题进度**。 |
| **部署托管** | **Vercel** | Next.js 的亲爹，推送到 GitHub 自动部署，免费额度足够 MVP 使用。 |

---

## 3. 详细选型说明

### 3.1 后端与数据库：Supabase

> **为何不选 Node.js/Express 自建后台？**
> 你的核心业务是"刷题"和"记录数据"，而不是写登录注册逻辑。

- **Database**: 它是标准的 **PostgreSQL**。适合处理关系型数据（题目-年份-分类-用户错题关联），比 NoSQL 更健壮。
- **Auth**: 内置支持 GitHub/Google 登录和邮箱登录，直接与数据库用户表打通。
- **Row Level Security (RLS)**: 在数据库层设置安全规则（例如：只有用户自己能看到自己的错题本），安全性极高。
- **Client SDK**: 前端直接调用 `supabase.from('questions').select('*')`，像写 SQL 一样简单。

### 3.2 前端框架：Next.js 14+

- **App Router**: 结构清晰，`page.tsx` 即路由。
- **Server Components**: 可以在服务器端直接获取题目数据，减少客户端加载时间，提升首屏速度。
- **API Routes**: 如果需要特殊的后端逻辑（比如复杂的经验值计算防作弊），可以直接在 Next.js 里写 API，无需额外部署后端。

### 3.3 界面与交互

- **shadcn/ui**: 提供了高质量的 Alert, Dialog, Card, Progress 等组件，看起来非常专业。
- **Framer Motion**: **关键库**。为了实现需求中的"上瘾感"和"游戏化反馈"（如连对动画、经验条增长），这是一个最强的 React 动画库。
- **Lucide React**: 一套精美的图标库，风格统一。

---

## 4. 核心数据结构设计 (Schema Draft)

利用 PostgreSQL 的强关系特性，保证数据不丢、不错。

### 4.1 `profiles` (用户表)

- `id`: uuid (关联 auth.users)
- `username`: text
- `level`: int (当前等级)
- `xp`: int (经验值)
- `streak_days`: int (连续打卡天数)

### 4.2 `questions` (题库表)

- `id`: uuid
- `year`: text (e.g., "2023_Spring")
- `category`: text (e.g., "Security")
- `content`: jsonb (题干，支持富文本)
- `options`: jsonb (数组：A, B, C, D)
- `correct_answer`: text
- `explanation`: text (解析)

### 4.3 `user_progress` (做题记录 - 核心大表)

- `id`: uuid
- `user_id`: uuid (FK)
- `question_id`: uuid (FK)
- `is_correct`: boolean
- `status`: text (enum: 'wrong_book', 'mastered', 'normal') -- 是否在错题本
- `attempt_count`: int -- 做过几次
- `last_attempt_at`: timestamp

---

## 5. 关键功能技术实现策略

### 5.1 番茄钟 (Pomodoro)

- **实现**: 使用 `Zustand` 在前端内存中管理倒计时。
- **持久化**: 番茄钟结束时，调用 Supabase 写入一条 `focus_logs` 记录，并触发增加经验值的函数。
- **Web Worker**: 为了防止浏览器后台挂起导致倒计时不准，建议将计时逻辑放在 Web Worker 中。

### 5.2 错题本逻辑

- 利用 Supabase 的视图 (View) 或者简单的查询：
  ```javascript
  // 获取错题示例代码
  const { data } = await supabase
    .from('user_progress')
    .select('*, questions(*)') // 联表查询
    .eq('user_id', user.id)
    .eq('status', 'wrong_book')
    .order('last_attempt_at', { ascending: true });
  ```

### 5.3 游戏化与经验值

- **经验值系统**: 在 Supabase 的 PostgreSQL 中，为每个用户的操作定义积分规则：
  - 做对一题：+10 XP
  - 完成一个番茄：+25 XP
  - 完成整套考试模拟：+50 XP
- **等级计算**: 前端通过公式计算当前等级（如每 500 XP 升一级），可以使用触发器 (Trigger) 自动更新。

### 5.4 数据可视化

- **图表库**: 使用 **Recharts** 或 **Chart.js** 配合 **shadcn/ui** 的卡片组件。
- **简单案例**:
  - 知识点掌握度：水平柱状图
  - 错题趋势：折线图
  - 周学习热力：简单的日历热力图

---

## 6. 项目结构建议

```
fe2-quiz/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全局布局
│   ├── page.tsx                  # 首页
│   ├── (auth)/                   # 登录相关
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # 主应用区
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── questions/page.tsx    # 刷题主页面
│   │   ├── [year]/[session]/page.tsx  # 特定年份和试次
│   │   ├── wrong-book/page.tsx   # 错题本
│   │   ├── bookmarks/page.tsx    # 书签
│   │   └── stats/page.tsx        # 数据统计
│   └── api/                      # API Routes
│       ├── answers/route.ts      # 提交答案
│       ├── progress/route.ts     # 获取做题进度
│       └── xp/route.ts           # 经验值计算
├── components/
│   ├── QuestionCard.tsx          # 题目卡片
│   ├── Pomodoro.tsx              # 番茄钟组件
│   ├── ProgressBar.tsx           # 进度条
│   ├── GameUpNotification.tsx     # 升级动画
│   └── ...
├── lib/
│   ├── supabase.ts               # Supabase 客户端配置
│   ├── types.ts                  # 全局类型定义
│   └── utils.ts                  # 工具函数
├── store/
│   ├── pomodoroStore.ts          # 番茄钟状态管理 (Zustand)
│   └── quizStore.ts              # 做题状态管理
├── .env.local                    # 环境变量（Supabase URL 等）
└── package.json
```

---

## 7. 开发路线图 (Timeline)

### **Phase 1: MVP 基础（1-2 周）**
- [ ] Supabase 项目初始化 & 数据库 schema 设计
- [ ] Next.js 项目搭建 + 基础页面框架
- [ ] 用户认证（Supabase Auth）
- [ ] 题库导入和基础题目页面

### **Phase 2: 核心功能（2-3 周）**
- [ ] 做题页面 + 答题逻辑
- [ ] 错题本自动收集 & 错题复习模式
- [ ] 简单的番茄钟
- [ ] 做题记录和正确率计算

### **Phase 3: 游戏化和数据可视化（1-2 周）**
- [ ] 经验值系统和等级升级
- [ ] 连续打卡机制
- [ ] 简单的数据看板（正确率、错题数）

### **Phase 4: 打磨和优化（1 周）**
- [ ] 性能优化（图片懒加载、代码分割）
- [ ] 移动端适配测试
- [ ] 动画效果增强（Framer Motion）

---

## 8. 依赖包清单

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.38.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "shadcn-ui": "latest",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.292.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 9. 核心优势总结

✅ **快速迭代**: Supabase 省去 80% 的后端代码，Next.js 一框架搞定全栈
✅ **类型安全**: TypeScript 全链路
✅ **低运维成本**: Vercel + Supabase 都是 Serverless，推送代码自动部署
✅ **高可扩展性**: PostgreSQL 的关系型数据结构清晰，后续扩展到 AP 考试很容易
✅ **专业UI**: shadcn/ui + Framer Motion 让你的应用看起来像商业产品
✅ **安全性**: RLS + TypeScript 类型提示，减少 SQL 注入和数据泄露风险

---

## 10. 备注与建议

- **数据库设计**: 建议在 Supabase 中预先创建所有 table 的索引，特别是 `user_id` 和 `question_id`，防止查询变慢。
- **图片和富文本**: 如果题目包含图片，建议上传到 Supabase Storage 或 AWS S3，在数据库中存储 URL。
- **考虑国际化**: 虽然现在只是日文/中文，但建议从一开始就用 `i18n` 库做国际化支持，为未来扩展做准备。
- **实时性**: 如果未来需要实时排行榜或实时通知，Supabase 的 Realtime 功能可以直接启用。
