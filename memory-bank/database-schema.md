# FE 刷题平台 - 数据库完整 Schema (Database Schema Reference)

本文档详细列出所有数据库表的完整定义，作为 implementation-plan.md 的补充参考。

---

## 表列表总览

| 表名 | 用途 | 行数预估 | RLS |
|------|------|---------|-----|
| `auth.users` | Supabase 自动管理，用户身份 | 未知 | ✓ |
| `profiles` | 用户信息和游戏化数据 | N（用户数） | ✓ |
| `questions` | 题库 | 10K+ | ✗ |
| `question_attempts` | 作答历史（每次作答一条） | N × 做题数（可能很多） | ✓ |
| `user_progress` | 做题状态汇总（每题一条） | N × M（N=用户，M=做过的题数） | ✓ |
| `bookmarks` | 用户收藏的题目 | 较少 | ✓ |
| `focus_sessions` | 番茄钟会话记录 | N × 番茄数 | ✓ |

---

## 详细表结构

### 1. `profiles` - 用户信息表

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_profiles_level ON profiles(level DESC);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（支持排行榜）
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

---

### 2. `questions` - 题库表

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,  -- e.g., "2023_Spring", "2023_Fall"
  session TEXT NOT NULL,  -- "AM" or "PM"
  category TEXT NOT NULL,  -- e.g., "Security", "Database", "Network"
  question_number INTEGER NOT NULL,  -- 1-80
  content TEXT NOT NULL,  -- 题干内容
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,  -- 解析
  difficulty TEXT NOT NULL DEFAULT 'normal'
    CHECK (difficulty IN ('easy', 'normal', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 唯一约束确保同一题不重复
  UNIQUE(year, session, question_number)
);

-- 索引
CREATE INDEX idx_questions_year ON questions(year);
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_year_category ON questions(year, category);

-- 无 RLS（所有人可见）
```

---

### 3. `question_attempts` - 作答历史表

```sql
CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  pomodoro_session_id UUID REFERENCES focus_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引（用于各种查询）
CREATE INDEX idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX idx_question_attempts_user_question ON question_attempts(user_id, question_id, created_at DESC);
CREATE INDEX idx_question_attempts_pomodoro ON question_attempts(pomodoro_session_id);
CREATE INDEX idx_question_attempts_created_at ON question_attempts(created_at DESC);

-- RLS 策略
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self read" ON question_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow self insert" ON question_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow self update" ON question_attempts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 不允许删除（保留完整历史）
```

---

### 4. `user_progress` - 做题状态汇总表

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT CHECK (user_answer IS NULL OR user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  attempt_count INTEGER DEFAULT 1 CHECK (attempt_count > 0),
  consecutive_correct_count INTEGER DEFAULT 0 CHECK (consecutive_correct_count >= 0),
  status TEXT DEFAULT 'normal' CHECK (status IN ('normal', 'wrong_book', 'mastered')),
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 唯一约束：每个用户每道题只有一条记录
  UNIQUE(user_id, question_id)
);

-- 索引
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(user_id, status);
CREATE INDEX idx_user_progress_last_attempt ON user_progress(user_id, last_attempt_at DESC);

-- RLS 策略
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self read" ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow self insert" ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow self update" ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 不允许删除（保留完整记录）
```

---

### 5. `bookmarks` - 书签表

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 唯一约束：防止重复书签
  UNIQUE(user_id, question_id)
);

-- 索引
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(user_id, created_at DESC);

-- RLS 策略
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self read" ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow self insert" ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow self delete" ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 6. `focus_sessions` - 番茄钟会话表

```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER NOT NULL CHECK (duration > 0),  -- 秒数
  goal_description TEXT,  -- e.g., "刷题 20 题"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX idx_focus_sessions_created_at ON focus_sessions(user_id, created_at DESC);

-- RLS 策略
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow self read" ON focus_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow self insert" ON focus_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow self update" ON focus_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 关键业务查询示例

### 获取用户的错题本

```sql
SELECT
  up.question_id,
  q.year,
  q.session,
  q.question_number,
  q.category,
  q.content,
  up.user_answer,
  q.correct_answer,
  up.attempt_count,
  up.last_attempt_at
FROM user_progress up
JOIN questions q ON up.question_id = q.id
WHERE up.user_id = 'current_user_id'
  AND up.status = 'wrong_book'
ORDER BY up.last_attempt_at DESC;
```

### 获取今日做题统计

```sql
SELECT
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(100.0 * SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_rate
FROM question_attempts
WHERE user_id = 'current_user_id'
  AND created_at::date = (NOW() AT TIME ZONE 'Asia/Tokyo')::date;
```

### 获取某个番茄钟的统计

```sql
SELECT
  COUNT(*) as questions_completed,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count
FROM question_attempts
WHERE user_id = 'current_user_id'
  AND pomodoro_session_id = 'session_id';
```

### 获取用户的排行榜排名

```sql
SELECT
  ROW_NUMBER() OVER (ORDER BY level DESC, xp DESC) as rank,
  p.username,
  p.level,
  p.xp
FROM profiles p
ORDER BY p.level DESC, p.xp DESC
LIMIT 100;
```

---

## 数据量估计与优化建议

| 场景 | 数据量 | 性能影响 | 优化策略 |
|------|--------|---------|---------|
| 题库 (questions) | 10K-50K | 低 | 现有索引足够 |
| 作答历史 (question_attempts) | 高（每做一题一条） | **中**（快速增长） | 定期归档、分区 |
| 做题状态 (user_progress) | 中（N×M） | 低（每用户每题一条） | 现有索引足够 |
| 书签 (bookmarks) | 低 | 低 | 无需优化 |
| 番茄会话 (focus_sessions) | 中 | 低 | 现有索引足够 |

**关键瓶颈**：`question_attempts` 会快速增长
- **解决方案**：
  1. 每月归档一次历史数据（移到 `question_attempts_archive`）
  2. 使用表分区（Postgres 12+）
  3. 定期清理（根据用户隐私政策）

---

## 初始化脚本建议

所有上述 SQL 语句可以合并成一个 `init.sql`，按以下顺序执行：

1. 创建 `profiles` 表及 RLS
2. 创建 `questions` 表（无 RLS）
3. 创建 `focus_sessions` 表及 RLS
4. 创建 `question_attempts` 表及 RLS（依赖 focus_sessions）
5. 创建 `user_progress` 表及 RLS
6. 创建 `bookmarks` 表及 RLS

---

## 与 design-decisions.md 的映射

| design-decisions.md 章节 | 对应表 | SQL 位置 |
|--------------------------|--------|---------|
| 1.1 - profiles RLS | profiles | 第 1 部分 |
| 1.2 - user_progress RLS | user_progress | 第 4 部分 |
| 1.3 - bookmarks RLS | bookmarks | 第 5 部分 |
| 2.2 - 双表设计 | user_progress + question_attempts | 第 3、4 部分 |
| 3.2 - Pomodoro 数据模型 | focus_sessions + question_attempts | 第 3、6 部分 |

---
