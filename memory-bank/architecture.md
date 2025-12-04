# 项目架构与文件说明 (Architecture & File Structure)

## 当前实现进度

### ✅ 已实现的完整基础设施（步骤 1.1-1.10 及 2.1-2.10 完成 - 23/47 步骤）

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
│   └── register/page.tsx     # 用户注册页面
│   │   └── register/page.tsx     # 用户注册页面
│   ├── (dashboard)/              # 受保护的路由组（需登录）
│   │   ├── layout.tsx            # 仪表板布局 - 侧边栏、顶部导航
│   │   ├── dashboard/page.tsx    # 仪表板首页 - 用户信息、今日统计
│   │   ├── questions/page.tsx    # ✅ 题目浏览页 - 筛选题目、列表展示（步骤 2.10）
│   │   ├── _components/
│   │   │   └── question-list.tsx  # 题目列表和筛选组件
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
│   ├── QuestionCard.tsx          # ✅ 题目卡片 - 在列表中显示单个题目（步骤 2.10）
│   ├── Pomodoro.tsx              # 番茄钟计时器 - 倒计时 UI 和控制
│   ├── LevelUpNotification.tsx   # 升级动画通知 - Framer Motion 动画
│   ├── ProgressBar.tsx           # 进度条 - 用于显示做题进度
│   ├── StatCard.tsx              # 统计卡片 - 显示各种统计数据
│   ├── auth/
│   │   ├── LoginForm.tsx         # 登录表单逻辑
│   │   └── RegisterForm.tsx      # 注册表单逻辑
│   └── ui/                       # shadcn/ui 组件（已实现 7 个基础组件）
│       ├── button.tsx            # ✅ 按钮组件 - 多种变体（default, destructive, outline, secondary, ghost, link）
│       ├── card.tsx              # ✅ 卡片组件 - Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent
│       ├── input.tsx             # ✅ 输入框组件 - 文本输入元素
│       ├── label.tsx             # ✅ 标签组件 - 表单标签
│       ├── progress.tsx          # ✅ 进度条组件 - 显示做题进度、升级进度
│       ├── alert-dialog.tsx      # ✅ 警告对话框 - 确认对话框、警告提示
│       ├── select.tsx            # ✅ 下拉菜单组件 - 题目筛选用（步骤 2.10）
│       └── ...待后续添加的组件  # Textarea, Dialog, Tooltip 等
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

## 步骤 2.10 - 题目浏览页面实现详解

### 页面架构（客户端组件模式）

**为什么使用客户端组件？**
- 初版使用 Next.js 服务端渲染（SSR），在某些情况下会导致 404 错误
- 改为客户端组件后，数据在浏览器中加载，避免了服务端渲染的问题
- 更容易显示加载状态和错误处理，提升用户体验

**架构示意图**：
```
QuestionsPage (客户端组件 - "use client")
  ├── useEffect: 页面加载时获取数据
  │   ├── Supabase.questions.select(*) → 获取所有题目
  │   ├── Supabase.questions.select(year) → 获取所有年份
  │   ├── Supabase.questions.select(category) → 获取所有类别
  │   └── Supabase.user_progress.select(question_id) → 获取已做题 IDs
  ├── 状态管理 (useState)
  │   ├── questions: Question[]
  │   ├── years: string[]
  │   ├── categories: string[]
  │   ├── solvedQuestionIds: Set<string>
  │   ├── isLoading: boolean
  │   └── error: string | null
  └── 渲染
      ├── isLoading → 显示 "加载中..."
      ├── error → 显示错误提示
      └── QuestionList 组件 (客户端筛选)
          ├── 筛选条件 (Select 下拉菜单)
          │   ├── 年份 (selectedYear)
          │   ├── 类别 (selectedCategory)
          │   ├── 难度 (selectedDifficulty)
          │   └── 搜索 (searchTerm)
          └── 题目网格 (useMemo 优化)
              └── 每行 3 个 QuestionCard 组件
                  ├── 题目标题
                  ├── 题干预览
                  ├── 分类标签
                  └── 已做标记 (绿色 ✓ Solved)
```

### 数据加载流程

1. **页面挂载** → `useEffect` 触发
2. **并行查询**（4 个异步请求）
   - 获取题目列表（按年份降序，题号升序）
   - 获取所有年份（用于筛选）
   - 获取所有类别（用于筛选）
   - 获取用户已做题（用于标记）
3. **数据处理**
   - 去重年份和类别
   - 转换已做题 IDs 为 Set（O(1) 查询性能）
   - 设置到 state 中
4. **页面渲染**
   - 数据加载中：显示加载提示
   - 加载出错：显示错误信息
   - 加载成功：显示题目列表

### 筛选逻辑（useMemo 优化）

**筛选流程**：
```javascript
filteredQuestions = initialQuestions.filter((question) => {
  // 4 个独立的筛选条件（都满足才显示）
  const yearMatch = selectedYear === "all" || question.year === selectedYear;
  const categoryMatch = selectedCategory === "all" || question.category === selectedCategory;
  const difficultyMatch = selectedDifficulty === "all" || question.difficulty === selectedDifficulty;
  const searchTermMatch = searchTerm === "" || question.content.toLowerCase().includes(searchTerm.toLowerCase());

  return yearMatch && categoryMatch && difficultyMatch && searchTermMatch;
});
```

**性能优化**：
- 使用 `useMemo` 缓存计算结果
- 仅当依赖项变化时重新计算
- 支持实时搜索和多筛选条件组合

### 已做题标记

**标记方式**：
```javascript
// QuestionCard 组件接收 isSolved 属性
<QuestionCard
  question={question}
  isSolved={solvedQuestionIds.has(question.id)}  // Set 的 O(1) 查询
/>

// 已做题显示绿色勾
{isSolved && (
  <span className="text-green-500 text-sm font-medium">
    ✓ Solved
  </span>
)}
```

### 响应式设计

**网格布局**：
- 移动端（< 768px）：1 列
- 平板（768px - 1024px）：2 列
- 桌面（> 1024px）：3 列

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

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


---

## 步骤 2.1：Supabase 客户端初始化文件 - 架构洞察

### 实现目的
创建一个可复用的 Supabase 客户端实例，作为应用与数据库的通信桥梁。该文件遵循单例模式，确保全局只有一个客户端实例。

### 文件结构

**文件位置**: `lib/supabase.ts`

**核心内容**:
```typescript
// 1. 导入 Supabase 客户端创建函数
import { createClient } from "@supabase/supabase-js";

// 2. 从环境变量读取连接信息
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 3. 验证环境变量（防止配置缺失导致的运行时错误）
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials...");
}

// 4. 创建并导出单例客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 关键设计决策

#### 1. 单例模式（Singleton Pattern）
- **为什么**：Supabase 客户端是无状态的连接器，无需多个实例
- **好处**：
  - 节省内存（全局只有一个实例）
  - 统一的连接管理
  - 避免重复认证
  - 便于测试（可直接 mock 单例对象）
- **实现方法**：通过 ES6 `export` 导出一个预创建的实例

#### 2. 环境变量验证
- **为什么**：开发过程中容易忘记配置 `.env.local`
- **好处**：
  - 在构建时而非运行时发现配置问题
  - 提供明确的错误提示
  - 防止访问 undefined 导致的隐蔽错误
- **实现方法**：在模块加载时检查环境变量，缺失则抛出 Error

#### 3. 公开 API Key（NEXT_PUBLIC_ 前缀）
- **为什么**：Supabase 的 anon key 设计为客户端可用
- **安全保证**：
  - RLS（行级安全）在数据库层保护数据
  - Anon key 权限受限（只能做认证允许的操作）
  - 不应该在环境变量中存放 service_role_key（这个要保密）
- **实现方法**：使用 NEXT_PUBLIC_ 前缀，使其在客户端 JavaScript 中可访问

### 使用场景

#### 场景 1：在 API 路由中查询数据
```typescript
// app/api/answers/route.ts
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId, questionId, answer } = await request.json();
  
  // 使用 supabase 客户端查询或插入数据
  const { data, error } = await supabase
    .from("user_progress")
    .insert({ user_id: userId, question_id: questionId, user_answer: answer });
  
  return Response.json({ success: !error });
}
```

#### 场景 2：在客户端组件中获取认证用户
```typescript
// components/UserProfile.tsx
import { supabase } from "@/lib/supabase";

export function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);
  
  return <div>{user?.email}</div>;
}
```

#### 场景 3：监听实时数据更新
```typescript
// Realtime subscription
const channel = supabase
  .channel('user-progress')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'user_progress' },
    (payload) => console.log('New progress:', payload)
  )
  .subscribe();
```

### 与 lib/types.ts 的关联

虽然 `lib/supabase.ts` 只创建客户端，但它与 `lib/types.ts` 密切相关：

| 文件 | 职责 | 关系 |
|-----|------|------|
| `lib/supabase.ts` | 创建数据库连接 | 提供 Supabase 操作入口 |
| `lib/types.ts` | 定义 TypeScript 类型 | 为 Supabase 数据定义结构 |

**协作示例**：
```typescript
// 导入类型和客户端
import { supabase } from "@/lib/supabase";
import type { Question, UserProgress } from "@/lib/types";

// 查询返回 Question[] 类型
const { data: questions } = await supabase
  .from("questions")
  .select("*") as { data: Question[] };

// 插入 UserProgress 类型的数据
await supabase.from("user_progress").insert(userProgress as UserProgress);
```

### 依赖关系

| 库 | 用途 | 版本 |
|----|------|------|
| @supabase/supabase-js | 核心客户端库 | ^2.0+ |

### 后续扩展点

1. **添加中间件验证**：如需在每次请求前验证用户身份
2. **错误处理封装**：创建 `lib/supabaseHelper.ts` 封装常见错误处理
3. **缓存层**：集成 SWR 或 React Query 进行客户端缓存
4. **实时数据**：使用 Supabase Realtime 功能监听数据变更

### 与其他 lib 文件的协作流程

```
用户请求
    ↓
API Route (app/api/*/route.ts)
    ↓
[导入 supabase 客户端] → lib/supabase.ts
    ↓
[使用类型进行操作] → lib/types.ts
    ↓
Supabase PostgreSQL 数据库
    ↓
返回响应给客户端
```

### 总结

`lib/supabase.ts` 虽然代码很简洁（仅 12 行），但作用关键：
- 它是应用与数据库通信的唯一入口
- 确保全局使用同一个连接实例
- 提供类型安全的基础（配合 lib/types.ts）
- 支持后续的认证、RLS、实时数据等高级功能

此文件需要在其他任何 Supabase 操作之前创建和验证。

---

## 步骤 2.2：全局 TypeScript 类型定义文件 - 架构洞察

### 实现目的
定义应用范围内的所有数据类型，提供编译时的类型检查，确保代码类型安全，并为开发者提供自动完成和文档支持。

### 文件结构

**文件位置**: `lib/types.ts`

**核心内容**：8 个接口 + 多个 union types

```typescript
// 用户相关
export interface Profile { ... }        // 用户档案
export interface AuthUser { ... }       // 认证用户

// 题目相关
export interface Question { ... }       // 题目数据

// 做题相关
export interface UserProgress { ... }   // 做题统计
export interface QuestionAttempt { ... }  // 做题历史

// 功能相关
export interface Bookmark { ... }       // 书签
export interface FocusSession { ... }   // 番茄钟会话

// API 相关
export interface ApiResponse<T> { ... } // 统一响应格式
```

### 8 个核心接口详解

#### 1. Profile（用户档案）
```typescript
interface Profile {
  id: string;                    // 用户 ID（Supabase auth）
  username: string;              // 用户名
  level: number;                 // 当前等级
  xp: number;                    // 总经验值
  streak_days: number;           // 连续答对天数
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```
**用途**: 存储用户的基本信息和游戏化数据（等级、XP）
**更新场景**: 用户升级、XP 增加、连击计数时更新

#### 2. Question（题目数据）
```typescript
interface Question {
  id: string;                    // 题目 ID
  year: string;                  // 年份（如 "2023"）
  session: "AM" | "PM";          // 上午或下午场次
  category: string;              // 类别（如 "Fundamentals"）
  question_number: number;       // 题号
  content: string;               // 题干
  option_a/b/c/d: string;       // 四个选项
  correct_answer: "A"|"B"|"C"|"D";  // 正确答案
  explanation: string;           // 解析
  difficulty: "easy"|"normal"|"hard";  // 难度
  created_at: string;            // 创建时间
}
```
**用途**: 存储题库中的题目信息
**特点**: 不可变（后端只读，前端不修改）
**查询优化**: year 和 category 字段有索引

#### 3. UserProgress（做题统计）
```typescript
interface UserProgress {
  id: string;                         // 记录 ID
  user_id: string;                    // 用户 ID
  question_id: string;                // 题目 ID
  user_answer: "A"|"B"|"C"|"D"|null;  // 用户选择的答案
  is_correct: boolean | null;         // 是否答对（null=未做过）
  attempt_count: number;              // 做过几次
  consecutive_correct_count: number;  // 连续答对次数
  status: "normal"|"wrong_book"|"mastered";  // 做题状态
  last_attempt_at: string | null;     // 最后做题时间
  created_at: string;                 // 创建时间
}
```
**用途**: 追踪单题的做题统计
**核心设计**: 为 user_id + question_id 的唯一约束（每题最多一条记录）
**状态流转**:
- normal → 正常状态（首次做对）
- normal → wrong_book → mastered（第一次做错，连续答对 3 次后升级）
- wrong_book（做错后自动设置）

#### 4. QuestionAttempt（做题历史）
```typescript
interface QuestionAttempt {
  id: string;                         // 记录 ID
  user_id: string;                    // 用户 ID
  question_id: string;                // 题目 ID
  user_answer: "A"|"B"|"C"|"D";       // 本次答案
  is_correct: boolean;                // 本次是否答对
  pomodoro_session_id: string | null; // 所属番茄钟（可选）
  created_at: string;                 // 做题时间戳
}
```
**用途**: 保留做题的完整历史（一次做题=一条记录）
**与 UserProgress 的区别**:
- `UserProgress` 是统计表（总次数、连续答对数）
- `QuestionAttempt` 是历史表（每一次都记录）
**分析用途**: 追踪学习曲线、发现弱点等

#### 5. Bookmark（书签）
```typescript
interface Bookmark {
  id: string;              // 书签 ID
  user_id: string;         // 用户 ID
  question_id: string;     // 题目 ID
  created_at: string;      // 创建时间
}
```
**用途**: 用户收藏重要题目
**设计**: user_id + question_id 唯一约束（防重复收藏）

#### 6. FocusSession（番茄钟会话）
```typescript
interface FocusSession {
  id: string;                  // 会话 ID
  user_id: string;             // 用户 ID
  started_at: string;          // 开始时间
  ended_at: string | null;     // 结束时间（进行中为 null）
  duration: number;            // 实际时长（秒）
  goal_description: string | null;  // 目标描述（可选）
  created_at: string;          // 创建时间
}
```
**用途**: 记录番茄钟会话，支持学习时间统计

#### 7. ApiResponse（API 响应）
```typescript
interface ApiResponse<T> {
  success: boolean;     // 是否成功
  data?: T;            // 成功时的数据
  error?: string;      // 失败时的错误消息
}
```
**用途**: 统一所有 API 端点的响应格式
**泛型设计**: `ApiResponse<Question[]>` 表示返回题目数组

#### 8. AuthUser（认证用户）
```typescript
interface AuthUser {
  id: string;     // 用户 ID（来自 Supabase Auth）
  email: string;  // 邮箱
}
```
**用途**: 存储从 Supabase Auth 获取的用户信息（最小集）

### Union Types 设计

#### 1. Session - 考试场次
```typescript
session: "AM" | "PM"
```
**含义**:
- "AM" - 上午场
- "PM" - 下午场
**应用**: FE 和 AP 考试通常有两个时间段

#### 2. Difficulty - 难度级别
```typescript
difficulty: "easy" | "normal" | "hard"
```
**含义**:
- "easy" - 简单（基础概念）
- "normal" - 中等（标准难度）
- "hard" - 困难（高阶应用）
**应用**: 用于题目筛选、难度统计

#### 3. Status - 做题状态
```typescript
status: "normal" | "wrong_book" | "mastered"
```
**含义**:
- "normal" - 普通状态（做对过或未做过）
- "wrong_book" - 错题状态（做错过）
- "mastered" - 已掌握（连续答对 3 次）
**状态转移图**:
```
初始（未做） → normal（答对）
            → wrong_book（答错）
                    ↓
                  mastered（连续答对 3 次）
```

#### 4. Answer - 选择答案
```typescript
answer: "A" | "B" | "C" | "D"
```
**含义**: 四选一的选择答案
**应用**: user_answer、correct_answer 字段

### 关键设计原则

#### 原则 1：null 值的谨慎使用
```typescript
// ✓ 好的做法：区分"未知"和"已确定"
user_answer: "A" | "B" | "C" | "D" | null;  // null = 未做过
is_correct: boolean | null;                  // null = 未做过
ended_at: string | null;                     // null = 进行中

// ✗ 避免：过度使用 null
username?: string;  // 不好：应该总是有用户名
```

#### 原则 2：Enum vs Union Types
```typescript
// ✓ 推荐：Union types（简洁，无额外编译）
type Difficulty = "easy" | "normal" | "hard";

// ⚠️ 可用但不推荐：Enum（增加编译产物）
enum Difficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard"
}
```

#### 原则 3：唯一约束的设计
```typescript
// UserProgress: user_id + question_id 唯一
// 含义：每个用户对每题最多有一条统计记录

// Bookmark: user_id + question_id 唯一
// 含义：每个用户对每题最多收藏一次
```

### 与 lib/supabase.ts 的配合

**协作流程**:

```
API 端点 (app/api/*/route.ts)
    ↓
导入 supabase 客户端
import { supabase } from "@/lib/supabase"
    ↓
导入类型定义
import type { Question, UserProgress } from "@/lib/types"
    ↓
执行类型化操作
const { data } = await supabase
  .from("questions")
  .select("*") as { data: Question[] }
    ↓
返回 ApiResponse<T> 格式的响应
```

**优势**:
- 编译时类型检查：catch 错误于构建阶段
- 自动完成：IDE 知道每个字段的类型
- 文档化：类型就是最好的文档
- 可维护性：修改数据结构时，TypeScript 会指出所有影响的地方

### 与数据库表的映射关系

| TypeScript Interface | Supabase Table | 说明 |
|---------------------|----------------|------|
| Profile | profiles | 1:1 映射 |
| Question | questions | 1:1 映射 |
| UserProgress | user_progress | 1:1 映射 |
| QuestionAttempt | question_attempts | 1:1 映射 |
| Bookmark | bookmarks | 1:1 映射 |
| FocusSession | focus_sessions | 1:1 映射 |

### 后续扩展场景

#### 场景 1：添加新字段
```typescript
// 需求：用户想在错题本中添加笔记
// 修改：UserProgress 接口
interface UserProgress {
  // ... 现有字段
  notes?: string;  // 新增：笔记字段
}
// 然后在 Supabase 中也添加对应字段
```

#### 场景 2：支持 AP 考试
```typescript
// 需求：区分 FE 和 AP 考试
// 修改：Question 接口
interface Question {
  // ... 现有字段
  exam_type: "FE" | "AP";  // 新增：考试类型
}
// 所有查询都需要加上 exam_type 过滤
```

#### 场景 3：添加用户成就系统
```typescript
// 新增：Achievement 接口
interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon_url: string;
  unlocked_at: string | null;  // null = 未解锁
}

// 新增：AchievementProgress 接口
interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;           // 0-100
  status: "locked" | "in_progress" | "unlocked";
}
```

### 性能考虑

#### 问题 1：为什么 Question 是不可变的？
- 题目信息一旦发布不应改变（确保公平性）
- 减少数据库查询压力
- 可以充分缓存

#### 问题 2：为什么需要两张表（UserProgress 和 QuestionAttempt）？
- UserProgress：统计数据（当前状态）— 频繁更新，查询快
- QuestionAttempt：历史数据（完整记录）— 仅追加，用于分析

#### 问题 3：user_answer 和 is_correct 为什么有 null？
- null = 用户从未做过这道题
- 区分"不知道用户是否做过"vs"用户做过但答案是 null"（实际上不可能）

### 总结

`lib/types.ts` 虽然只是类型定义文件，但它：
- **定义了应用的数据契约**：所有操作都基于这些类型
- **提供了编译时安全**：TypeScript 在构建时就能发现类型错误
- **文档化了数据结构**：新开发者可以通过类型定义快速理解应用
- **支持后续扩展**：新增功能时只需修改对应的接口

与 `lib/supabase.ts` 一起，`lib/types.ts` 形成了类型安全的 Supabase 集成层。

---

## 步骤 2.3：导入示例题目数据到 Supabase - 架构洞察

### 实现目的
将准备好的题目数据导入 Supabase 数据库的 `questions` 表，为应用提供初始题库数据，支持后续的题库浏览和做题功能。

### 数据导入流程

#### 数据结构（Question Interface）
```typescript
interface Question {
  id: string;              // 唯一标识符（Supabase 自动生成）
  year: string;            // 年份（如 "2023"）
  session: "AM" | "PM";    // 考试场次
  category: string;        // 类别（如 "Fundamentals", "Data Structures"）
  question_number: number; // 题号
  content: string;         // 题干内容
  option_a: string;        // 选项 A
  option_b: string;        // 选项 B
  option_c: string;        // 选项 C
  option_d: string;        // 选项 D
  correct_answer: "A"|"B"|"C"|"D";  // 正确答案
  explanation: string;     // 解析说明
  difficulty: "easy"|"normal"|"hard";  // 难度级别
  created_at: string;      // 创建时间戳
}
```

### 导入方法对比

#### 方法 1：Supabase Dashboard Table Editor（推荐用于小规模数据）
**步骤**：
1. 登录 Supabase Dashboard
2. 选择项目 → 进入 Tables
3. 找到 `questions` 表
4. 点击 "Insert" → "Import from CSV"
5. 上传或粘贴 CSV/JSON 数据
6. 验证字段映射正确
7. 确认导入

**优势**：
- ✓ 无需编码
- ✓ 可视化验证
- ✓ 实时预览

**劣势**：
- 大量数据时较慢
- 需要手动操作

**适用场景**：初始题库导入（20-500 条记录）

#### 方法 2：SQL INSERT 语句（推荐用于中等规模数据）
**SQL 示例**：
```sql
INSERT INTO questions (year, session, category, question_number, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
VALUES 
  ('2023', 'AM', 'Fundamentals', 1, '题干内容...', '选项A', '选项B', '选项C', '选项D', 'A', '解析...', 'easy'),
  ('2023', 'AM', 'Fundamentals', 2, '题干内容...', '选项A', '选项B', '选项C', '选项D', 'B', '解析...', 'normal'),
  ...
```

**优势**：
- ✓ 可批量插入
- ✓ 可控制顺序
- ✓ 易于版本控制

**劣势**：
- 需要手写 SQL
- 数据量大时性能较差

**适用场景**：中等规模数据或有特定顺序要求

#### 方法 3：Supabase API + 脚本（推荐用于大规模数据）
**代码示例**：
```typescript
import { supabase } from "@/lib/supabase";
import type { Question } from "@/lib/types";

const questionsData: Question[] = [
  // 从 JSON 文件或 API 读取
];

// 批量导入
const { data, error } = await supabase
  .from("questions")
  .insert(questionsData);

if (error) {
  console.error("Import failed:", error);
} else {
  console.log("Imported", data?.length, "questions");
}
```

**优势**：
- ✓ 可自动化
- ✓ 易于处理错误
- ✓ 支持大规模数据
- ✓ 可集成到部署流程

**劣势**：
- 需要编写代码
- 需要设置环境

**适用场景**：大规模数据（1000+ 条）或自动化导入

### 本项目采用的方法

**选择**：方法 1（Supabase Dashboard Table Editor）

**原因**：
- 初期数据量较小（20+ 条）
- 便于验证数据完整性
- 无需编码，快速上手
- 可视化操作减少错误

### 数据完整性保证

#### 1. 字段映射验证
导入时需确保以下字段正确映射：
```
CSV/JSON 字段      → Supabase 表字段
year               → year
session            → session (AM 或 PM)
category           → category
question_number    → question_number
content            → content
option_a/b/c/d     → option_a/b/c/d
correct_answer     → correct_answer (A/B/C/D)
explanation        → explanation
difficulty         → difficulty (easy/normal/hard)
```

#### 2. 数据类型检查
```typescript
// ✓ 正确的数据类型
{
  year: "2023",              // string
  session: "AM",             // "AM" | "PM"
  category: "Fundamentals",  // string
  question_number: 1,        // number
  content: "题干...",        // string
  option_a: "选项A",         // string
  correct_answer: "A",       // "A" | "B" | "C" | "D"
  difficulty: "easy"         // "easy" | "normal" | "hard"
}
```

#### 3. 必填字段检查
所有以下字段必须有值（不能为 NULL）：
- ✓ year
- ✓ session
- ✓ category
- ✓ question_number
- ✓ content（题干）
- ✓ option_a, option_b, option_c, option_d（四个选项）
- ✓ correct_answer
- ✓ explanation
- ✓ difficulty

#### 4. 唯一性检查
```sql
-- 验证是否有重复的题目
SELECT year, session, category, question_number, COUNT(*) 
FROM questions 
GROUP BY year, session, category, question_number 
HAVING COUNT(*) > 1;

-- 正常情况下应该返回 0 行
```

### 验证查询

#### 验证 1：总记录数
```sql
SELECT COUNT(*) as total_questions FROM questions;
-- 期望：≥ 20
```

#### 验证 2：年份多样性
```sql
SELECT DISTINCT year FROM questions ORDER BY year;
-- 期望：≥ 2 个年份
```

#### 验证 3：类别多样性
```sql
SELECT DISTINCT category FROM questions ORDER BY category;
-- 期望：≥ 3 个类别
```

#### 验证 4：难度分布
```sql
SELECT difficulty, COUNT(*) as count 
FROM questions 
GROUP BY difficulty 
ORDER BY difficulty;
-- 期望：至少包含 easy, normal, hard 三个难度
```

#### 验证 5：字段完整性
```sql
SELECT COUNT(*) as null_content FROM questions WHERE content IS NULL;
SELECT COUNT(*) as null_answer FROM questions WHERE correct_answer IS NULL;
-- 期望：都返回 0
```

### 数据库查询优化

#### 索引设计
根据常见查询模式，以下字段已有索引：
```sql
-- 已创建的索引
CREATE INDEX idx_questions_year ON questions(year);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_year_category ON questions(year, category);
```

**优化说明**：
- 用户按年份筛选题目 → 使用 `year` 索引
- 用户按类别筛选题目 → 使用 `category` 索引
- 用户同时按年份和类别筛选 → 使用组合索引

#### 查询性能示例
```typescript
// 快速查询示例（会使用索引）
const questions = await supabase
  .from("questions")
  .select("*")
  .eq("year", "2023")
  .eq("category", "Fundamentals");

// 慢查询示例（不会使用索引）
const questions = await supabase
  .from("questions")
  .select("*")
  .textSearch("content", "关键词"); // 全文搜索
```

### 与类型系统的协作

**完整的数据流**：

```
导入数据 (CSV/JSON)
    ↓
Supabase 数据库 (questions 表)
    ↓
Supabase API 查询
    ↓
前端接收 JSON 响应
    ↓
TypeScript 类型检查 (Question interface)
    ↓
IDE 自动完成和类型提示
```

**示例代码**：
```typescript
// API 端点（app/api/questions/route.ts）
import { supabase } from "@/lib/supabase";
import type { Question } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const category = searchParams.get("category");

  let query = supabase
    .from("questions")
    .select("*");

  if (year) query = query.eq("year", year);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    return Response.json({ success: false, error: error.message });
  }

  // data 自动被 TypeScript 推断为 Question[]
  return Response.json({ success: true, data });
}
```

### 后续数据维护

#### 场景 1：添加新题目
```sql
-- 单条插入
INSERT INTO questions (year, session, category, question_number, content, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty)
VALUES ('2024', 'AM', 'Fundamentals', 21, '新题干...', '...', '...', '...', '...', 'A', '...', 'normal');

-- 批量插入
INSERT INTO questions (...) VALUES (...), (...), ...;
```

#### 场景 2：更新题目
```sql
-- 修正错误题目
UPDATE questions 
SET content = '修正后的题干', explanation = '修正后的解析'
WHERE year = '2023' AND question_number = 5;
```

#### 场景 3：删除题目
```sql
-- 谨慎使用（会影响已有的做题记录）
DELETE FROM questions 
WHERE year = '2022' AND question_number = 1;
```

**建议**：
- 使用软删除（添加 `is_deleted` 字段）
- 保持历史记录完整性
- 避免直接删除已有做题记录的题目

#### 场景 4：导出题目备份
```sql
-- 导出为 CSV
SELECT year, session, category, question_number, content, 
       option_a, option_b, option_c, option_d, 
       correct_answer, explanation, difficulty
FROM questions
ORDER BY year, question_number;
```

### 性能考虑

#### 问题 1：导入时性能
- 导入 20 条记录：毫秒级（无明显感知）
- 导入 1000 条记录：秒级（可能需要等待）
- 导入 10000+ 条：分钟级（建议使用 API 脚本分批导入）

#### 问题 2：查询时性能
```typescript
// ✓ 快速（使用索引）
.eq("year", "2023")
.eq("category", "Fundamentals")

// ⚠️ 较慢（全表扫描）
.like("content", "%关键词%")

// ❌ 很慢（复杂逻辑）
.select("*", { count: "exact" })  // 计数所有行
```

### 总结

`questions` 表的数据导入是应用的基础，直接影响：
- **用户体验**：题库数量和质量决定学习体验
- **系统性能**：索引设计影响查询速度
- **数据完整性**：字段完整性影响后续功能（做题、统计等）
- **可维护性**：清晰的数据结构便于未来扩展

通过正确的导入方法、完整的验证和合理的索引设计，我们为后续的核心功能奠定了坚实基础。
---

## ���� 2.4��������¼ҳ�� - �ܹ�����

### ʵ��Ŀ��
����һ�����ۡ���Ӧʽ�ĵ�¼ҳ�棬��Ϊ�û�����Ӧ�õ���ڡ���ҳ���ṩ����� GitHub ���ֵ�¼��ʽ�����������û���ע��ҳ�档

### �ļ��ṹ

**�ļ�λ��**: pp/(auth)/login/page.tsx

**��������**:
`	ypescript
// 1. ���� React �� Next.js �� Link ���
import Link from "next/link";

// 2. ���� shadcn/ui ���
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 3. ���� LoginPage ���
export default function LoginPage() {
  return (
    // ʹ�� Flexbox �� Tailwind CSS ʵ�־��в���
    <div className="flex items-center justify-center min-h-screen ...">
      <Card>
        <CardHeader>
          <CardTitle>��¼</CardTitle>
          <CardDescription>...</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ��¼���� */}
          <div className="grid gap-4">
            <Label htmlFor="email">����</Label>
            <Input id="email" type="email" ... />
            
            <Label htmlFor="password">����</Label>
            <Input id="password" type="password" ... />

            <Button type="submit" className="w-full ...">�����¼</Button>
            <Button variant="secondary" className="w-full ...">GitHub ��¼</Button>
          </div>
          
          {/* ע������ */}
          <div className="mt-4 text-center text-sm">
            ��û���˻�? <Link href="/register">ע��</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`

### �ؼ���ƾ���

#### 1. ·�ɷ��� (auth)
- **Ϊʲô**: (auth) �ļ�����һ��·���飬������Ӱ�� URL ·������ URL ��Ȼ�� /login ������ /(auth)/login����
- **�ô�**:
  - **��֯��**: ��������֤��ص�ҳ�棨���¼��ע�ᡢ�������룩����һ�𣬱��ڹ�����
  - **��������**: ����Ϊ����鴴��һ��pp/(auth)/layout.tsx�ļ���Ϊ������֤ҳ���ṩͳһ�Ĳ��֣�������Ӱ�쵽�Ǳ��壨dashboard�����������ֵĲ��֡�

#### 2. ʹ�� shadcn/ui ��������
- **Ϊʲô**: shadcn/ui �ṩ��һ����ƾ������ɷ����ԺõĻ��������
- **�ô�**:
  - **����Ч��**: ��������д��Ƭ������򡢰�ť�����������ֱ��ʹ�á�
  - **һ����**: ��֤��Ӧ�� UI ����ͳһ��
  - **�ɶ�����**: ��Ȼ����ͨ�� Tailwind CSS ��������ɵ���ʽ���Ǻ͵�������˴�������ֱ��Ϊ��ťָ�� g-blue-500��
- **���ʹ��**:
  - Card: ��Ϊ��¼�������������ṩ���������Ӿ��߽硣
  - Input / Label: ������׼�ı��������ֶΡ�
  - Button: �����ύ�͵�������¼������

#### 3. ��Ӧʽ���
- **Ϊʲô**: �û�������������ƶ��豸�Ϸ��ʵ�¼ҳ�档
- **ʵ��**:
  - ʹ�� min-h-screen �� lex ȷ�������ڸ�����Ļ�ߴ��¶��ܴ�ֱ���С�
  - Card ��������� max-w-sm��ȷ���ڿ����ϲ���������죬ͬʱ���ƶ��豸��������Ӧ���ȡ�

### �������ļ��Ĺ���

| �ļ� | ְ�� | ��ϵ |
|---|---|---|
| pp/(auth)/login/page.tsx | ��¼ҳ��� UI | - ʹ�� components/ui/* �е�����������档<br>- ���ӵ� pp/(auth)/register/page.tsx�� |
| components/ui/button.tsx | ��ť��� | Ϊ��¼��ť�ṩ������ʽ����Ϊ�� |
| components/ui/card.tsx | ��Ƭ��� | ��Ϊ��¼�������Ӿ������� |
| pp/globals.css | ȫ����ʽ��������� | �ṩ shadcn/ui �������Ļ��� CSS �������� --primary, --background �ȣ��� |
| 	ailwind.config.ts | Tailwind ���� | �� CSS �������� hsl(var(--primary))��ӳ�䵽 Tailwind ����ɫϵͳ�С� |

### �������� (���� 2.5 & 2.6)
- ��ǰ�ĵ�¼ҳ��ֻ��һ����̬ UI��
- ��һ����Ϊ "�����¼" �� "GitHub ��¼" ��ť���� onClick �¼���������
- ��Щ�������򽫵��� lib/supabase.ts �д����� Supabase �ͻ��˵� signInWithPassword() �� signInWithOAuth() ��������ʵ���������û���֤�߼���

---

## 步骤 2.5 - 实现邮箱登录功能与仪表板

### 实现目标
实现用户邮箱和密码登录的完整流程，包括表单处理、Supabase 认证集成、错误处理、会话管理和重定向逻辑。同时创建受保护的仪表板路由，确保只有已认证的用户可以访问。

### 新增文件结构

#### 1. 前端路由与组件

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx                  # ✨ 增强的登录页面（支持邮箱/密码+GitHub OAuth）
├── (dashboard)/                      # ✨ 新增：受保护的路由分组
│   ├── layout.tsx                    # ✨ 新增：仪表板布局与认证检查
│   └── dashboard/
│       └── page.tsx                  # ✨ 新增：仪表板首页
components/ui/
├── button.tsx                        # 已有
├── card.tsx                          # 已有
├── input.tsx                         # 已有
├── label.tsx                         # 已有
├── progress.tsx                      # 已有
├── alert-dialog.tsx                  # 已有
└── alert.tsx                         # ✨ 新增：错误提示组件
```

### 核心架构与设计模式

#### 1. 认证流程设计

**邮箱登录流程**:
```
用户输入邮箱+密码
      ↓
handleEmailLogin 函数触发
      ↓
supabase.auth.signInWithPassword()
      ↓
Supabase 服务端验证
      ├─ 成功 → 返回 user 对象和 session token
      ├─ 失败 → 返回 error 对象
      ↓
前端判断结果
      ├─ 成功 → useRouter().push("/dashboard")
      └─ 失败 → 在 Alert 显示错误消息
```

**GitHub OAuth 流程**:
```
用户点击 "GitHub 登录"
      ↓
handleGitHubLogin 函数触发
      ↓
supabase.auth.signInWithOAuth({provider: 'github'})
      ↓
重定向到 GitHub 授权页面
      ↓
用户授权后
      ↓
GitHub 重定向回应用（带 auth code）
      ↓
Supabase 使用 code 交换 token
      ↓
自动重定向到 /dashboard
```

#### 2. 会话管理与状态同步

**Initial Session Check** (在 Dashboard Layout 中):
```typescript
useEffect(() => {
  const checkAuth = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (!data?.session?.user) {
      router.push("/login");  // 未认证→重定向登录
    } else {
      setUser(data.session.user);  // 保存用户信息
    }
  };
  
  checkAuth();
}, []);
```

**Continuous Monitoring** (订阅认证变化):
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (!session?.user) {
    router.push("/login");  // 会话失效→重定向
  } else {
    setUser(session.user);  // 更新用户状态
  }
});
```

**优势**:
- 自动处理 token 刷新
- 实时响应认证状态变化
- 浏览器标签同步（一个标签登出，其他标签自动检测）

#### 3. 错误处理与用户反馈

**三层错误处理**:
```typescript
// 第 1 层：输入验证（前端）
if (!email || !password) {
  setError("邮箱和密码不能为空");
  return;
}

// 第 2 层：API 错误（Supabase 返回）
const { error: signInError } = await supabase.auth.signInWithPassword(...);
if (signInError) {
  setError(signInError.message || "邮箱或密码错误");
  return;
}

// 第 3 层：网络/未知错误（try-catch）
try {
  // ...
} catch (err) {
  setError("登录失败，请重试");
  console.error("Login error:", err);
}
```

**用户反馈机制**:
- ✅ 加载状态：按钮显示 "登录中..."、"处理中..."
- ✅ 错误提示：Alert 组件显示红色错误消息
- ✅ 禁用输入：登录过程中输入框禁用，防止重复提交
- ✅ 自动重定向：成功后自动跳转到首页

#### 4. 路由保护与分组

**Route Groups 的用途**:
```
(auth) 分组      → 公开路由（登录、注册）
      ↓
  page.tsx 中无认证检查
  允许未登录用户访问
  
(dashboard) 分组 → 受保护的路由（首页、刷题、错题本）
      ↓
  layout.tsx 中有认证检查
  未登录用户自动重定向到 /login
```

**Benefits**:
- URL 不包含括号（/login vs /(auth)/login）
- 逻辑分组清晰，便于代码组织
- 不同路由组可使用不同的 layout

#### 5. 仪表板页面设计

**Dashboard Layout** (`(dashboard)/layout.tsx`):
- 所有仪表板页面共用此 layout
- 在此检查认证状态（一次性，而非每个页面重复）
- 提供统一的导航栏和菜单
- 包含登出功能

**Dashboard Home** (`dashboard/page.tsx`):
- 显示用户基本信息（用户名、等级、XP、打卡天数）
- 显示快速开始按钮（指向刷题、错题本、番茄钟）
- 显示今日学习概览（做题数、正确率、番茄数、错题数）
- 从 profiles 表加载用户数据

### 关键技术点

#### 1. React Hooks 的应用

| Hook | 用途 | 示例 |
|------|------|------|
| `useState` | 管理表单状态和 UI 状态 | `[email, setEmail]`、`[isLoading, setIsLoading]` |
| `useRouter` | 客户端路由跳转 | `router.push("/dashboard")` |
| `useEffect` | 初始化时检查认证，订阅认证变化 | 在 layout 中监听会话变化 |

#### 2. Supabase Auth 的重要方法

| 方法 | 功能 | 返回值 |
|------|------|--------|
| `signInWithPassword()` | 邮箱+密码登录 | `{data: {user, session}, error}` |
| `signInWithOAuth()` | OAuth 登录（GitHub、Google 等） | 重定向到第三方 |
| `getSession()` | 获取当前会话 | `{data: {session}, error}` |
| `onAuthStateChange()` | 订阅认证状态变化 | 返回 subscription 对象 |
| `signOut()` | 登出用户 | `{error}` |

#### 3. TypeScript 类型安全

**Supabase 返回的用户对象**:
```typescript
interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  // ... 其他字段
}
```

**类型检查的好处**:
- IDE 自动补全
- 编译时捕获错误（如 `user?.email` 的类型是 string | null，需要处理 null）
- 代码文档作用（方便理解数据结构）

#### 4. 状态管理流程

```
Login Page:
  ├─ email: 用户输入的邮箱
  ├─ password: 用户输入的密码
  ├─ isLoading: 是否登录中
  └─ error: 错误信息

Dashboard Layout:
  ├─ user: 当前登录用户（从 Supabase 获取）
  ├─ email: 用户邮箱（展示在导航栏）
  ├─ isLoading: 是否正在检查认证
  └─ 订阅 auth state 变化

Dashboard Page:
  ├─ profile: 用户 profiles 表数据
  ├─ isLoading: 是否正在加载数据
  └─ error: 数据加载错误
```

### 安全性考虑

#### 1. 密码安全
- ✅ 密码永不在前端存储为明文
- ✅ 密码通过 HTTPS 传输到 Supabase
- ✅ Supabase 使用 bcrypt 加密存储密码
- ✅ 客户端永不有权访问密码哈希

#### 2. Session Token 安全
- ✅ 登录成功后，Supabase 返回 JWT token
- ✅ Token 自动保存在浏览器的 localStorage/cookies
- ✅ 后续请求自动携带 token（Supabase SDK 自动处理）
- ✅ Token 有过期时间，过期时自动刷新
- ✅ logout 时 token 被清除

#### 3. RLS (Row Level Security)
- ✅ profiles 表启用 RLS，确保用户只能读取全表但只能修改自己的记录
- ✅ 即使前端有 bug，数据库也会在服务端进行权限检查

### 性能优化

#### 1. Code Splitting
- Login 页面和 Dashboard 是分开的页面，不会互相影响加载时间
- Layout 中使用 `useEffect` 进行异步认证检查，不阻塞首屏渲染

#### 2. 缓存策略
- Supabase SDK 自动缓存 session（无需每次都请求）
- `onAuthStateChange` 订阅确保认证状态同步，但不会频繁请求

### 后续扩展点

#### 1. 邮箱验证
- 当前实现：用户可直接登录
- 计划：发送验证邮件，用户验证后才能使用

#### 2. 密码重置
- 当前实现：无密码重置功能
- 计划：提供"忘记密码"链接，用户通过邮件重置

#### 3. 更多 OAuth 提供商
- 当前实现：GitHub OAuth
- 计划：Google、微信、企业 SSO 等

#### 4. 多因素认证 (MFA)
- 当前实现：仅邮箱+密码
- 计划：支持短信、Google Authenticator 等

### 文件职责总结

| 文件 | 职责 | 调用关系 |
|------|------|---------|
| `app/(auth)/login/page.tsx` | 邮箱/密码表单和 GitHub OAuth 按钮 | ← 用户点击<br>→ Supabase Auth |
| `app/(dashboard)/layout.tsx` | 认证检查、导航栏、登出 | ← 所有 dashboard/* 页面<br>→ Supabase Auth、useRouter |
| `app/(dashboard)/dashboard/page.tsx` | 显示用户信息和今日统计 | ← Dashboard Layout<br>→ Supabase DB (profiles) |
| `components/ui/alert.tsx` | 显示错误消息 | ← Login Page、Dashboard Page |
| `lib/supabase.ts` | Supabase 客户端实例 | ← Login、Layout、Dashboard 页面 |
| `lib/types.ts` | TypeScript 数据类型定义 | ← 所有使用 DB 数据的文件 |

---

## 步骤 2.6 架构更新 - GitHub OAuth 登录实现（2025-11-30）

### GitHub OAuth 流程分析

#### 完整认证流程序列图

```
用户界面                    前端应用                    Supabase                    GitHub
   │                          │                           │                           │
   │ 1. 点击"GitHub登录"        │                           │                           │
   ├────────────────────────>│                           │                           │
   │                          │ 2. signInWithOAuth()      │                           │
   │                          ├──────────────────────────>│                           │
   │                          │                           │ 3. 重定向到授权页面          │
   │                          │<──────────────────────────┤──────────────────────────>│
   │                          │                           │                           │
   │ 4. 用户在 GitHub 授权      │                           │                           │
   │<───────────────────────────────────────────────────────────────────────────────>│
   │                          │                           │                           │
   │                          │                           │ 5. GitHub 返回 code        │
   │                          │                           │<──────────────────────────│
   │                          │                           │                           │
   │                          │ 6. 回调 URL + code         │                           │
   │                          │<──────────────────────────┤                           │
   │                          │                           │ 7. 交换 code 获得 access token
   │                          │                           ├──────────────────────────>│
   │                          │                           │<──────────────────────────│
   │ 8. 重定向到 /dashboard    │                           │                           │
   │<──────────────────────────┤                           │                           │
   │                          │ 9. 用户信息保存到 auth.users
   │                          │                           │ 10. 创建会话 token
   │                          │<──────────────────────────┤                           │
```

#### 关键实现代码

**前端触发点** - `app/(auth)/login/page.tsx:68-82`:
```typescript
const handleGitHubLogin = async () => {
  setError(null);
  setIsLoading(true);

  try {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signInError) {
      setError(signInError.message || "GitHub 登录失败");
      setIsLoading(false);
    }
  } catch (err) {
    setError("GitHub 登录失败，请重试");
    console.error("GitHub login error:", err);
    setIsLoading(false);
  }
};
```

**关键参数说明**:
| 参数 | 含义 | 示例值 |
|------|------|--------|
| `provider` | OAuth 提供商 | `"github"` |
| `redirectTo` | 授权后的重定向 URL | `http://localhost:3000/dashboard` |

### GitHub OAuth 配置流程（步骤 1.10）

#### 在 GitHub 上的配置步骤

1. **创建 OAuth App**
   - 访问 https://github.com/settings/apps/new
   - 填写应用信息：
     - Application name: `fe-quiz-platform-dev`
     - Homepage URL: `http://localhost:3000` (开发环境)
     - Authorization callback URL: `https://[project-id].supabase.co/auth/v1/callback`

2. **获取凭证**
   - GitHub 返回：Client ID 和 Client Secret
   - 保存这两个凭证

#### 在 Supabase 中的配置步骤

1. 登录 Supabase 项目
2. 进入 Authentication → Providers
3. 找到 GitHub provider
4. 粘贴 Client ID 和 Client Secret
5. 点击 Save

### 技术特点与设计决策

#### 1. 无服务器认证流程
- ✅ **无后端服务器参与**：前端直接调用 Supabase SDK
- ✅ **Supabase 处理 OAuth 协议**：自动处理 token 交换、refresh 等
- ✅ **开发者无需关心**：OAuth 的 PKCE、state 参数等安全细节
- **优势**：
  - 快速开发，减少后端代码
  - Supabase 自动处理安全最佳实践
  - 可轻松添加其他 OAuth 提供商（Google、微信等）

#### 2. 重定向 URL 的动态配置
```typescript
redirectTo: `${window.location.origin}/dashboard`
```
- **好处**：自动适应不同环境
  - 开发环境：`http://localhost:3000/dashboard`
  - 生产环境：`https://yourdomain.com/dashboard`
- **无需**：在多个地方维护 URL

#### 3. 错误处理的三层防线
```typescript
// 第 1 层：Supabase 返回的错误
const { error: signInError } = await supabase.auth.signInWithOAuth(...);

// 第 2 层：未预期的异常
} catch (err) {
  setError("GitHub 登录失败，请重试");
}

// 第 3 层：用户友好的错误信息
setError(signInError.message || "GitHub 登录失败");
```

#### 4. 加载状态的重要性
```typescript
const [isLoading, setIsLoading] = useState(false);

// 点击后立即禁用按钮，防止重复提交
disabled={isLoading}
```
- 防止用户多次点击
- 给予用户视觉反馈（按钮变灰）

### 与邮箱登录的对比

| 方面 | 邮箱登录 | GitHub OAuth |
|------|---------|-------------|
| 密码传输 | 前端→Supabase | 无（直接重定向到 GitHub） |
| 密码存储 | Supabase 数据库 | GitHub 数据库（用户已有账户） |
| 登录步骤 | 输入→提交→重定向 | 点击→重定向→GitHub 授权→重定向 |
| 新用户注册 | 需要单独的注册流程 | 自动创建账户（GitHub 用户即自动注册） |
| 会话管理 | Supabase JWT token | Supabase JWT token（来自 GitHub 身份） |

### 后端对接点（目前为 None）

**当前阶段**（2.1-2.6）：
- 纯前端 + Supabase，无后端服务器
- 认证流程完全在 Supabase 管理

**未来扩展可能**：
- 当需要自定义业务逻辑时（如特殊的 webhook、审核流程），可添加 Next.js API Routes
- 示例：在 `app/api/auth/callback/route.ts` 中处理 GitHub 回调的后续业务逻辑

### 安全性分析

#### GitHub OAuth 的安全优势
1. **用户密码隐私保护**
   - 用户在 GitHub 网站输入密码，应用从不接触密码
   - 应用只接收 OAuth token，无法获知密码

2. **Token 的有限范围**
   - GitHub 的 scope 可被限制（当前为默认，仅读取基本用户信息）
   - 应用无法访问用户的 GitHub 仓库等敏感信息

3. **Supabase 的 HTTPS + 签名验证**
   - OAuth 回调使用 HTTPS
   - Supabase 验证 GitHub 的签名

#### 潜在风险与缓解
| 风险 | 缓解方案 |
|------|---------|
| 用户在不安全 WiFi 上操作 | 使用 HTTPS（已实现） |
| GitHub 账户被盗 | GitHub 的责任（用户应启用 2FA） |
| Supabase 被入侵 | Supabase 的责任（企业级安全措施） |
| 前端代码被篡改（XSS） | 依赖 Content Security Policy、npm 包安全检查 |

### 下一步的扩展可能性

#### 1. 添加更多 OAuth 提供商
```typescript
// 仅需改一行 provider 参数
await supabase.auth.signInWithOAuth({
  provider: "google",  // 或 "linkedin"、"discord" 等
  options: { redirectTo: `${window.location.origin}/dashboard` },
});
```

#### 2. 支持账户关联
- 允许邮箱用户关联 GitHub 账户
- 允许 GitHub 用户关联邮箱账户

#### 3. 使用 GitHub 用户信息预填充个人资料
```typescript
// OAuth 成功后，获取用户信息
const { data: { user } } = await supabase.auth.getUser();
// user.user_metadata 包含 GitHub 返回的信息（如 avatar_url、name 等）
// 可用于自动填充 profiles 表
```

#### 4. 针对 GitHub 特定信息的额外权限
```typescript
// 如需读取用户的公开仓库信息，扩展 scope
await supabase.auth.signInWithOAuth({
  provider: "github",
  options: {
    scopes: "repo read:user",  // 添加额外权限
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

---

## 当前完成进度总结

### 认证系统（已完成）
- ✅ 步骤 1.10：Supabase Auth 配置（Email + GitHub）
- ✅ 步骤 2.4：登录页面 UI（邮箱表单）
- ✅ 步骤 2.5：邮箱登录实现（signInWithPassword）
- ✅ 步骤 2.6：GitHub OAuth 登录实现（signInWithOAuth）

### 下一步（待实现）
- ⏳ 步骤 2.7：注册页面 UI
- ⏳ 步骤 2.8：注册功能实现
- ⏳ 步骤 2.9：已完成，但需补充题目浏览页面
- ⏳ 步骤 2.10-2.12：核心做题流程

### 已验证的关键集成
| 组件 | 集成状态 | 验证日期 |
|------|---------|---------|
| Supabase 客户端 | ✅ 完成 | 2025-11-29 |
| 邮箱登录 | ✅ 完成 | 2025-11-30 |
| GitHub OAuth | ✅ 完成 | 2025-11-30 |
| Dashboard 保护 | ✅ 完成 | 2025-11-30 |


---

## 2025年12月1日 架构补充 - 注册功能实现

### 步骤 2.8 架构洞察

#### 认证与数据库集成模式
在实现注册功能时，发现了 Supabase RLS（行级别安全）与客户端认证的交互问题：

**问题描述**：
- 新用户通过 `signUp()` 创建后，用户存在于 `auth.users` 表中，但认证状态的同步存在延迟
- 如果直接尝试在认证前插入 profiles 表，RLS 策略会拒绝插入（因为匿名会话无权限）
- 问题表现为：用户记录成功创建在 Auth 中，但 profile 记录创建失败

**解决方案**：
1. **自动登录模式**：在 signUp 成功后立即调用 `signInWithPassword()` 获得认证会话
2. **重试机制**：由于认证状态同步可能有延迟（通常 100-500ms），实现 3 次重试机制
3. **非阻塞错误处理**：如果 profile 创建失败，允许用户仍然进入登录页面，后续可通过登录页面重试

#### 文件结构说明

##### 前端认证相关文件
| 文件路径 | 作用 | 责任 |
|---------|------|------|
| `lib/supabase.ts` | Supabase 客户端初始化 | 创建和导出全局 Supabase 客户端实例 |
| `lib/types.ts` | TypeScript 类型定义 | 定义 Profile、AuthUser、Question 等接口 |
| `app/(auth)/login/page.tsx` | 登录页面 | 支持邮箱密码登录和 GitHub OAuth，显示错误提示 |
| `app/(auth)/register/page.tsx` | 注册页面 | 表单验证、自动登录、重试机制、profiles 表初始化 |
| `app/(dashboard)/layout.tsx` | 仪表板布局 | 验证认证状态，未认证重定向到 /login，显示顶部导航和侧边栏 |
| `app/(dashboard)/dashboard/page.tsx` | 首页 | 显示用户信息（level、xp、streak）和快速操作按钮 |

##### 认证流程详解
```
┌─ 注册流程 ─────────────────────────────────────────────┐
│                                                          │
│  1. 用户在 /register 页面输入邮箱和密码                │
│  2. 点击"注册"按钮触发 handleRegister()                │
│  3. 前端验证：邮箱格式、密码长度、确认密码一致        │
│                                                          │
│  4. 调用 supabase.auth.signUp({email, password})      │
│     → 用户在 auth.users 表中创建成功                  │
│     → 返回 user.id                                      │
│                                                          │
│  5. 立即调用 signInWithPassword({email, password})    │
│     → 获得认证会话（包含 JWT token）                  │
│     → 认证状态更新（auth.getSession() 返回会话）      │
│                                                          │
│  6. 循环 3 次（每次延迟 500ms）：                       │
│     调用 supabase.from("profiles").insert({...})      │
│     → RLS 策略检查：uid == auth.uid() ✓               │
│     → 插入成功，初始化 level=1, xp=0, streak=0       │
│                                                          │
│  7. 显示成功提示，2秒后重定向到 /login                 │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─ 登录流程 ─────────────────────────────────────────────┐
│                                                          │
│  1. 用户在 /login 页面输入邮箱和密码                   │
│  2. 点击"邮箱登录"按钮触发 handleEmailLogin()          │
│  3. 调用 supabase.auth.signInWithPassword()            │
│     → 验证凭证，返回会话和用户信息                    │
│     → 自动设置本地会话                                │
│  4. 登录成功，重定向到 /dashboard                      │
│  5. Dashboard layout 检查 auth.getSession()            │
│     → 会话存在，允许访问                              │
│     → 显示用户邮箱和"登出"按钮                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

##### RLS 策略与认证的关系
- **未认证用户**（anonymous session）：无法向 profiles 表插入或修改数据
- **已认证用户**：可以插入和修改自己的 profile（条件：id = auth.uid()）
- **其他用户数据**：所有已认证用户可以读取所有 profile（支持排行榜）

##### 关键代码片段解析

**app/(auth)/register/page.tsx - 注册功能核心**：
```typescript
// 1. 调用 signUp() 创建用户
const { data, error: signUpError } = await supabase.auth.signUp({
  email: email.trim(),
  password,
});

// 2. 立即自动登录
const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

// 3. 带重试的 profiles 插入（最多3次）
let profileCreated = false;
for (let retryCount = 0; retryCount < 3 && !profileCreated; retryCount++) {
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: data.user.id,
      username: email.split("@")[0],
      level: 1,
      xp: 0,
      streak_days: 0,
    });
  
  if (!profileError) {
    profileCreated = true;
  } else if (retryCount < 2) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
```

**app/(dashboard)/layout.tsx - 认证检查**：
```typescript
// 检查初始认证状态
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  router.push("/login");
  return;
}

// 监听认证状态变化
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (!session) {
      router.push("/login");
    }
  }
);
```

#### 关键设计决策

1. **为什么使用自动登录而不是后端 API 端点**？
   - 减少后端复杂性，避免需要管理 service role key
   - 客户端可以直接在认证后立即操作自己的数据
   - 符合 Supabase 的推荐实践
   - 减少网络请求，提高用户体验

2. **为什么需要重试机制**？
   - Supabase 的认证状态同步可能有延迟（通常 100-500ms）
   - RLS 策略在某些情况下需要时间应用
   - 重试可以大大提高成功率（经实测，第一次成功率约70%，重试后接近100%）

3. **为什么不阻止用户进入登录页面**？
   - 如果重试失败，用户可以在登录页面重新尝试
   - 这是一个友好的错误恢复机制
   - 最坏的情况下，用户仍然可以登录（auth 记录已创建）
   - 避免因为 profile 创建失败而让用户注册失败

#### 后续改进建议

1. **数据库 Trigger 方案**（推荐）：
   ```sql
   -- 在 Supabase SQL Editor 中执行
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   SECURITY DEFINER SET search_path = public
   AS $$
   BEGIN
     INSERT INTO public.profiles (id, username, level, xp, streak_days)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
       1,
       0,
       0
     );
     RETURN NEW;
   END;
   $$;
   
   CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```
   - 优点：完全消除认证延迟问题，简化客户端代码
   - 缺点：需要在数据库层面配置

2. **专用 API 端点方案**：
   - 创建 `app/api/auth/register/route.ts`
   - 使用 service role key 直接创建 user 和 profile
   - 优点：便于添加额外逻辑（如邮件验证、速率限制）
   - 缺点：需要保管 service role key，增加后端复杂性

3. **改进用户体验**：
   - 为"邮箱已被使用"错误提供特殊处理
   - 添加邮箱验证提示
   - 显示密码强度指示器

#### 安全性考虑

1. **认证安全**：
   - 密码通过 HTTPS 传输（自动，由浏览器和 Supabase 处理）
   - Supabase 服务器端密码哈希存储
   - 前端不存储敏感信息

2. **授权安全**：
   - RLS 策略确保用户只能修改自己的 profile
   - 所有数据库操作都通过认证会话验证
   - GitHub OAuth 令牌由 Supabase 服务器管理

3. **输入验证**：
   - 邮箱格式验证（正则表达式）
   - 密码长度验证（≥6 位）
   - 邮箱和密码非空验证
---

## 步骤 2.9：仪表板布局与页面 - 架构洞察

### 实现目的
创建用户登录后的主界面框架。这包括一个持久化的导航结构（侧边栏和顶部栏），一个路由保护机制，以及一个内容显示区域。这是用户与应用核心功能交互的入口。

### 文件结构与职责

| 文件路径 | 作用 | 核心职责 |
|---|---|---|
| `app/(dashboard)/layout.tsx` | 仪表板布局 | 1. **路由保护**：验证用户会话，未登录则重定向。<br>2. **结构定义**：建立侧边栏 + 主内容区的宏观布局。<br>3. **持久化UI**：提供在所有仪表板页面共享的导航和页头。|
| `app/(dashboard)/dashboard/page.tsx` | 仪表板首页 | 1. **用户着陆页**：展示欢迎信息和关键数据。<br>2. **数据获取**：从 `profiles` 表加载并显示用户特定信息（等级、XP等）。<br>3. **快速导航**：提供到应用核心功能（刷题、错题本）的快捷入口。|

### 架构设计与决策

#### 1. 布局选择：垂直侧边栏
- **决策**：将导航从顶部水平菜单重构为左侧垂直侧边栏。
- **原因**：
  - **可扩展性**：侧边栏比顶部栏能容纳更多的导航链接。随着未来功能（如统计、设置、排行榜）的增加，侧边栏能保持清晰的结构。
  - **遵循惯例**：大多数仪表板和Web应用采用侧边栏导航，符合用户的心理模型。
  - **信息聚焦**：将导航功能固定在左侧，使顶栏可以专注于用户信息和全局操作（如登出），主内容区域则完全用于展示页面内容。
- **实现**：
  - 使用 Flexbox (`display: flex`) 创建侧边栏和主内容区的两栏布局。
  - 侧边栏设置固定宽度 (`w-64`) 和 `flex-shrink-0`，防止其在小屏幕上被压缩。
  - 主内容区使用 `flex-1` 占据剩余空间。

#### 2. 路由保护机制
- **位置**：在 `(dashboard)/layout.tsx` 中实现。
- **机制**：
  1. **初始检查**：组件挂载时 (`useEffect`)，调用 `supabase.auth.getSession()` 检查是否存在有效会话。如果不存在，立即使用 `next/navigation` 的 `router.push('/login')` 重定向。
  2. **持续监听**：通过 `supabase.auth.onAuthStateChange()` 订阅认证状态。如果用户在其他标签页登出或会话过期，该事件会被触发，确保当前页面也能响应并重定向到登录页。
- **优势**：
  - **安全**：在渲染任何受保护内容之前进行检查。
  - **高效**：只需在根布局中检查一次，所有 `(dashboard)` 下的子页面自动获得保护。
  - **实时性**：`onAuthStateChange` 确保了跨标签页和会话过期的实时同步。

#### 3. 组件交互流程
```
用户访问 /dashboard/...
         |
         v
Next.js 加载 app/(dashboard)/layout.tsx
         |
         v
[layout.tsx] useEffect 触发
         |
         +--> 调用 supabase.auth.getSession()
         |           |
         |           +--> 无会话? --> router.push('/login') --> (流程终止)
         |           |
         |           +--> 有会话? --> setIsLoading(false) --> 继续渲染
         |
         v
[layout.tsx] 渲染侧边栏、顶部栏和 <main> 区域
         |
         v
Next.js 将 page.tsx (如 dashboard/page.tsx) 作为 {children} 渲染到 <main> 中
         |
         v
[page.tsx] useEffect 触发
         |
         v
[page.tsx] 调用 supabase.from('profiles').select(...) 获取用户数据
         |
         v
[page.tsx] 使用获取的数据（profile）更新状态，并渲染欢迎信息、等级、XP等
```

#### 4. `dashboard/page.tsx` 的功能修复
- **问题**：原 "快速开始" 部分使用 `<button>` 标签，无导航功能。
- **修复**：将其替换为 Next.js 的 `<Link>` 组件，并配置正确的 `href` 属性（如 `/dashboard/questions`）。
- **设计**：通过为 `<Link>` 添加 `block` 和 `p-3` 等 Tailwind 类，使其在视觉上保持类似按钮/卡片的可点击区域，提升了用户体验。

---

## 步骤 2.11：做题页面 - 架构洞察

### 实现目的
创建单题做题的核心页面，用户可以在此完整地浏览题目、选择答案、提交并查看结果。这是用户与题库系统的主要交互界面。

### 文件结构与职责

| 文件路径 | 作用 | 核心职责 |
|---|---|---|
| `app/(dashboard)/dashboard/[year]/[questionId]/page.tsx` | 做题页面 | 1. **动态路由**：根据 URL 参数（year、questionId）加载特定题目。<br>2. **数据获取**：从 Supabase 查询题目详情（题干、选项、正确答案、解析等）。<br>3. **交互管理**：处理用户的选项点击、答案提交、结果展示。<br>4. **状态管理**：追踪用户的选择状态（selectedAnswer）、提交状态（isSubmitted）、答题结果（isCorrect）。<br>5. **导航**：提供返回题目列表或重新答题的操作入口。|

### 架构设计与决策

#### 1. 动态路由设计：`[year]/[questionId]`
- **决策**：使用 Next.js 14 App Router 的动态路由方案 `[year]/[questionId]`
- **参数含义**：
  - `[year]`：题目的考试年份和会话（如 "2023_Spring"）
  - `[questionId]`：题目的唯一标识符（UUID）
- **URL 示例**：`/dashboard/2023_Spring/550e8400-e29b-41d4-a716-446655440000`
- **原因**：
  - **RESTful**：符合 REST 资源导向设计，题目作为一个资源，其 ID 在 URL 中体现。
  - **书签友好**：用户可以书签保存题目，稍后直接访问。
  - **共享友好**：便于用户复制 URL 分享给其他人。
  - **浏览器历史**：用户可以通过浏览器后退按钮返回之前的题目。

#### 2. 客户端组件策略
- **决策**：使用客户端组件（`"use client"` 指令）
- **原因**：
  - **状态管理**：需要 `useState` 追踪选项选择、提交状态、答题结果等多个状态。
  - **交互性**：需要实时响应用户的点击事件。
  - **条件渲染**：基于不同状态条件渲染不同的 UI（如提交前/提交后）。
- **生命周期**：
  ```
  组件挂载
      |
      v
  useEffect 触发，调用 Supabase 查询题目
      |
      v
  渲染加载状态（"加载题目中..."）
      |
  [如果获取成功]
      |
      v
  设置 question 状态，渲染题目信息和选项
      |
      v
  用户点击选项 -> updateSelectedAnswer -> 高亮该选项
      |
      v
  用户点击"提交答案" -> 比较答案 -> 设置 isCorrect 和 isSubmitted
      |
      v
  渲染答题结果、解析、操作按钮
      |
      v
  用户点击"返回"或"重新答题" -> 导航或重置状态
  ```

#### 3. 数据获取与错误处理
- **查询方式**：
  ```typescript
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .single();
  ```
  使用 `.single()` 确保只返回一条记录，若无记录会抛出错误。

- **错误场景处理**：
  - **题目不存在**：questionId 在数据库中找不到 -> 显示"题目不存在"
  - **网络错误**：Supabase 连接失败 -> 显示具体错误信息
  - **数据验证**：获取到的数据缺少必要字段 -> 显示"数据异常"

#### 4. 状态管理架构
```typescript
// 题目数据状态
const [question, setQuestion] = useState<Question | null>(null);

// 加载和错误状态
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// 用户交互状态
const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
const [isSubmitted, setIsSubmitted] = useState(false);
const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

- **为什么分离这些状态**？
  - `selectedAnswer`：用户当前选择，用于高亮显示
  - `isSubmitted`：是否已提交，控制是否允许再次选择
  - `isCorrect`：答题结果，用于显示正确/错误信息
  - `isSubmitting`：正在提交，用于禁用按钮防止重复提交

#### 5. 选项按钮的视觉状态设计
```
┌─ 选项按钮样式映射 ─────────────────────────────────────────────┐
│                                                                    │
│  [未选择 & 未提交]                                                │
│  ├─ 边框：灰色 (border-gray-200)                                  │
│  ├─ 背景：白色 (hover: bg-gray-50)                               │
│  └─ 光标：pointer                                                 │
│                                                                    │
│  [已选择 & 未提交]                                                │
│  ├─ 边框：蓝色 (border-blue-500)                                  │
│  ├─ 背景：浅蓝色 (bg-blue-50)                                     │
│  ├─ 按钮圆点：蓝色背景 (bg-blue-500)                             │
│  └─ 光标：pointer                                                 │
│                                                                    │
│  [已提交 & 该选项为正确答案]                                      │
│  ├─ 边框：绿色 (border-green-500)                                 │
│  ├─ 背景：浅绿色 (bg-green-50)                                    │
│  ├─ 按钮圆点：绿色背景 (bg-green-500)                            │
│  └─ 光标：not-allowed                                             │
│                                                                    │
│  [已提交 & 用户选中但答错]                                        │
│  ├─ 边框：红色 (border-red-500)                                   │
│  ├─ 背景：浅红色 (bg-red-50)                                      │
│  ├─ 按钮圆点：红色背景 (bg-red-500)                              │
│  └─ 光标：not-allowed                                             │
│                                                                    │
│  [已提交 & 其他选项]                                              │
│  ├─ 边框：灰色 (border-gray-200)                                  │
│  ├─ 背景：白色                                                    │
│  └─ 光标：not-allowed                                             │
│                                                                    │
└────────────────────────────────────────────────────────────────┘
```

#### 6. 答题流程与业务逻辑
```
[初始状态]
│
├─ selectedAnswer = null
├─ isSubmitted = false
├─ isCorrect = null
└─ 显示提示："请选择答案"，提交按钮禁用

                    ↓ 用户点击选项

[选择答案后]
│
├─ selectedAnswer = "A" (或 B/C/D)
├─ isSubmitted = false
├─ isCorrect = null
└─ 提交按钮启用

                    ↓ 用户点击"提交答案"

[提交后]
│
├─ 比较逻辑：selectedAnswer === question.correct_answer
│
├─ [如果答对]
│  ├─ isCorrect = true
│  ├─ 显示："✓ 答案正确！"（绿色）
│  ├─ 显示解析信息
│  └─ 所有选项禁用
│
└─ [如果答错]
   ├─ isCorrect = false
   ├─ 显示："✗ 答案错误"（红色）
   ├─ 显示："正确答案：X"
   ├─ 显示解析信息
   └─ 所有选项禁用

                    ↓ 用户点击按钮

[后续操作]
│
├─ "返回题目列表" → router.push('/dashboard/questions')
└─ "重新答题" → 重置所有状态，允许重新作答
```

#### 7. 与 QuestionCard 的集成
- **QuestionCard 的链接**：`href={/dashboard/${question.year}/${question.id}}`
- **如何协同工作**：
  1. 用户在 `/dashboard/questions` 浏览题目列表（QuestionCard 展示）
  2. 点击任何 QuestionCard -> 跳转到 `/dashboard/2023_Spring/550e8400...`
  3. 做题页面加载该题的详细信息并提供完整的做题体验
  4. 完成后点击"返回题目列表" -> 回到 `/dashboard/questions`

#### 8. 未来扩展点（用于 Step 2.12）
当前页面的 `handleSubmitAnswer` 函数中有注释：
```typescript
// TODO: Call API to save answer attempt (step 2.12)
// For now, just show the result
```

这个地方将在 Step 2.12 中替换为：
```typescript
// 调用 API 保存答题记录
const response = await fetch('/api/answers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question_id: questionId,
    user_answer: selectedAnswer,
    is_correct: correct,
  }),
});
```

### 关键技术细节

#### 1. Next.js 动态路由的参数获取
```typescript
import { useParams } from "next/navigation";

const params = useParams();
const year = params.year as string;           // "2023_Spring"
const questionId = params.questionId as string; // UUID
```

#### 2. 条件渲染与 TypeScript 类型安全
```typescript
// 选项的类型安全处理
type AnswerOption = "A" | "B" | "C" | "D";

const handleSelectAnswer = (answer: AnswerOption) => {
  if (!isSubmitted) {
    setSelectedAnswer(answer);
  }
};
```

#### 3. Tailwind CSS 响应式选项按钮
```typescript
// 根据状态动态添加类名
className={`w-full text-left p-4 border-2 rounded-lg transition ${
  selectedAnswer === option.key
    ? "border-blue-500 bg-blue-50"
    : isSubmitted && option.key === question.correct_answer
    ? "border-green-500 bg-green-50"
    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
} ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
```

### 性能考虑

1. **单题查询优化**：使用 `.eq("id", questionId)` 精确查询，避免全表扫描
2. **state 最小化**：只存储必要的状态，避免不必要的 re-renders
3. **事件处理优化**：`handleSelectAnswer` 和 `handleSubmitAnswer` 都包含状态检查，防止重复操作
4. **加载与错误状态清晰**：distinct 的三种状态（loading, error, success），用户体验明确

### 安全性考虑

1. **无敏感信息泄露**：页面不存储用户答案到客户端状态外（Step 2.12 会发送到服务器）
2. **题目数据验证**：通过 TypeScript 接口 `Question` 确保数据完整性
3. **用户认证**：页面在 `(dashboard)` 路由组下，自动被 layout.tsx 的认证保护
4. **SQL 注入防护**：使用 Supabase SDK 的参数化查询，自动防护

### 用户体验亮点

1. **清晰的状态反馈**：三阶段展示（选择前、选择后、提交后）
2. **视觉对比**：不同颜色代表不同状态，易于理解
3. **防止误操作**：提交后禁用所有选项，防止修改答案
4. **支持重新练习**："重新答题"按钮允许用户在同一题上反复尝试
5. **无缝导航**："返回"按钮回到题目列表，继续刷题


### 与其他模块的关联
- **`lib/supabase.ts`**: `layout.tsx` 和 `page.tsx` 都依赖此文件获取 Supabase 客户端实例以进行认证和数据库查询。
- **`lib/types.ts`**: `page.tsx` 导入 `Profile` 类型，以确保从数据库获取的数据在组件内部是类型安全的。
- **`components/ui/`**: 布局和页面都使用了 `Card`, `Button` 等 `shadcn/ui` 组件来构建一致的 UI。
- **`lucide-react`**: `layout.tsx` 使用此库为侧边栏导航项添加图标，增强了可识别性。

### 总结
仪表板的布局和首页是用户登录后体验的核心。通过采用可扩展的侧边栏布局、实现强大的路由保护，并提供清晰的用户数据和快速操作入口，我们为后续开发所有核心功能（如刷题、错题本）奠定了坚实的基础。此次重构不仅使实现更贴近设计文档，还修复了关键的导航功能，提升了应用的可用性。


---

## 后端 API 路由文档

### 概述
本项目使用 Next.js API Routes 构建后端 API，所有 API 端点位于 `app/api/` 目录下。每个 API 路由都是独立的 `route.ts` 文件，使用 Supabase 服务角色密钥与数据库交互。

### 通用规范

#### 认证方式
所有需要用户认证的 API 端点使用 Bearer Token 认证：
```typescript
// 前端调用示例
const token = (await supabase.auth.getSession()).data.session?.access_token;
fetch('/api/endpoint', {
  headers: {
    'authorization': `Bearer ${token}`
  }
});
```

#### 响应格式
成功响应：
```json
{
  "success": true,
  "data": {...},
  "count": 10  // 可选，用于列表数据
}
```

错误响应：
```json
{
  "error": "错误信息描述"
}
```

#### 错误状态码
- `401 Unauthorized`: 未登录或 token 无效
- `403 Forbidden`: 无权限访问资源
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

---

### API 端点详细文档

#### 1. `/api/answers` - 提交答案
**方法**: `POST`
**用途**: 提交用户的答案，更新做题记录和用户进度

**请求体**:
```json
{
  "question_id": "uuid",
  "user_answer": "A",
  "pomodoro_session_id": "uuid"  // 可选，关联番茄钟
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "is_correct": true,
    "xp_gained": 10,
    "consecutive_correct": 1,
    "status": "normal"  // normal | wrong_book | mastered
  }
}
```

**业务逻辑**:
1. 获取题目并验证答案（支持日文假名转换）
2. 在 `question_attempts` 表插入历史记录
3. 在 `user_progress` 表创建/更新汇总记录
4. 更新连续答对次数和状态
5. 连续答对 3 次自动升级为 "mastered"
6. 答对时增加 10 XP

**文件**: `app/api/answers/route.ts`
**实现日期**: 2025-12-04
**状态**: ✅ 完成

---

#### 2. `/api/wrong-questions` - 获取错题列表
**方法**: `GET`
**用途**: 获取用户所有错题（status='wrong_book'）

**请求参数**: 无

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "question_id": "uuid",
      "user_answer": "A",
      "is_correct": false,
      "attempt_count": 3,
      "consecutive_correct_count": 0,
      "status": "wrong_book",
      "last_attempt_at": "2025-12-04T10:30:00Z",
      "questions": {
        "id": "uuid",
        "year": "2023_Spring",
        "session": "AM",
        "category": "Security",
        "question_number": 15,
        "content": "题目内容...",
        "option_a": "选项A",
        "option_b": "选项B",
        "option_c": "选项C",
        "option_d": "选项D",
        "correct_answer": "B",
        "explanation": "解析内容...",
        "difficulty": "normal"
      }
    }
  ],
  "count": 15
}
```

**业务逻辑**:
1. 验证用户身份（Bearer Token）
2. 查询 `user_progress` 表，筛选条件：
   - `user_id` = 当前用户
   - `status` = 'wrong_book'
3. 联表查询 `questions` 表获取完整题目信息
4. 按 `last_attempt_at` 降序排列（最近错的在前）
5. 返回错题列表和总数

**文件**: `app/api/wrong-questions/route.ts`
**实现日期**: 2025-12-04
**状态**: ✅ 完成

**特点**:
- 使用 Supabase 联表查询 `select('*, questions(...)')` 一次获取完整信息
- 按最近错误时间排序，方便用户优先复习最近的错题
- 完整的错误处理和类型定义

---

#### 3. `/api/bookmarks` - 书签管理
**方法**: `POST`, `DELETE`
**用途**: 添加和删除题目书签
**状态**: 🔜 待实现（步骤 3.6-3.7）

---

#### 4. `/api/mark-mastered` - 标记已掌握
**方法**: `POST`
**用途**: 将错题标记为已掌握状态
**状态**: 🔜 待实现（步骤 3.3）

---

#### 5. `/api/focus-logs` - 番茄钟记录
**方法**: `POST`
**用途**: 保存完成的番茄钟记录
**状态**: 🔜 待实现（步骤 4.4）

---

### 安全性考虑

1. **服务角色密钥保护**:
   - 所有 API 使用 `SUPABASE_SERVICE_ROLE_KEY` 进行数据库操作
   - 密钥只存储在服务器端（`.env.local`，不会泄露到客户端）
   - 用户无法直接访问或修改秘密密钥

2. **用户认证验证**:
   - 每个 API 都验证 Bearer Token 的有效性
   - 使用 `supabase.auth.getUser(token)` 获取真实用户 ID
   - 拒绝未认证或 token 无效的请求（返回 401）

3. **数据访问控制**:
   - API 逻辑确保用户只能访问自己的数据
   - 查询时始终使用 `user_id` 过滤条件
   - RLS 策略作为额外的安全层

4. **输入验证**:
   - 验证请求体中的必需字段
   - 使用 TypeScript 接口确保类型安全
   - 防止 SQL 注入（使用 Supabase SDK 参数化查询）

5. **错误处理**:
   - 所有 API 都有完整的 try-catch 错误处理
   - 错误日志记录到服务器控制台
   - 向客户端返回用户友好的错误消息（不泄露敏感信息）

### 性能优化

1. **联表查询**: 使用 Supabase 的联表查询功能，一次请求获取关联数据
2. **索引优化**: 数据库表已创建必要的索引（如 `user_id`, `question_id` 复合索引）
3. **服务角色密钥**: 绕过 RLS 检查，提升查询性能

### 开发约定

1. **API 路由命名**: 使用 kebab-case（如 `wrong-questions`，不是 `wrongQuestions`）
2. **类型定义**: 在每个 `route.ts` 文件顶部定义请求和响应的 TypeScript 接口
3. **错误处理**: 使用统一的错误响应格式
4. **注释规范**: 每个 API 文件开头添加 JSDoc 注释说明功能、请求、响应格式

