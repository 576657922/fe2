# 项目架构与文件说明 (Architecture & File Structure)

## 当前实现进度

### ✅ 已实现的完整基础设施（步骤 1.1-1.10 及 2.1-2.2 完成 - 15/47 步骤）

#### 前端框架和工具链
- ✅ **Next.js 14** - 全栈 React 框架，支持 App Router、API Routes、Server Components
- ✅ **TypeScript 5** - 全链路类型安全，编译时类型检查
- ✅ **Tailwind CSS 3** - 原子化 CSS，快速构建响应式界面
- ✅ **shadcn/ui** - 6 个基础组件库（Button, Card, Input, Label, Progress, AlertDialog）

#### 状态管理和数据处理
- ✅ **Zustand 5** - 轻量级状态管理库，用于番茄钟和做题状态
- ✅ **Supabase Client** - PostgreSQL + Auth + Realtime 的完整解决方案
- ✅ **TypeScript 类型** - 完整的数据类型定义（Profile, Question, UserProgress, QuestionAttempt, Bookmark, FocusSession）

#### 动画和数据可视化
- ✅ **Framer Motion** - 高性能 React 动画库，用于升级提示、过渡动画
- ✅ **Recharts** - 声明式 React 图表库，用于统计数据可视化
- ✅ **Lucide React** - 1000+ 精美图标库

#### 核心配置文件
- ✅ `.env.local` - Supabase 环境变量配置（NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY）
- ✅ `lib/supabase.ts` - Supabase 客户端单例模式初始化
- ✅ `lib/types.ts` - 全局 TypeScript 类型定义
- ✅ `lib/utils.ts` - 样式合并工具（cn）和通用工具函数
- ✅ `components.json` - shadcn/ui 配置文件

#### 数据库基础设施
- ✅ **Supabase PostgreSQL** - 6 个核心业务表
- ✅ **Row Level Security (RLS)** - 所有用户表启用行级安全
- ✅ **数据库索引** - 为查询优化创建了复合索引和单列索引
- ✅ **认证系统** - Email + GitHub OAuth 双重认证配置完成

---

## 项目根目录文件说明

### 文档文件（memory-bank 文件夹内）

#### 1. `design.md`
**用途**：产品需求与功能设计文档
**内容**：
- 产品定位与核心目标
- 用户画像与使用场景
- 功能需求详细说明（题库、做题模式、错题本、番茄钟、游戏化等）
- 用户流程示例
- MVP 功能清单

**使用场景**：
- 参考产品功能需求时查阅
- 与产品经理讨论功能时参考
- 确定 MVP 范围时查看

---

#### 2. `tech-stack.md`
**用途**：技术选型方案与架构设计文档
**内容**：
- 核心技术栈选择（Next.js, TypeScript, Supabase 等）
- 选型理由和详细说明
- 数据库 Schema 设计
- 关键功能的技术实现策略
- 项目目录结构建议
- 开发路线图和依赖包清单

**使用场景**：
- 开发前理解技术架构
- 需要查询某个技术库的用法时参考
- 数据库设计参考
- 回顾技术决策时查阅

---

#### 3. `implementation-plan.md`
**用途**：详细的分步实施计划
**内容**：
- 47 个具体的实施步骤，分为 4 个阶段
- 每步包含：目标、具体指令、验证测试
- 阶段划分：基础设施、题库与做题、错题本、番茄钟
- 整体验收标准
- 下一步计划和常见问题

**使用场景**：
- 开发的主要参考文档
- 逐步执行各个步骤时查阅
- 检查某个功能如何实现时参考
- 验证功能完成情况时使用

---

#### 4. `progress.md`
**用途**：项目进度跟踪文档
**内容**：
- 4 个阶段的 47 个步骤的 checklist
- MVP 验收标准的 checklist
- 完成情况的勾选标记

**使用场景**：
- 跟踪项目整体进度
- 了解已完成的步骤
- 确定下一步要做什么
- 生成项目进度报告

---

#### 5. `architecture.md`（当前文件）
**用途**：项目架构、文件结构和各部分作用说明
**内容**：
- 文档文件说明
- 前端目录结构与文件作用
- 数据库表的设计说明
- 关键数据流
- 开发约定

**使用场景**：
- 理解项目整体结构
- 新开发者快速上手
- 查询某个文件的用途
- 添加新页面或组件时参考

---

## 前端项目结构说明

### 根目录结构（开发后）

```
fe2/
├── app/                          # Next.js App Router 核心
│   ├── layout.tsx                # 全局布局 - 头部、脚部、全局样式
│   ├── page.tsx                  # 首页 / 登陆前页面
│   ├── (auth)/                   # 认证相关路由组
│   │   ├── login/page.tsx        # 邮箱/GitHub 登录页面
│   │   └── register/page.tsx     # 用户注册页面
│   ├── (dashboard)/              # 受保护的路由组（需登录）
│   │   ├── layout.tsx            # 仪表板布局 - 侧边栏、顶部导航
│   │   ├── dashboard/page.tsx    # 仪表板首页 - 用户信息、今日统计
│   │   ├── questions/page.tsx    # 题目浏览页 - 筛选题目、列表展示
│   │   ├── [year]/[questionId]/page.tsx  # 单题做题页 - 核心做题界面
│   │   ├── wrong-book/page.tsx   # 错题本页 - 显示所有错题
│   │   ├── wrong-review/page.tsx # 错题复习页 - 专门复习错题
│   │   ├── bookmarks/page.tsx    # 书签页 - 显示收藏题目
│   │   └── stats/page.tsx        # 统计页 - 图表和数据展示
│   └── api/                      # 后端 API 路由
│       ├── answers/route.ts      # 提交答案接口
│       ├── wrong-questions/route.ts # 获取错题列表接口
│       ├── bookmarks/route.ts    # 书签增删接口
│       ├── mark-mastered/route.ts # 标记掌握接口
│       ├── focus-logs/route.ts   # 保存番茄钟记录接口
│       └── xp/route.ts           # 经验值相关接口
│
├── components/                   # 可复用的 React 组件
│   ├── QuestionCard.tsx          # 题目卡片 - 在列表中显示单个题目
│   ├── Pomodoro.tsx              # 番茄钟计时器 - 倒计时 UI 和控制
│   ├── LevelUpNotification.tsx   # 升级动画通知 - Framer Motion 动画
│   ├── ProgressBar.tsx           # 进度条 - 用于显示做题进度
│   ├── StatCard.tsx              # 统计卡片 - 显示各种统计数据
│   ├── auth/
│   │   ├── LoginForm.tsx         # 登录表单逻辑
│   │   └── RegisterForm.tsx      # 注册表单逻辑
│   └── ui/                       # shadcn/ui 组件（已实现 6 个基础组件）
│       ├── button.tsx            # ✅ 按钮组件 - 多种变体（default, destructive, outline, secondary, ghost, link）
│       ├── card.tsx              # ✅ 卡片组件 - Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
│       ├── input.tsx             # ✅ 输入框组件 - 文本输入元素
│       ├── label.tsx             # ✅ 标签组件 - 表单标签
│       ├── progress.tsx          # ✅ 进度条组件 - 显示做题进度、升级进度
│       ├── alert-dialog.tsx      # ✅ 警告对话框 - 确认对话框、警告提示
│       └── ...待后续添加的组件  # Select, Textarea, Dialog, Tooltip 等
│
├── lib/                          # 工具函数和配置
│   ├── supabase.ts               # ✅ Supabase 客户端 - 单例模式，全局复用
│   │   └── createClient() 调用  # 初始化 Supabase 实例，从 .env.local 读取凭证
│   ├── types.ts                  # ✅ TypeScript 类型定义 - 8 个核心类型
│   │   ├── Profile              # 用户档案
│   │   ├── Question             # 题库题目
│   │   ├── UserProgress         # 做题进度汇总
│   │   ├── QuestionAttempt      # 做题历史记录
│   │   ├── Bookmark             # 书签
│   │   ├── FocusSession         # 番茄钟会话
│   │   ├── ApiResponse<T>       # API 统一响应格式
│   │   └── AuthUser             # 登录用户信息
│   └── utils.ts                  # ✅ 通用工具函数
│       ├── cn()                  # Tailwind CSS 类名合并（clsx + twMerge）
│       ├── calculateLevel()      # 待实现：根据 XP 计算等级
│       ├── getXpForNextLevel()  # 待实现：获取下一级所需 XP
│       ├── formatTime()         # 待实现：格式化时间
│       └── ...其他工具函数
│
├── store/                        # Zustand 状态管理
│   ├── pomodoroStore.ts          # 番茄钟状态 - 倒计时、运行状态、历史记录
│   ├── quizStore.ts              # 做题状态 - 当前题目、答案、进度
│   ├── authStore.ts              # 认证状态 - 用户信息、登录状态
│   └── appStore.ts               # 应用全局状态 - 主题、通知等
│
├── hooks/                        # 自定义 React Hooks（可选）
│   ├── useAuth.ts                # 获取当前用户信息
│   ├── useProgress.ts            # 获取用户进度数据
│   └── usePomodoro.ts            # 控制番茄钟状态
│
├── public/                       # 静态资源
│   ├── images/
│   │   └── logo.png              # 应用 Logo
│   └── locales/                  # 国际化文件
│       ├── zh/common.json        # 中文翻译
│       └── ja/common.json        # 日文翻译
│
├── styles/                       # 全局样式
│   └── globals.css               # 全局 CSS（Tailwind）
│
├── .env.local                    # 环境变量（git 忽略）
├── .gitignore                    # Git 忽略文件列表
├── package.json                  # 项目依赖和脚本
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── next.config.js                # Next.js 配置
└── CLAUDE.md                     # Claude Code 项目指南
```

---

## 数据库表设计说明

### 数据库表总览

| 表名 | 用途 | 行数预估 | RLS | 关键索引 | 关键字段 |
|------|------|---------|-----|---------|---------|
| `auth.users` | 用户身份认证（Supabase 管理） | 少 | 内置 | email | id, email |
| `profiles` | 用户档案、等级、XP、连击 | 少 | ✅ | user_id | id, level, xp |
| `questions` | 题库题目 | 多（几千） | ✗ | year, category | id, content, correct_answer |
| `user_progress` | 做题统计（核心汇总表） | 中-多 | ✅ | (user_id, question_id) | status, consecutive_correct_count |
| `question_attempts` | 做题历史记录 | 很多（每做一题+1） | ✅ | (user_id, question_id, created_at) | user_answer, is_correct |
| `bookmarks` | 用户书签 | 中 | ✅ | user_id | user_id, question_id |
| `focus_sessions` | 番茄钟会话 | 中 | ✅ | (user_id, created_at) | started_at, ended_at, duration |

**说明**：
- **RLS**：行级安全，用户只能访问自己的数据
- **关键索引**：用于优化查询性能的索引
- **双表设计**：`user_progress` + `question_attempts` 的组合设计便于快速统计和历史追踪

---

### Supabase PostgreSQL 数据库

#### 1. `auth.users`（由 Supabase 自动管理）
**用途**：用户身份认证表
**关键字段**：
- `id` (UUID): 用户唯一标识
- `email`: 邮箱地址
- `created_at`, `updated_at`: 时间戳

**说明**：由 Supabase 自动管理，不需要手动操作。与 `profiles` 表通过 `id` 关联。

---

#### 2. `profiles`
**用途**：用户个人信息和游戏化数据
**字段说明**：
- `id` (UUID, PK): 关联 auth.users
- `username` (text): 用户名
- `level` (int): 当前等级（默认 1）
- `xp` (int): 累积经验值（默认 0）
- `streak_days` (int): 连续打卡天数（默认 0）
- `created_at`, `updated_at`: 时间戳

**用途**：存储用户等级、经验值、连击等游戏化信息。

---

#### 3. `questions`
**用途**：题库，存储所有 FE 考试题目
**字段说明**：
- `id` (UUID, PK): 题目唯一标识
- `year` (text): 考试年份（如 "2023_Spring"）
- `session` (text): 考试时段（"AM" 或 "PM"）
- `category` (text): 知识分类（"Security", "Database" 等）
- `question_number` (int): 题号（1-80）
- `content` (text): 题干文本
- `option_a`, `option_b`, `option_c`, `option_d` (text): 四个选项
- `correct_answer` (text): 正确答案（"A", "B", "C", "D"）
- `explanation` (text): 题目解析
- `difficulty` (text): 难度（"easy", "normal", "hard"）
- `created_at`: 创建时间

**索引**：year, category (用于快速查询)

---

#### 4. `user_progress`
**用途**：用户做题记录（核心数据表，汇总统计）
**字段说明**：
- `id` (UUID, PK): 记录唯一标识
- `user_id` (UUID, FK): 关联 auth.users
- `question_id` (UUID, FK): 关联 questions
- `user_answer` (text): 用户最后一次的答案（"A", "B", "C", "D"）
- `is_correct` (boolean): 最后一次是否答对
- `attempt_count` (int): 此题做过的总次数
- `consecutive_correct_count` (int): 连续答对次数（达到 3 次时自动标记为已掌握）
- `status` (text): 题目状态（"normal", "wrong_book", "mastered"）
  - `normal`: 普通状态（最后答对或首次做题）
  - `wrong_book`: 在错题本中（答过但最后答错）
  - `mastered`: 已掌握（连续答对 3 次或手动标记）
- `last_attempt_at` (timestamp): 最后一次做题的时间
- `created_at`: 首次做题时间

**索引**：
- (user_id, question_id) 唯一组合索引
- user_id 索引（快速查询用户的所有题目）
- status 索引（快速筛选错题）

**RLS 策略**：用户只能查看/修改自己的记录

**说明**：
- 这是最重要的汇总统计表，记录了用户对每道题目的最新做题情况
- 与 `question_attempts` 配合使用（双表设计）
- 用于快速统计用户的做题数量、正确率、错题本等
- `consecutive_correct_count` 字段用于追踪连续答对，实现智能掌握判定

---

#### 4.5. `question_attempts`（✅ 新增）
**用途**：用户做题历史追踪表（详细历史记录）
**字段说明**：
- `id` (UUID, PK): 历史记录唯一标识
- `user_id` (UUID, FK): 关联 auth.users
- `question_id` (UUID, FK): 关联 questions
- `user_answer` (text): 本次的答案（"A", "B", "C", "D"）
- `is_correct` (boolean): 本次是否答对
- `pomodoro_session_id` (UUID, FK): 关联 focus_sessions（可选，用于关联番茄钟）
- `created_at` (timestamp): 做题的时间戳

**索引**：
- user_id 索引（快速查询用户历史）
- (user_id, question_id, created_at) 复合索引（快速查询某用户某题的历史）

**RLS 策略**：用户只能查看/插入/删除自己的记录

**说明**：
- 与 `user_progress` 配合使用，构成双表设计
- 每次做题都会插入一条新记录，保留完整的学习轨迹
- 用于数据分析、学习曲线追踪、番茄统计等高级功能
- 不修改历史数据，只插入新记录，确保数据完整性

---

#### 5. `bookmarks`
**用途**：用户收藏的题目
**字段说明**：
- `id` (UUID, PK): 书签唯一标识
- `user_id` (UUID, FK): 关联 auth.users
- `question_id` (UUID, FK): 关联 questions
- `created_at` (timestamp): 添加书签的时间

**约束**：(user_id, question_id) 唯一约束（防止重复）

**RLS 策略**：用户只能查看/修改自己的书签

---

#### 5.5. `focus_sessions`（✅ 新增）
**用途**：番茄钟会话记录（精确的学习时间追踪）
**字段说明**：
- `id` (UUID, PK): 会话唯一标识
- `user_id` (UUID, FK): 关联 auth.users
- `started_at` (timestamp): 会话开始时间
- `ended_at` (timestamp, nullable): 会话结束时间（未完成时为 null）
- `duration` (int): 预计时长（秒，通常 1500 = 25 分钟）
- `goal_description` (text, nullable): 学习目标描述（如"刷题 20 题"）
- `created_at` (timestamp): 会话创建时间

**索引**：
- user_id 索引（快速查询用户的番茄历史）
- (user_id, created_at) 复合索引（快速查询用户某时间段的会话）

**RLS 策略**：用户只能查看/修改自己的会话

**与其他表的关系**：
- `question_attempts.pomodoro_session_id` FK 关联此表
- 番茄结束时，可通过 `question_attempts` 统计本次完成的题数和正确数

**说明**：
- 精确追踪用户的番茄钟使用情况
- 保留了完整的开始/结束时间，便于分析学习习惯
- 与 `question_attempts` 联动，可分析"这个番茄钟中做了哪些题"

---

#### 6. `focus_logs`（可选，用于简化统计）
**用途**：番茄钟统计记录（高层聚合数据）
**字段说明**：
- `id` (UUID, PK): 记录唯一标识
- `user_id` (UUID, FK): 关联 auth.users
- `duration` (int): 本次番茄的时长（秒）
- `questions_completed` (int): 本次完成的题目数
- `correct_count` (int): 本次正确的题目数
- `created_at` (timestamp): 完成时间

**说明**：
- 这是从 `focus_sessions` + `question_attempts` 汇总而来的统计表
- MVP 版本可以不创建此表，改用联表查询即可
- 如果统计计算变慢，可后续添加此表进行优化

---

## 关键数据流

### 用户做题流程
```
1. 用户登录 → Supabase Auth 验证
2. 进入题目浏览页 → 从 questions 表查询题目
3. 选择题目进入做题页
4. 用户选择答案 → 提交到 /api/answers
5. API 对比正确答案 → 写入 user_progress 表
   - 如果错误，status = 'wrong_book'
   - 如果正确，status = 'normal'，增加 XP
6. 更新 profiles 表中的 xp 和 level
7. 前端显示结果和下一步选项
```

### 错题复习流程
```
1. 用户访问错题本 → /api/wrong-questions
2. API 查询 user_progress WHERE status='wrong_book'
3. 前端显示错题列表
4. 用户点击"再做一遍" → 进入做题页
5. 完成答题 → 写入 user_progress（attempt_count+1）
6. 连续答对 3 次 → 显示"标记已掌握"选项
7. 用户点击 → 调用 /api/mark-mastered
8. 更新 status='mastered'，从错题本移出
```

### 番茄钟流程
```
1. 用户点击"开始番茄" → Zustand store 状态变为 running
2. 每秒调用 decrementTime() → timeLeft 减 1
3. 页面刷新 → 从 localStorage 恢复 timeLeft
4. timeLeft = 0 → 停止计时，显示完成动画
5. 点击"完成" → 调用 /api/focus-logs
6. API 保存 focus_logs 记录，更新 profiles 的 xp
7. 检查是否升级 → 显示升级动画
```

---

## 前端开发约定

### 页面组件命名
- **page.tsx**: Next.js 路由文件，表示该路由的主页面
- **layout.tsx**: 布局文件，为该路由及其子路由提供统一的布局
- 动态路由使用 `[param]` 命名（如 `[questionId]`）
- 分组路由使用 `(groupName)` 命名（如 `(dashboard)`）

### 组件命名
- **页面组件**（在 app/ 中的）: `PascalCase` 且与文件名同名
- **通用组件**（在 components/ 中）: `PascalCase`
- **Hooks**: `use` 开头的驼峰命名
- **工具函数**: 驼峰命名

### 状态管理
- **全局状态**（用户认证、应用主题）: Zustand store
- **页面局部状态**（表单输入、模态框开关）: React useState/useReducer
- **服务器数据**（题目、用户进度）: Server Components + SWR/React Query（如需缓存）

### 数据获取
- **服务器侧**（初始加载）: Next.js Server Components
- **客户端侧**（交互数据）: Supabase Client SDK
- **API Routes**: 仅用于需要复杂逻辑或数据转换的操作

### 样式
- **全局样式**: Tailwind CSS 工具类
- **组件样式**: 使用 `className` 属性
- **动画**: Framer Motion
- **不要**创建 CSS Module（使用 Tailwind 已足够）

### 类型安全
- 所有 API 响应都应有对应的 TypeScript 类型
- 使用 `lib/types.ts` 集中管理所有类型
- 避免 `any` 类型，使用 `unknown` 或 `as const` 替代

---

## 阶段性开发目标

### 完成后你将拥有
1. **完整的用户认证系统**：邮箱 + GitHub OAuth 登录
2. **核心的做题引擎**：浏览、筛选、做题、即时反馈
3. **智能的错题本**：自动收集、可复习、可标记掌握
4. **有趣的番茄钟**：倒计时、记录、与 XP 系统联动
5. **基础的游戏化**：等级、经验值、升级动画
6. **清晰的数据可视化**：统计页面显示学习进度
7. **移动优先的设计**：在手机和桌面都能良好使用

---

## 常见问题

**Q: 为什么用 Zustand 而不是 Context API？**
A: Zustand 更轻量，避免不必要的重渲染，特别适合番茄钟这样频繁更新的状态。

**Q: Supabase RLS 如何保护用户隐私？**
A: RLS 在数据库层设置规则，确保用户只能查询/修改自己的数据，比应用层检查更安全。

**Q: 为什么分了 (auth) 和 (dashboard) 路由组？**
A: 分组方便管理：auth 是公开页面，dashboard 是受保护页面。可为两个分组应用不同的 layout。

**Q: 如何扩展到 AP 考试？**
A: 在 questions 表添加 `exam_type` 字段区分 FE/AP，所有查询添加 `exam_type` 过滤条件即可。

---

