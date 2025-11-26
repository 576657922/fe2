# FE 刷题平台 - 详细实施计划 (Implementation Plan)

## 概述

本实施计划专注于 **MVP 基础功能**的逐步落地。每一步都是小而具体的功能点，完成后需要通过验证测试。严禁包含代码，只提供清晰的指令。

**总体分阶段**：
1. **阶段 1：基础设施与数据库** (3-4 天)
2. **阶段 2：核心题库与做题流程** (4-5 天)
3. **阶段 3：错题本与进度记录** (3-4 天)
4. **阶段 4：番茄钟与基础统计** (2-3 天)

---

## 阶段 1：基础设施与数据库 (3-4 天)

### 步骤 1.1：初始化 Next.js 项目
**目标**：创建基础的 Next.js 应用框架，配置 TypeScript 和 Tailwind CSS

**具体指令**：
1. 在 `C:\fe2` 目录中执行 `npx create-next-app@latest . --typescript --tailwind --app` 命令
2. 选择以下选项：
   - ESLint: YES
   - 其他默认选项
3. 验证生成的目录结构包含 `app/`、`components/`、`public/` 文件夹

**验证测试**：
- [ ] 运行 `npm run dev`，访问 `localhost:3000` 能正常打开欢迎页面
- [ ] 页面加载时间 ≤ 2 秒
- [ ] 在浏览器控制台没有 TypeScript 错误

---

### 步骤 1.2：安装核心依赖包
**目标**：安装所有必需的库，为后续功能开发做准备

**具体指令**：
1. 执行 `npm install @supabase/supabase-js zustand framer-motion recharts lucide-react` 命令
2. 执行 `npm install -D @types/node @types/react` 确保类型定义完整
3. 验证 `package.json` 中所有依赖都已添加

**验证测试**：
- [ ] 运行 `npm list` 确保所有包安装成功
- [ ] 运行 `npm run dev` 不报缺少依赖的错误
- [ ] 项目仍能正常启动

---

### 步骤 1.3：安装并初始化 shadcn/ui 组件库
**目标**：配置 shadcn/ui 组件库，为快速构建 UI 做准备

**具体指令**：
1. 执行 `npx shadcn-ui@latest init` 命令
2. 选择默认选项（使用 Tailwind CSS 作为样式系统）
3. 验证生成了 `components/ui/` 目录

**验证测试**：
- [ ] 在 `components/ui/` 目录下有 `button.tsx`、`card.tsx` 等基础组件文件
- [ ] 运行 `npm run dev` 项目仍能正常启动

---

### 步骤 1.4：创建 Supabase 项目并获取认证信息
**目标**：在 Supabase 上创建项目，获取连接所需的 URL 和 API Key

**具体指令**：
1. 访问 https://app.supabase.com 注册或登录账户
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `fe-quiz-platform`
   - Password: 设置强密码（用于数据库认证）
   - Region: 选择离用户最近的地区
4. 等待项目初始化完成（约 2-3 分钟）
5. 在项目设置中找到 "API" 部分
6. 复制 `Project URL` 和 `anon public` API Key

**验证测试**：
- [ ] 能访问 Supabase 项目的 SQL Editor
- [ ] 能执行简单的 SQL 命令：`SELECT NOW()`
- [ ] 获得了有效的 Project URL 和 API Key

---

### 步骤 1.5：配置项目的 Supabase 环境变量
**目标**：在 Next.js 项目中配置 Supabase 连接信息

**具体指令**：
1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容：
   ```
   NEXT_PUBLIC_SUPABASE_URL=<你的_Project_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的_anon_public_Key>
   ```
3. 保存文件（`.env.local` 会被 git 自动忽略）

**验证测试**：
- [ ] 环境变量文件存在且内容正确
- [ ] 运行 `npm run dev` 没有环境变量缺失的警告
- [ ] 可在浏览器控制台访问 `process.env.NEXT_PUBLIC_SUPABASE_URL`

---

### 步骤 1.6：创建 Supabase 数据库表 - profiles（用户表）
**目标**：在 Supabase 中创建用户信息表，支持排行榜等跨用户功能

**具体指令**：
1. 在 Supabase 项目的 SQL Editor 中执行以下操作：
2. 创建 `profiles` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `username` (text, not null)
   - `level` (integer, default 1)
   - `xp` (integer, default 0)
   - `streak_days` (integer, default 0)
   - `created_at` (timestamp, default now())
   - `updated_at` (timestamp, default now())
3. 添加外键约束：`id` 关联到 `auth.users(id)`
4. 启用 Row Level Security (RLS)，设置以下策略：
   - **SELECT**：允许所有人读取（支持排行榜）
   - **UPDATE/DELETE**：只允许用户更新/删除自己的信息
   - ⚠️ **参考**：`design-decisions.md` 第 1.1 节了解详细的 RLS SQL 语句

**验证测试**：
- [ ] 在 Supabase Dashboard 的 Table Editor 中能看到 `profiles` 表
- [ ] 表结构包含所有指定的列
- [ ] RLS 已启用（显示为 "on"）
- [ ] 尝试以不同用户身份读取 profiles，都能看到所有用户的公开信息

---

### 步骤 1.7：创建 Supabase 数据库表 - questions（题库表）
**目标**：在 Supabase 中创建题目库存表

**具体指令**：
1. 在 Supabase SQL Editor 中创建 `questions` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `year` (text, e.g., "2023_Spring")
   - `session` (text, e.g., "AM" 或 "PM")
   - `category` (text, e.g., "Security", "Database")
   - `question_number` (integer)
   - `content` (text, 题干内容)
   - `option_a` (text)
   - `option_b` (text)
   - `option_c` (text)
   - `option_d` (text)
   - `correct_answer` (text, 只包含 A/B/C/D)
   - `explanation` (text, 解析)
   - `difficulty` (text, enum: 'easy', 'normal', 'hard')
   - `created_at` (timestamp, default now())
2. 创建索引：在 `year` 和 `category` 列上创建索引以加速查询
3. 不启用 RLS（所有用户可以查看）

**验证测试**：
- [ ] `questions` 表已创建且可在 Table Editor 中看到
- [ ] 所有列都存在且类型正确
- [ ] 索引已创建（在 Indexes 部分可见）

---

### 步骤 1.8：创建 Supabase 数据库表 - user_progress（做题记录表）
**目标**：在 Supabase 中创建用户答题记录表（汇总状态）

**具体指令**：
1. 在 Supabase SQL Editor 中创建 `user_progress` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, FK → auth.users, not null)
   - `question_id` (UUID, FK → questions, not null)
   - `user_answer` (text, 用户最后一次的答案 A/B/C/D)
   - `is_correct` (boolean, 最后一次是否正确)
   - `attempt_count` (integer, default 1, 做过的总次数)
   - `consecutive_correct_count` (integer, default 0, 连续答对次数 - **新增**)
   - `status` (text, enum: 'normal', 'wrong_book', 'mastered')
   - `last_attempt_at` (timestamp)
   - `created_at` (timestamp, default now())
2. 添加唯一索引：(user_id, question_id) 的组合（确保每题一条记录）
3. 启用 Row Level Security，设置策略：用户只能查看自己的记录
4. ⚠️ **重要设计决策**：
   - **所有做过的题都要记录**，无论对错（参考 `design-decisions.md` 第 2.1 节）
   - `consecutive_correct_count` 用于追踪连续答对次数，达到 3 次时自动标记为已掌握
   - 详见 `design-decisions.md` 第 2.1-2.3 节了解完整逻辑

**验证测试**：
- [ ] `user_progress` 表已创建
- [ ] 所有列都存在，特别是 `consecutive_correct_count`
- [ ] RLS 已启用，用户只能看到自己的记录
- [ ] 组合索引已创建

---

### 步骤 1.8b：创建 Supabase 数据库表 - question_attempts（作答历史表）
**目标**：在 Supabase 中创建作答历史表，保留完整的学习轨迹

**具体指令**：
1. 在 Supabase SQL Editor 中创建 `question_attempts` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, FK → auth.users, not null)
   - `question_id` (UUID, FK → questions, not null)
   - `user_answer` (text, 用户本次的答案 A/B/C/D)
   - `is_correct` (boolean, 本次是否正确)
   - `pomodoro_session_id` (UUID, FK → focus_sessions, nullable - 关联番茄钟)
   - `created_at` (timestamp, default now())
2. 添加索引：(user_id, question_id, created_at) 复合索引，用于快速查询某用户的某题的历史
3. 启用 Row Level Security，设置策略：用户只能查看自己的记录
4. ⚠️ **设计说明**：
   - 与 `user_progress` 形成双表设计（详见 `design-decisions.md` 第 2.2 节）
   - 每次做题都插入新记录，保留完整历史
   - 用于分析用户学习轨迹、番茄统计等

**验证测试**：
- [ ] `question_attempts` 表已创建
- [ ] 所有列都存在
- [ ] 复合索引已创建
- [ ] RLS 已启用

---

### 步骤 1.9：创建 Supabase 数据库表 - bookmarks（书签表）
**目标**：在 Supabase 中创建用户书签表

**具体指令**：
1. 在 Supabase SQL Editor 中创建 `bookmarks` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, FK → auth.users, not null)
   - `question_id` (UUID, FK → questions, not null)
   - `created_at` (timestamp, default now())
2. 添加唯一约束：(user_id, question_id) 组合唯一（防止重复书签）
3. 启用 Row Level Security，设置策略：用户只能查看自己的书签

**验证测试**：
- [ ] `bookmarks` 表已创建
- [ ] 唯一约束已添加
- [ ] RLS 已启用

---

### 步骤 1.9b：创建 Supabase 数据库表 - focus_sessions（番茄钟会话表）
**目标**：在 Supabase 中创建番茄钟会话表，用于精确追踪学习数据

**具体指令**：
1. 在 Supabase SQL Editor 中创建 `focus_sessions` 表，字段包括：
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, FK → auth.users, not null)
   - `started_at` (timestamp, 开始时间)
   - `ended_at` (timestamp nullable, 结束时间，未完成时为 null)
   - `duration` (integer, 预计时长，单位秒，如 1500 = 25分钟)
   - `goal_description` (text nullable, 学习目标，如"刷题 20 题")
   - `created_at` (timestamp, default now())
2. 创建索引：(user_id, created_at) 用于查询用户的番茄历史
3. 启用 Row Level Security，设置策略：用户只能查看自己的 session
4. ⚠️ **设计说明**：
   - 与 `question_attempts` 的 `pomodoro_session_id` 关联
   - 番茄结束时，通过查询 question_attempts 统计本次完成的题数和正确数
   - 详见 `design-decisions.md` 第 3.2 节了解完整的 Pomodoro 数据模型

**验证测试**：
- [ ] `focus_sessions` 表已创建
- [ ] 所有列都存在
- [ ] 索引已创建
- [ ] RLS 已启用

---

### 步骤 1.10：设置 Supabase Auth 认证方式
**目标**：在 Supabase 中启用邮箱和 GitHub OAuth 登录

**具体指令**：
1. 在 Supabase 项目的 Authentication → Providers 部分
2. 启用 "Email" 提供商（默认已启用）
3. 启用 "GitHub" OAuth：
   - 访问 https://github.com/settings/apps/new
   - 填写信息：
     - Application name: `fe-quiz-platform-dev`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `https://[your-supabase-project].supabase.co/auth/v1/callback`
   - 获得 Client ID 和 Client Secret
   - 将这两个值粘贴回 Supabase 的 GitHub provider 配置
4. 保存配置

**验证测试**：
- [ ] Email 提供商状态为 "Enabled"
- [ ] GitHub 提供商状态为 "Enabled"
- [ ] 可在 Supabase 项目的 Auth Users 部分测试登录流程

---

## 阶段 2：核心题库与做题流程 (4-5 天)

### 步骤 2.1：创建 Supabase 客户端初始化文件
**目标**：在 Next.js 项目中创建可复用的 Supabase 客户端

**具体指令**：
1. 在 `lib/` 目录中创建 `supabase.ts` 文件
2. 在该文件中初始化 Supabase 客户端，使用环境变量
3. 导出客户端实例，以供其他模块导入使用
4. 文件应包含注释说明这是一个单例模式的客户端

**验证测试**：
- [ ] `lib/supabase.ts` 文件存在
- [ ] 运行 `npm run dev` 没有导入错误
- [ ] 该文件可以被其他文件成功导入

---

### 步骤 2.2：创建全局 TypeScript 类型定义文件
**目标**：定义整个应用的数据类型，确保类型安全

**具体指令**：
1. 在 `lib/` 目录中创建 `types.ts` 文件
2. 定义以下 TypeScript 类型：
   - `Profile` (用户信息)
   - `Question` (题目)
   - `UserProgress` (做题记录)
   - `Bookmark` (书签)
   - 每个类型应包含对应表中的所有字段，使用正确的类型注解（string, number, boolean, Date 等）
3. 为枚举值（如题目难度、做题状态）创建 union types

**验证测试**：
- [ ] `lib/types.ts` 文件存在且编译无错误
- [ ] 所有类型都能被正确导入
- [ ] TypeScript 类型检查通过（运行 `npx tsc --noEmit`）

---

### 步骤 2.3：导入示例题目数据到 Supabase
**目标**：将测试题目数据导入数据库

**具体指令**：
1. 准备一个包含至少 20 道题目的 JSON 或 CSV 文件（每道题包含年份、类别、题干、四个选项、正确答案、解析、难度）
2. 在 Supabase Dashboard 的 Table Editor 中，选择 `questions` 表
3. 点击 "Insert" 并使用 "Import from CSV" 或逐条插入题目
4. 确保导入的题目覆盖至少 2 个不同的年份和 3 个不同的类别

**验证测试**：
- [ ] `questions` 表中至少有 20 条记录
- [ ] 每条记录的所有字段都已填充
- [ ] 可以查询到不同年份和类别的题目
  - 示例查询：`SELECT DISTINCT year FROM questions` 返回多个结果
  - 示例查询：`SELECT DISTINCT category FROM questions` 返回至少 3 个结果

---

### 步骤 2.4：创建登录页面路由和组件
**目标**：创建用户登录的页面和 UI

**具体指令**：
1. 在 `app/` 目录中创建 `(auth)` 文件夹（用于分组认证相关路由）
2. 在 `(auth)` 中创建 `login` 文件夹和 `login/page.tsx` 文件
3. 该页面应包含：
   - 页面标题 "登录"
   - 邮箱输入框
   - 密码输入框
   - "邮箱登录" 按钮
   - "GitHub 登录" 按钮
   - 注册链接（指向 `/register`）
4. 使用 shadcn/ui 的 Button 和 Input 组件
5. 页面使用 Tailwind CSS 使其在手机和桌面上看起来美观

**验证测试**：
- [ ] 访问 `localhost:3000/login` 能正常加载页面
- [ ] 页面包含所有指定的输入框和按钮
- [ ] 页面在手机 (375px) 和桌面 (1200px) 视口中都能正常显示
- [ ] 按钮有悬停效果

---

### 步骤 2.5：实现邮箱登录功能
**目标**：连接登录页面与 Supabase Auth，实现邮箱登录

**具体指令**：
1. 在登录页面中添加表单处理逻辑
2. 点击"邮箱登录"按钮时：
   - 获取用户输入的邮箱和密码
   - 调用 Supabase 的 `signInWithPassword()` 方法
   - 登录成功 → 重定向到 `/dashboard`
   - 登录失败 → 显示错误提示信息（例如"邮箱或密码错误"）
3. 处理加载状态（按钮在登录中时应禁用）

**验证测试**：
- [ ] 可以在 Supabase Auth Users 部分创建测试用户
- [ ] 在登录页输入正确的邮箱和密码，点击"邮箱登录"
- [ ] 登录成功后重定向到 `/dashboard`（即使该页面还没实现，也会看到 404，但 URL 改变）
- [ ] 输入错误密码，显示错误提示
- [ ] 登录中时按钮为禁用状态

---

### 步骤 2.6：实现 GitHub OAuth 登录功能
**目标**：连接登录页面与 GitHub OAuth

**具体指令**：
1. 在登录页面中添加 GitHub 登录按钮的点击处理
2. 点击"GitHub 登录"按钮时：
   - 调用 Supabase 的 `signInWithOAuth()` 方法，provider 为 'github'
   - 重定向到 GitHub 的授权页面
   - 用户授权后，自动返回应用并登录
3. 处理登录状态和错误提示

**验证测试**：
- [ ] 点击"GitHub 登录"按钮，能重定向到 GitHub 授权页面
- [ ] 授权后返回应用，重定向到 `/dashboard`
- [ ] 在 Supabase Auth Users 中能看到新创建的用户

---

### 步骤 2.7：创建注册页面
**目标**：创建用户注册的页面和 UI

**具体指令**：
1. 在 `(auth)` 中创建 `register` 文件夹和 `register/page.tsx` 文件
2. 该页面应包含：
   - 页面标题 "注册"
   - 邮箱输入框
   - 密码输入框
   - 确认密码输入框
   - "注册" 按钮
   - "已有账户？登录" 链接
3. 使用 shadcn/ui 组件和 Tailwind CSS

**验证测试**：
- [ ] 访问 `localhost:3000/register` 能正常加载页面
- [ ] 页面在手机和桌面视口中都能正常显示
- [ ] 有表单验证（密码和确认密码不匹配时提示）

---

### 步骤 2.8：实现注册功能
**目标**：实现用户注册逻辑

**具体指令**：
1. 在注册页面中添加表单处理逻辑
2. 点击"注册"按钮时：
   - 验证邮箱格式有效
   - 验证密码长度 ≥ 6 位
   - 验证两次密码输入一致
   - 调用 Supabase 的 `signUp()` 方法
   - 注册成功 → 显示提示"注册成功，请检查邮箱验证" 或直接登录
   - 注册失败 → 显示错误提示（例如"邮箱已被使用"）
3. 在 `profiles` 表中为新用户创建一条记录

**验证测试**：
- [ ] 使用新邮箱注册，注册成功
- [ ] 新用户在 Supabase Auth Users 中出现
- [ ] 新用户在 `profiles` 表中出现，初始 level=1, xp=0
- [ ] 使用已注册的邮箱再次注册，显示错误提示

---

### 步骤 2.9：创建仪表板基础页面（Dashboard）
**目标**：创建登录后的主页面框架

**具体指令**：
1. 在 `app/` 目录中创建 `(dashboard)` 文件夹（分组受保护的路由）
2. 在 `(dashboard)` 中创建 `layout.tsx`（仪表板布局）
3. `layout.tsx` 应包含：
   - 顶部导航栏，显示用户名和"登出"按钮
   - 侧边栏菜单，包含链接：
     - 仪表板首页
     - 刷题
     - 错题本
     - 数据统计
   - 主内容区域（使用 children 占位符）
4. 创建 `dashboard/page.tsx`，简单显示欢迎信息和用户等级、XP
5. 添加保护逻辑：如果用户未登录，重定向到登录页

**验证测试**：
- [ ] 访问 `localhost:3000/dashboard`，如果未登录则重定向到 `/login`
- [ ] 登录后访问 `/dashboard`，能看到欢迎页面、用户信息、侧边栏菜单
- [ ] 导航栏中显示的用户名与登录用户一致
- [ ] "登出"按钮点击后，用户会话被清除，重定向到登录页

---

### 步骤 2.10：创建题目浏览页面（Questions Browse）
**目标**：创建用户查看和选择题目的页面

**具体指令**：
1. 在 `(dashboard)` 中创建 `questions` 文件夹和 `questions/page.tsx`
2. 该页面应显示：
   - 筛选条件（下拉菜单或按钮组）：
     - 年份选择（从数据库中动态获取）
     - 类别选择（从数据库中动态获取）
     - 难度选择（简单/普通/困难）
   - 根据筛选条件显示题目列表：
     - 每道题显示：题号、年份、类别、难度
     - 用户已做过的题目显示绿色勾（如果在 `user_progress` 中存在记录）
3. 使用 shadcn/ui 的 Button、Select、Card 等组件

**验证测试**：
- [ ] 访问 `/dashboard/questions` 能正常加载页面
- [ ] 页面从数据库动态加载年份和类别选项
- [ ] 修改筛选条件后，题目列表更新（刷新页面或使用客户端状态管理）
- [ ] 已做过的题目显示不同的视觉标记

---

### 步骤 2.11：创建做题页面（Question Detail）
**目标**：创建单题做题的核心页面

**具体指令**：
1. 在 `(dashboard)` 中创建 `[year]` 动态文件夹和 `[year]/[questionId]/page.tsx`
2. 该页面应显示：
   - 题目信息：年份、类别、题号
   - 题干内容
   - 四个选项（A、B、C、D），每个选项可点击
   - 用户尚未选择答案时，显示"选择答案"的提示
3. 点击选项后：
   - 锁定该选项为已选择（高亮显示）
   - 显示一个"提交答案"按钮
   - "提交答案"按钮被点击后，显示结果（对或错）和正确答案

**验证测试**：
- [ ] 访问 `localhost:3000/dashboard/2023_Spring/[某个题目ID]` 能正常加载题目
- [ ] 题干和选项都正确显示
- [ ] 点击选项后，该选项被高亮
- [ ] 点击"提交答案"按钮后，显示正确/错误结果

---

### 步骤 2.12：实现答案提交逻辑
**目标**：处理用户提交答案，保存到数据库，支持历史追踪和连续答对统计

**具体指令**：
1. 当用户点击"提交答案"按钮时：
   - 获取用户的答案
   - 与正确答案比较，判断是否正确
   - 调用 `/api/answers` API 端点，发送：
     - question_id
     - user_answer
     - pomodoro_session_id（如果在番茄钟中）
   - API 执行以下逻辑：
     - **第 1 步**：在 `question_attempts` 表中插入新记录（保留历史）
     - **第 2 步**：在 `user_progress` 表中更新或插入：
       - 如果记录不存在 → 创建新记录
       - 如果记录存在 → 更新 `attempt_count`、`last_attempt_at`、`is_correct`、`consecutive_correct_count`
     - **第 3 步**：根据答题结果更新 `status`：
       - 答对 → `consecutive_correct_count += 1`
       - 答错 → `consecutive_correct_count = 0`，且如果 `status != 'mastered'` 则设为 'wrong_book'
     - **第 4 步**：检查连续答对是否达到 3 次，如果是且 `status == 'wrong_book'` → 变为 'mastered'
     - **第 5 步**：更新 profiles 表的 xp（答对 +10XP）
   - API 返回保存成功的确认，含本次 XP 获得数
2. 前端显示结果（对/错）和解析
3. 显示"下一题"或"返回题目列表"的按钮
4. ⚠️ **关键设计参考**：
   - 详见 `design-decisions.md` 第 2.1-2.3 节了解双表设计和连续答对追踪

**验证测试**：
- [ ] 提交正确答案后：
  - `question_attempts` 中创建新历史记录，`is_correct = true`
  - `user_progress` 中该题的 `consecutive_correct_count` 增加 1
  - `profiles.xp` 增加 10
- [ ] 提交错误答案后：
  - `question_attempts` 中创建新历史记录，`is_correct = false`
  - `user_progress` 中该题的 `consecutive_correct_count` 重置为 0
  - 如果之前不是 'mastered'，`status` 变为 'wrong_book'
- [ ] 对同一错题连续答对 3 次后，`status` 自动变为 'mastered'
- [ ] 前端显示的结果与数据库记录一致

---

## 阶段 3：错题本与进度记录 (3-4 天)

### 步骤 3.1：创建 API 端点 - 获取错题列表
**目标**：创建 API 端点，供前端查询用户的错题本

**具体指令**：
1. 在 `app/api` 目录中创建 `wrong-questions` 文件夹和 `route.ts` 文件
2. 该 API 端点应：
   - 接收 GET 请求
   - 从请求中获取当前用户 ID（通过 Supabase Auth）
   - 查询 `user_progress` 表，条件：
     - `user_id` = 当前用户
     - `status` = 'wrong_book'
   - 联表查询，获取完整的题目信息（使用 `select('*, questions(...)')`）
   - 按 `last_attempt_at` 降序排列（最近错的在前）
   - 返回 JSON 格式的错题列表
3. 处理用户未登录的情况，返回 401 错误

**验证测试**：
- [ ] 未登录时调用 API，返回 401 错误
- [ ] 登录用户调用 API，能正确返回错题列表
- [ ] 返回的数据包含题目的完整信息（题干、选项、正确答案等）
- [ ] 数据按 `last_attempt_at` 时间倒序排列

---

### 步骤 3.2：创建错题本页面
**目标**：创建展示用户错题本的页面

**具体指令**：
1. 在 `(dashboard)` 中创建 `wrong-book` 文件夹和 `wrong-book/page.tsx`
2. 该页面应：
   - 显示错题总数
   - 显示错题列表，每条记录包含：
     - 题号、年份、类别
     - 用户答案和正确答案
     - 最后做错的时间
     - "再做一遍"按钮（点击进入做题页面）
   - 如果没有错题，显示"暂无错题"的提示
3. 列表支持排序：按"最近错误"或"错误次数"

**验证测试**：
- [ ] 访问 `/dashboard/wrong-book` 能正常加载
- [ ] 显示的错题数与数据库实际数量一致
- [ ] 每道错题显示了用户答案和正确答案
- [ ] "再做一遍"按钮能跳转到做题页面
- [ ] 没有错题时显示相应提示

---

### 步骤 3.3：实现"标记已掌握"功能
**目标**：允许用户将掌握的错题从错题本中移除

**具体指令**：
1. 在错题本页面和做题结果页面中，为每道错题添加"标记已掌握"按钮
2. 点击该按钮时：
   - 调用 API `/api/mark-mastered`
   - API 接收：question_id、user_id
   - API 更新 `user_progress` 表：
     - 将 `status` 从 'wrong_book' 改为 'mastered'
   - 前端刷新错题本列表，该题目消失
3. 处理错误情况（例如题目不存在）

**验证测试**：
- [ ] 点击"标记已掌握"按钮后，该题目的 `status` 在数据库中变为 'mastered'
- [ ] 错题本页面刷新后，该题目不再显示
- [ ] 错题总数减少 1

---

### 步骤 3.4：创建错题复习模式
**目标**：创建一个专门的做题模式，只从错题本中抽题

**具体指令**：
1. 在 `(dashboard)` 中创建 `wrong-review` 路由
2. 该路由的逻辑：
   - 获取用户的所有 'wrong_book' 状态的题目
   - 按"最近错的且复习次数少"排序
   - 一道一道展示给用户
   - 用户做完后，自动加载下一道错题
3. 提供"暂停复习"按钮，返回错题本列表

**验证测试**：
- [ ] 进入错题复习模式，首先加载的是最近错的题目
- [ ] 完成一道题后，自动加载下一道
- [ ] "暂停复习"按钮能返回错题本列表

---

### 步骤 3.5：创建进度统计页面（基础版）
**目标**：显示用户的做题统计数据

**具体指令**：
1. 在 `(dashboard)` 中创建 `stats` 文件夹和 `stats/page.tsx`
2. 该页面应显示：
   - 总做题数：统计 `user_progress` 表中的记录数
   - 总正确数：统计 `is_correct=true` 的记录数
   - 整体正确率：(正确数 / 总数) × 100%
   - 错题数：统计 `status='wrong_book'` 的记录数
   - 已掌握数：统计 `status='mastered'` 的记录数
   - 各类别的正确率：按 category 分组，计算每个类别的正确率
3. 使用 shadcn/ui 的 Card 组件展示这些数据

**验证测试**：
- [ ] 访问 `/dashboard/stats` 能正常加载
- [ ] 显示的统计数据与数据库查询结果一致
- [ ] 各类别的正确率计算正确
- [ ] 页面在手机和桌面上都能正常显示

---

### 步骤 3.6：创建书签功能 - 添加书签 API
**目标**：实现用户为题目添加书签的功能

**具体指令**：
1. 在 `app/api` 中创建 `bookmarks` 文件夹和 `route.ts` 文件
2. 该 API 应支持 POST 请求：
   - 接收：question_id
   - 在 `bookmarks` 表中创建新记录，关联当前用户和题目
   - 如果记录已存在，不重复插入（由唯一约束保证）
   - 返回成功确认
3. 处理用户未登录、题目不存在等错误情况

**验证测试**：
- [ ] 登录用户调用 API，为题目添加书签，在数据库中创建新记录
- [ ] 为同一题目重复添加书签不会产生重复记录
- [ ] 未登录时调用 API 返回 401 错误

---

### 步骤 3.7：创建书签功能 - 删除书签 API
**目标**：实现用户删除书签的功能

**具体指令**：
1. 在 `/api/bookmarks` 中添加 DELETE 请求处理
2. 该 API 应：
   - 接收：question_id
   - 从 `bookmarks` 表中删除对应的记录（user_id + question_id 组合）
   - 返回成功确认
3. 处理错误情况（例如书签不存在）

**验证测试**：
- [ ] 调用删除书签 API，对应记录在数据库中被删除
- [ ] 删除不存在的书签，返回合理的错误信息

---

### 步骤 3.8：在做题页面添加书签按钮
**目标**：在做题界面中添加收藏功能

**具体指令**：
1. 在做题页面（`[year]/[questionId]/page.tsx`）中添加"加入书签"按钮
2. 按钮逻辑：
   - 检查该题目是否已被用户收藏
   - 如果已收藏，按钮显示"取消书签"，点击删除
   - 如果未收藏，按钮显示"加入书签"，点击添加
3. 点击时调用相应的 API 端点
4. 操作成功后，按钮文本和样式立即更新

**验证测试**：
- [ ] 在做题页面点击"加入书签"，该题目被添加到用户的书签中
- [ ] 刷新页面后，按钮显示"取消书签"（表示已收藏）
- [ ] 点击"取消书签"，书签被删除，按钮变回"加入书签"

---

### 步骤 3.9：创建书签列表页面
**目标**：显示用户所有的书签题目

**具体指令**：
1. 在 `(dashboard)` 中创建 `bookmarks` 文件夹和 `bookmarks/page.tsx`
2. 该页面应：
   - 显示用户所有的书签题目列表
   - 每条记录包含：题号、年份、类别、加入书签的时间
   - 提供筛选选项：按年份、类别筛选
   - 提供排序选项：按添加时间排序
   - 每道题旁边有"移除书签"按钮和"做一遍"按钮
   - 如果没有书签，显示相应提示

**验证测试**：
- [ ] 访问 `/dashboard/bookmarks` 能正常加载
- [ ] 显示的书签题目与数据库中的数据一致
- [ ] 筛选和排序功能正常工作
- [ ] "移除书签"按钮能删除书签
- [ ] "做一遍"按钮能进入做题页面

---

## 阶段 4：番茄钟与基础统计 (2-3 天)

### 步骤 4.1：创建 Zustand 状态管理 - Pomodoro Store
**目标**：创建番茄钟的状态管理

**具体指令**：
1. 在 `store/` 目录中创建 `pomodoroStore.ts` 文件
2. 该文件应定义 Zustand store，包含以下状态：
   - `isRunning`: boolean (计时器是否运行中)
   - `timeLeft`: number (剩余秒数)
   - `totalTime`: number (总时间，单位秒，默认 25*60=1500)
   - `sessionsCompleted`: number (今日已完成的番茄数)
3. 定义以下方法：
   - `start()`: 开始计时
   - `pause()`: 暂停计时
   - `reset()`: 重置计时器
   - `setTotalTime(seconds)`: 自定义番茄时长
   - `decrementTime()`: 每秒减少时间（由计时器调用）
   - `completeSession()`: 标记一个番茄完成
4. 状态应使用 localStorage 持久化（防止页面刷新丢失）

**验证测试**：
- [ ] 创建 Zustand store，能成功导入
- [ ] 能访问 store 的所有状态和方法
- [ ] 调用 `start()` 后 `isRunning` 变为 true
- [ ] 页面刷新后，计时器状态仍然保留

---

### 步骤 4.2：创建 Pomodoro 计时器组件
**目标**：构建番茄钟的 UI 组件

**具体指令**：
1. 在 `components/` 中创建 `Pomodoro.tsx` 文件
2. 该组件应：
   - 显示剩余时间（格式：MM:SS）
   - 显示三个按钮：开始、暂停、重置
   - 显示一个"设置时长"输入框（可输入分钟数）
   - 显示今日已完成的番茄数
   - 显示当前模式的目标（例如"刷题 20 题"）
3. 使用 shadcn/ui 的 Button 和 Input 组件
4. 利用 Zustand 的状态来控制按钮的启用/禁用

**验证测试**：
- [ ] 组件能正常渲染
- [ ] 显示的时间格式为 MM:SS
- [ ] "开始"按钮能启动计时
- [ ] "暂停"按钮能暂停计时
- [ ] "重置"按钮能重置计时器
- [ ] 可以修改时长并应用

---

### 步骤 4.3：实现实际的倒计时逻辑
**目标**：让番茄钟真正计时

**具体指令**：
1. 在做题页面或 Pomodoro 组件中添加 React useEffect 钩子
2. 每秒检查 Zustand store 中的 `isRunning` 和 `timeLeft`
3. 如果 `isRunning=true` 且 `timeLeft>0`，调用 `decrementTime()` 减少 1 秒
4. 当 `timeLeft=0` 时：
   - 停止计时
   - 调用 `completeSession()` 标记完成
   - 显示完成提示（使用 alert 或自定义提示组件）
5. 整个计时过程不应受页面刷新影响（由 localStorage 保证）

**验证测试**：
- [ ] 启动计时器，观察时间每秒减少 1
- [ ] 计时到 0 后停止，显示完成提示
- [ ] 在计时过程中刷新页面，计时继续进行
- [ ] 计时完成后，`sessionsCompleted` 增加 1

---

### 步骤 4.4：创建 API 端点 - 保存番茄钟记录
**目标**：将完成的番茄钟记录保存到数据库

**具体指令**：
1. 在 `app/api` 中创建 `focus-logs` 文件夹和 `route.ts`
2. 该 API 应接收 POST 请求，包含：
   - duration: 本次番茄的时长（秒）
   - questions_completed: 本次番茄中完成的题目数
   - correct_count: 本次番茄中正确的题目数
3. 在数据库中创建 `focus_logs` 表（如果还没有）：
   - id, user_id, duration, questions_completed, correct_count, created_at
4. API 应：
   - 验证用户身份
   - 插入新记录
   - 计算本次获得的 XP（例如 +25 基础 + 正确题数*5）
   - 更新用户 profile 的 xp 值
   - 返回获得的 XP

**验证测试**：
- [ ] 番茄钟完成后，调用此 API 保存记录
- [ ] 新记录在 `focus_logs` 表中出现
- [ ] 用户的 xp 值正确更新
- [ ] 返回值包含获得的 XP 数量

---

### 步骤 4.5：在仪表板中显示今日概览
**目标**：在首页显示用户的今日活动统计（基于日本时区）

**具体指令**：
1. 在 `dashboard/page.tsx` 中添加以下信息：
   - 用户名和当前等级
   - 当前 XP 和升级进度条
   - 今日做题数（根据日本时间）
   - 今日正确率
   - 今日完成的番茄钟数
   - 当前错题数
2. 这些数据都应从 Supabase 动态加载，查询时使用日本时区转换
3. 使用 shadcn/ui 的 Card 和 Progress 组件进行展示
4. ⚠️ **时区和统计定义参考**：
   - "今日" 定义为日本时间 00:00:00 ～ 23:59:59
   - 详见 `design-decisions.md` 第 4.1-4.2 节了解时区处理和 SQL 查询方式

**验证测试**：
- [ ] 访问 `/dashboard` 能看到用户信息和今日统计
- [ ] 做题后刷新页面，"今日做题数"更新（基于 question_attempts.created_at 日本时间）
- [ ] 完成番茄钟后刷新页面，"今日番茄数"更新
- [ ] 所有数据与数据库一致
- [ ] 凌晨 2 点做的题被正确计入"今天"而不是"昨天"

---

### 步骤 4.6：创建经验值和等级系统
**目标**：实现用户升级的基础逻辑

**具体指令**：
1. 定义经验值规则：
   - 做对一题：+10 XP
   - 完成一个番茄：+25 XP
   - 每 500 XP 升一级
2. 在 `lib/utils.ts` 中创建工具函数：
   - `calculateLevel(xp)`: 根据 XP 计算当前等级
   - `getXpForNextLevel(currentLevel)`: 获得下一级所需的 XP
   - `getProgressToNextLevel(currentXp, currentLevel)`: 获取升级进度百分比
3. 每当用户的 XP 更新时（做题或完成番茄），重新计算等级

**验证测试**：
- [ ] 做对题目，用户 XP 增加 10
- [ ] 完成番茄钟，用户 XP 增加 25
- [ ] 累积 500 XP 后，等级升为 2
- [ ] `calculateLevel(500)` 返回 2，`calculateLevel(499)` 返回 1

---

### 步骤 4.7：实现升级提示动画
**目标**：当用户升级时，显示动画提示

**具体指令**：
1. 在 `components/` 中创建 `LevelUpNotification.tsx` 组件
2. 该组件使用 Framer Motion 实现：
   - 从屏幕下方滑入
   - 显示"升级了！"文字和新等级
   - 持续显示 3 秒后自动消失
3. 在做题或番茄钟完成时，检查用户等级是否提升
4. 如果提升，调用该组件显示提示

**验证测试**：
- [ ] 用户升级时，看到升级动画
- [ ] 动画显示正确的新等级
- [ ] 3 秒后动画自动消失

---

### 步骤 4.8：创建简单的进度可视化
**目标**：用图表显示用户的学习进度

**具体指令**：
1. 在 `stats/page.tsx` 中添加图表显示（使用 Recharts）：
   - 条形图：各知识点的正确率
   - 进度条：本周学习热度（完成多少道题）
2. 数据应从数据库动态加载
3. 使用 shadcn/ui 的 Card 包裹图表

**验证测试**：
- [ ] 访问 `/dashboard/stats` 能看到图表
- [ ] 图表数据与数据库查询结果一致
- [ ] 图表在手机和桌面上都能正常显示

---

### 步骤 4.9：实现国际化支持（i18n）
**目标**：为应用添加多语言支持基础框架

**具体指令**：
1. 安装 `next-i18next` 库
2. 在项目根目录创建 `public/locales/` 目录结构：
   ```
   public/locales/
   ├── zh/
   │   └── common.json
   └── ja/
       └── common.json
   ```
3. 在 `zh/common.json` 和 `ja/common.json` 中定义常见的 UI 文本（如"做题"、"登出"、"错题本"等）
4. 在应用中使用 i18n Hook 替换硬编码的文本
5. 暂时只需支持中文和日文，不必实现语言切换功能

**验证测试**：
- [ ] i18n 配置文件存在且格式正确
- [ ] 应用能正确读取翻译文本
- [ ] 在中文和日文之间切换时，文本正确更新

---

### 步骤 4.10：性能优化 - 图片和代码分割
**目标**：优化应用的加载速度

**具体指令**：
1. 使用 Next.js 的 `Image` 组件替换 HTML `<img>` 标签（如果有图片）
2. 为路由添加动态导入，减少初始加载的 JavaScript：
   - `dashboard/stats` 中的图表组件应使用 dynamic import
   - 错题本页面应使用动态导入
3. 在 `next.config.js` 中添加配置以启用更好的代码分割

**验证测试**：
- [ ] 使用 Chrome DevTools 的 Network 标签检查初始页面加载大小
- [ ] 加载时间应 ≤ 2 秒
- [ ] 在不同网络条件下（3G 模拟）测试，确保体验可接受

---

## 验证与测试总结

### 整体验收标准

完成上述所有步骤后，应满足：

1. **用户认证流程**
   - [ ] 用户能通过邮箱注册和登录
   - [ ] 用户能通过 GitHub OAuth 登录
   - [ ] 用户登出后会话清除

2. **题库与做题**
   - [ ] 用户能浏览题目（按年份、类别、难度筛选）
   - [ ] 用户能做题并提交答案
   - [ ] 答题结果保存到数据库且正确

3. **错题本**
   - [ ] 答错的题自动进入错题本
   - [ ] 用户能查看错题本中的所有题目
   - [ ] 用户能标记题目为"已掌握"并从错题本中移除
   - [ ] 用户能进入错题复习模式

4. **书签功能**
   - [ ] 用户能为题目添加书签
   - [ ] 用户能查看所有书签题目
   - [ ] 用户能删除书签

5. **番茄钟与统计**
   - [ ] 用户能启动和暂停计时器
   - [ ] 计时完成后自动停止并保存记录
   - [ ] 用户能在仪表板看到今日统计
   - [ ] 用户能查看统计数据页面（正确率、错题数等）

6. **游戏化（基础）**
   - [ ] 用户做题和完成番茄钟能获得 XP
   - [ ] 累积足够 XP 后升级
   - [ ] 升级时显示动画提示

7. **性能与适配**
   - [ ] 首页加载时间 ≤ 2 秒
   - [ ] 题目切换流畅
   - [ ] 在手机 (375px)、平板 (768px)、桌面 (1200px) 视口都能正常显示

8. **数据安全**
   - [ ] 用户只能看到自己的做题记录、错题本、书签
   - [ ] 未登录用户无法访问受保护的页面

---

## 下一步计划（第二阶段 - 增强功能）

当 MVP 完成后，可继续添加：

1. **连续打卡与连胜**
   - 记录用户的每日登陆
   - 连续答对时显示动画反馈

2. **任务系统**
   - 每日任务（做题 ≥ 30 题）
   - 每周任务（完成模拟考试）

3. **高级数据可视化**
   - 错题趋势图
   - 知识点雷达图
   - 周热力图

4. **主题和皮肤**
   - 深色模式
   - 自定义 UI 主题

5. **考试模拟模式**
   - 完整的考试试卷
   - 倒计时和进度条

6. **后台管理**
   - 题库管理界面
   - 数据统计分析

---

## 常见问题与答案

**Q: 如何在开发中测试 Supabase 的 RLS 策略？**
A: 在 Supabase SQL Editor 中可以直接测试查询。创建多个测试用户，分别用不同用户的 session 执行查询，验证 RLS 是否生效。

**Q: 如何处理离线场景？**
A: MVP 版本暂时不处理离线。用户操作需要实时同步到 Supabase。如果需要离线支持，可在第二阶段使用 Service Worker 和本地 IndexedDB。

**Q: 题库数据有多大时如何优化查询？**
A: 当题库超过 10000 道题时，建议：
- 在 Supabase 中为 `year`、`category` 列创建索引（已在步骤 1.7 中完成）
- 在前端使用分页加载（每页 50 题）
- 使用 Supabase 的缓存策略

**Q: 如何防止用户刷题作弊？**
A: MVP 版本暂时不检测。可在第二阶段添加：
- 检查答题速度（例如 5 秒内不能作答多题）
- 检查用户是否频繁更改答案
- 添加时间戳和答题序列的验证

---

