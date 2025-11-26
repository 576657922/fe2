# FE 刷题平台 - 设计决策与澄清 (Design Decisions & Clarifications)

本文档记录了在 implementation-plan.md 实施过程中的所有关键设计决策，确保开发时 100% 清晰。

---

## 1. 数据库 RLS（Row Level Security）策略

### 1.1 `profiles` 表的 RLS 策略

**场景**：需要支持排行榜、用户查看其他人的公开等级等功能

**设计决策**：

```sql
-- 允许所有人读取所有用户的公开信息
CREATE POLICY "Allow public read" ON profiles
  FOR SELECT
  USING (true);

-- 只允许用户更新自己的信息
CREATE POLICY "Allow self update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 只允许用户删除自己的账户
CREATE POLICY "Allow self delete" ON profiles
  FOR DELETE
  USING (auth.uid() = id);
```

**说明**：
- 公开字段（username, level, xp）可被跨用户读取
- 用户只能修改自己的信息
- 前端可以安全地查询排行榜数据

---

### 1.2 `user_progress` 表的 RLS 策略

**场景**：做题记录是完全私有的，不同用户互相不可见

**设计决策**：

```sql
-- 只允许用户查看自己的做题记录
CREATE POLICY "Allow self read" ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只允许用户插入自己的记录
CREATE POLICY "Allow self insert" ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 只允许用户更新自己的记录
CREATE POLICY "Allow self update" ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 不允许用户删除记录（保留完整历史）
-- 无 DELETE 策略
```

**说明**：
- 完全私有，任何跨用户查询都会返回空
- 不允许前端直接查询跨用户数据
- 全站统计（如"有 1000 人参加"）应在服务端或数据库触发器中计算

---

### 1.3 `bookmarks` 表的 RLS 策略

**场景**：书签也是完全私有的

**设计决策**：

```sql
-- 只允许用户查看自己的书签
CREATE POLICY "Allow self read" ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- 只允许用户插入自己的书签
CREATE POLICY "Allow self insert" ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 只允许用户删除自己的书签
CREATE POLICY "Allow self delete" ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);
```

**说明**：
- 与 `user_progress` 的 RLS 逻辑相同
- 完全私有，不涉及跨用户数据

---

### 1.4 `questions` 表的 RLS 策略

**场景**：题库是公开的，所有用户可以浏览所有题目

**设计决策**：

```sql
-- 允许所有人读取题库
CREATE POLICY "Allow public read" ON questions
  FOR SELECT
  USING (true);

-- 不允许前端修改题库（只有管理员通过后台修改）
-- 无 INSERT、UPDATE、DELETE 策略
```

**说明**：
- 无需鉴权，所有人都能查看题目
- 题库修改由后台管理系统负责，不在此 MVP 范围

---

## 2. 做题记录的数据设计

### 2.1 统一规则：所有做过的题都记录

**背景**：初期考虑只记录错题，但这导致统计困难

**设计决策**：

**每做一题，必须在 `user_progress` 表中创建/更新一条记录，无论对错**

**初始状态规则**：
- 第一次做题 → `status = 'normal'`
- 无论对错都存
- 错误的题自动进入"错题本"逻辑是由 `status` 管理的

**优势**：
- 能准确计算"做过的题数"
- 能查询"所有做过的题"
- 便于分析用户学习进度

**示例**：
```
做题 1：答对  → user_progress { is_correct: true, status: 'normal', attempt_count: 1 }
做题 1：答对  → user_progress { is_correct: true, status: 'normal', attempt_count: 2 }（更新记录）
做题 1：答错  → user_progress { is_correct: false, status: 'wrong_book', attempt_count: 3 }（变为错题）
```

---

### 2.2 两表设计：历史 + 汇总

**背景**：需要既保留作答历史，又能高效查询当前状态

**设计决策**：

**创建两张表**：

#### `question_attempts`（作答历史表）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID |
| `question_id` | UUID | 题目 ID |
| `user_answer` | text | 用户的答案（A/B/C/D） |
| `is_correct` | boolean | 是否正确 |
| `pomodoro_session_id` | UUID (可选) | 所属番茄钟 session（用于关联） |
| `created_at` | timestamp | 作答时间 |

**特点**：
- 每次作答都插入一条新记录
- 保留完整历史，便于分析用户学习轨迹
- 可以看出用户什么时候答对、什么时候答错

#### `user_progress`（汇总状态表 - 已有）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID |
| `question_id` | UUID | 题目 ID（复合主键） |
| `user_answer` | text | 最后一次的答案 |
| `is_correct` | boolean | 最后一次是否正确 |
| `attempt_count` | int | 做过的总次数 |
| `consecutive_correct_count` | int | 连续答对次数（新增） |
| `status` | text enum | 'normal' \| 'wrong_book' \| 'mastered' |
| `last_attempt_at` | timestamp | 最后作答时间 |
| `created_at` | timestamp | 首次做题时间 |

**特点**：
- 每题一条记录
- 快速查询某题的当前状态
- 减少数据库查询，提升性能

**更新策略**：
```
每次作答流程：
1. 插入 question_attempts 历史记录
2. 检查 user_progress 中是否已有该题的记录
3. 如果有 → 更新 attempt_count、last_attempt_at、is_correct、consecutive_correct_count
4. 如果没有 → 插入新记录
5. 根据 status 和 consecutive_correct_count 决定是否变更 status
```

---

### 2.3 连续答对次数的追踪

**场景**：设计要求"连续答对 2~3 次后可标记为已掌握"

**设计决策**：

**在 `user_progress` 表中添加 `consecutive_correct_count` 字段**

**规则**：
- 答对一题 → `consecutive_correct_count += 1`
- 答错一题 → `consecutive_correct_count = 0`
- 当 `consecutive_correct_count >= 3` 且 `status == 'wrong_book'` → 自动变更 `status = 'mastered'`

**实现位置**：
- 应在 API 路由 `/api/answers` 中逐次检查和更新
- **不建议在前端计算**，因为：
  - 用户可能刷新页面、换设备
  - 数据不准确，难以维护
  - 后端才是可信的来源

**示例**：
```
错题本中某题（status = wrong_book）：
1. 第一次答对  → consecutive_correct_count = 1
2. 第二次答对  → consecutive_correct_count = 2
3. 第三次答对  → consecutive_correct_count = 3 → status 变为 mastered
4. 若之后答错  → consecutive_correct_count = 0（重置）→ status 变回 wrong_book
```

---

## 3. 番茄钟与做题的关联

### 3.1 `questions_completed` 的定义

**场景**：番茄钟完成时，需要记录"本次完成的题目数"

**设计决策**：

**`questions_completed` = 在该番茄时间段内成功提交答案的题目数量**

**关键规则**：
- 只计算**有效提交**（调用 `/api/answers` 的题目）
- 跳过、返回、浏览不计数
- 多标签页、刷新页面不影响（因为是 API 调用计数）
- 即使答错也计数（因为做过了）

**实现方式**：

#### 选项 A：前端维护计数器（简单）
```
在 Zustand pomodoro store 中：
  questionsCompleted: 0

每次调用 /api/answers 时：
  questionsCompleted += 1

番茄结束时发送给后端：
  /api/focus-logs { duration, questions_completed, correct_count }
```

**优点**：简单快速
**缺点**：前端计数可能不准（网络问题、刷新）

#### 选项 B：后端统计（推荐）
```
番茄结束时，API /api/focus-logs 接收：
  pomodoro_session_id, duration, correct_count

后端查询：
  SELECT COUNT(*) FROM question_attempts
  WHERE user_id = current_user
  AND pomodoro_session_id = ?
  AND created_at BETWEEN pomodo_start AND pomodo_end

自动计算 questions_completed
```

**优点**：准确、无法作弊
**缺点**：需要 pomodoro_session_id 的精心设计

**建议**：**使用选项 B（后端统计）**

---

### 3.2 Pomodoro Session 的数据模型

**新增表**：`focus_sessions`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键，番茄 session ID |
| `user_id` | UUID | 用户 ID |
| `started_at` | timestamp | 开始时间 |
| `ended_at` | timestamp | 结束时间（可选，未完成时为 null） |
| `duration` | int | 预计时长（秒） |
| `goal_description` | text | 学习目标（如"刷题 20 题"） |
| `created_at` | timestamp | 创建时间 |

**说明**：
- 用户点击"开始番茄"时创建 session
- 每次做题时，问卷在 `question_attempts` 中记录 `pomodoro_session_id`
- 番茄结束时，计算 session 内的 questions_completed、correct_count

---

## 4. 每日统计的时区与定义

### 4.1 时区标准

**设计决策**：

**使用日本时区（Asia/Tokyo）作为全站标准**

**理由**：
- 用户主要在日本或面向日本 FE 考试
- 考试和学习习惯以日本时间为准

**实现**：
- Supabase 数据库时间戳都用 UTC 存储（Postgres 标准做法）
- 后端查询时统一转换为日本时区
- 前端展示时按日本时区格式化

### 4.2 "今日"的定义

**设计决策**：

**"今日" = 当天 00:00:00 ～ 23:59:59（日本时间）**

**计算方式**：
```
-- 以 attempt 的 created_at 为准
SELECT COUNT(*) as today_attempts
FROM question_attempts
WHERE user_id = current_user
AND created_at::date = NOW() AT TIME ZONE 'Asia/Tokyo'
```

**示例**：
- 凌晨 02:00 的复习 → 算"今天"
- 晚上 23:45 的最后一题 → 算"今天"
- 超过 23:59:59 → 算"明天"

---

## 5. RLS 与 API 鉴权的权责划分

### 5.1 设计哲学

**两层防护模型**：

| 层级 | 技术 | 职责 | 示例 |
|------|------|------|------|
| **应用层** | API 路由鉴权 | 友好的错误提示、业务逻辑检查、流程控制 | "用户未登录 → 返回 401" |
| **数据库层** | RLS 策略 | 最终安全底线，防止绕过、SQL 注入等 | 即使 API 有 bug，RLS 也会保护数据 |

**它们不是冗余，而是互补**

### 5.2 具体实现

**API 路由示例**（以 `/api/wrong-questions` 为例）：

```
1. 检查用户是否登录
   - 调用 supabase.auth.getSession()
   - 如果无 session → 返回 401

2. 从数据库查询
   - 调用 supabase.from('user_progress').select(...)
   - 由于 RLS，自动过滤为当前用户的数据

3. 返回结果
   - 如果查询成功但为空 → 返回 200 + []（表示"无错题"）
   - 如果查询失败 → 返回 500
```

**好处**：
- API 鉴权快速 fail，减少数据库查询
- RLS 作为最后防线，即使 API 漏掉检查也能保护用户数据

---

## 6. 页面未登录时的保护策略

### 6.1 分层保护

**保护优先级**：

1. **服务端保护（最强）**
   - 在 Layout 或 Page Server Component 中检查 session
   - 若无 session → 直接重定向到 `/login`
   - 用户永远看不到受保护的内容
   - 示例：`(dashboard)/layout.tsx`

2. **Client-side 保护（辅助）**
   - 自定义 `useAuth()` Hook 检查认证状态
   - 用途：控制 UI 渲染、显示加载状态
   - 不负责安全防护，只是用户体验

3. **Middleware（可选，后期优化）**
   - Next.js 13.1+ 支持 Middleware
   - 可集中管理路由保护规则
   - MVP 阶段不需要，开发时先用方案 1

### 6.2 实现建议

**第一阶段（MVP）**：

在 `(dashboard)/layout.tsx` 的 Server Component 中：
```
1. 调用 supabase.auth.getSession()
2. 如果无 session → 重定向到 /login
3. 如果有 session → 渲染 children
```

**理由**：
- 简单直接
- 无需额外配置
- Server Component 天然支持 redirect

---

## 7. 题目筛选的技术方案

### 7.1 首次加载 vs 交互筛选

**设计决策**：

| 阶段 | 技术方案 | 理由 |
|------|---------|------|
| **首次访问** | Server Component | 更快的首屏加载、更好的 SEO |
| **用户筛选** | Client 组件 + API 调用 | 更流畅的 UX、无需整页刷新 |

**实现流程**：

```
1. 访问 /dashboard/questions
   ↓
2. Server Component 获取：
   - questions 表中的所有 year 值（用于筛选下拉菜单）
   - questions 表中的所有 category 值
   - 初始的 20 道题目（第一页）
   ↓
3. 前端渲染，用户可交互：
   - 选择年份、类别、难度
   ↓
4. 点击"筛选"按钮：
   - 调用 /api/questions?year=...&category=...
   - 返回筛选结果
   - 前端无刷新更新列表
```

**好处**：
- 首屏快速加载（SEO、Core Web Vitals 优化）
- 用户交互顺滑
- 避免每次筛选都重新渲染整个页面

---

## 8. 国际化（i18n）的范围和优先级

### 8.1 第一阶段范围

**优先级分类**：

| 优先级 | 内容 | 处理方式 |
|--------|------|---------|
| **P0（必须）** | UI 按钮、菜单、导航 | 中英/中日双语翻译 |
| **P0** | 错误提示、确认对话框 | 中英/中日双语翻译 |
| **P1（可以先不做）** | 题目题干 | 保留原始日文 |
| **P1** | 题目解析 | 可中文为主，日文后补 |
| **P2（未来）** | 文档、帮助内容 | 后期扩展 |

### 8.2 实现方案

**第一阶段建议**：

1. 不需要语言切换入口（即不做"选择中文/日文"的 UI）
2. 使用服务器环境变量或用户偏好设置默认语言
3. 使用 `next-i18next` 或 `next-intl`：
   ```
   public/locales/
   ├── zh/
   │   └── common.json    # 中文翻译
   └── ja/
       └── common.json    # 日文翻译
   ```

4. UI 文本统一从 i18n 文件读取
5. 题目内容保留数据库原始格式（不做国际化处理）

**未来可扩展**：
- 添加用户偏好设置页面
- 支持多语言选择
- 根据浏览器语言自动检测

---

## 9. 小结：所有决策汇总

| 问题 | 决策 | 优势 | 实现位置 |
|------|------|------|---------|
| 1. RLS 策略 | 分表分策略，profiles 公开，其他私有 | 支持排行榜同时保护隐私 | Supabase SQL |
| 2. 做题记录 | 所有题都记录（对和错都进） | 便于统计、分析 | user_progress |
| 3. 多次作答 | 双表设计：历史 + 汇总 | 既保留详细记录又高效查询 | question_attempts + user_progress |
| 4. 连续答对 | 在 user_progress 中字段追踪 | 准确、可靠 | Backend API |
| 5. 番茄关联 | 后端统计（option B） | 无法作弊、数据准确 | /api/focus-logs |
| 6. 时区 | 日本时区（Asia/Tokyo） | 符合用户习惯 | PostgreSQL `AT TIME ZONE` |
| 7. RLS + API | 两层保护，互补不冗余 | 安全性和可维护性并重 | 整个系统架构 |
| 8. 页面保护 | Server Component 中检查 session | 最简单最安全 | (dashboard)/layout.tsx |
| 9. 筛选方案 | Server 首屏 + Client 交互 | 快速加载 + 顺滑体验 | /dashboard/questions |
| 10. i18n | UI 双语，题目保留日文 | 快速上线，便于未来扩展 | public/locales + 数据库 |

---

## 后续操作

1. **在 implementation-plan.md 中补充这些决策**
   - 特别是步骤 1.6-1.9（数据库设计）
   - 步骤 2.12、3.1-3.5（做题和统计逻辑）
   - 步骤 4.4-4.5（番茄和时区）

2. **创建 Supabase SQL 初始化脚本**
   - 根据这些 RLS 策略生成完整的 SQL

3. **更新 architecture.md 的"数据库表设计"部分**
   - 加入 question_attempts 表
   - 补充 focus_sessions 表

4. **更新 progress.md**
   - 为相关步骤添加"设计决策依据"备注

---
