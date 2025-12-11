# 部署说明 - 连续打卡天数和今日学习概览功能

## ⚠️ 重要：数据库迁移

在使用新功能之前，你**必须**执行以下数据库迁移，否则连续打卡天数功能将无法正常工作。

### 执行步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query**
5. 复制并粘贴以下 SQL 代码：

```sql
-- 添加 last_answer_date 字段到 profiles 表
-- 这个字段用于追踪用户上次答题的日期，用于计算连续打卡天数
ALTER TABLE profiles
ADD COLUMN last_answer_date DATE;

-- 添加 current_streak 字段到 profiles 表
-- 这个字段追踪当前连续答对了几道题（全局连胜数）
-- 答对时 +1，答错时重置为 0
ALTER TABLE profiles
ADD COLUMN current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0);

-- 创建索引以提高查询效率
CREATE INDEX idx_profiles_last_answer_date ON profiles(last_answer_date);
```

6. 点击 **Run** 按钮执行 SQL
7. 确认看到成功消息：`Success. No rows returned`

### 验证迁移是否成功

执行以下查询来验证字段是否添加成功：

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('last_answer_date', 'current_streak');
```

如果返回两行数据，说明迁移成功。应该看到：
- `last_answer_date` | `date`
- `current_streak` | `integer`

---

## ✅ 已完成的功能

### 1. 连续打卡天数自动更新

**功能说明：**
- 每次答题时自动检测是否为当日首次答题
- 如果昨天也答题了：连续打卡天数 +1
- 如果中断了（超过1天未答题）：重新从 1 开始计数
- 首页实时显示当前连续打卡天数

**修改的文件：**
- `app/api/answers/route.ts` - 添加打卡逻辑
- `sql/02-add-last-answer-date.sql` - 数据库迁移文件

**工作原理：**
```typescript
// 每次答题时计算日期差
const diffDays = Math.floor((今天 - 上次答题日期) / (1000 * 60 * 60 * 24));

if (diffDays === 1) {
  // 昨天答题了，连续打卡
  streak_days += 1;
} else if (diffDays > 1) {
  // 中断了，重新开始
  streak_days = 1;
}
```

---

### 2. 答题弹窗连胜数修复

**问题：** 之前连胜数一直显示为 0，且逻辑错误（显示的是某道题的连续答对次数，而不是全局连胜）

**修复内容：**
- API 返回 `current_streak`（全局连胜数：当前连续答对了几道题）
- 单题详情页正确接收并显示全局连胜数
- 随机刷题页正确接收并显示全局连胜数

**修改的文件：**
- `app/api/answers/route.ts:333` - API 返回全局连胜数
- `app/(dashboard)/dashboard/[year]/[questionId]/page.tsx:208` - 单题页面
- `app/(dashboard)/dashboard/year-random/page.tsx:139` - 随机刷题页面

**连胜数规则（全局）：**
- 答对任意一题：`current_streak + 1`（不管是哪道题）
- 答错任意一题：`current_streak = 0`（重置为 0）
- 这是全局的连胜记录，跨越所有题目

**注意：**
- `consecutive_correct_count` 仍然保留，用于判断某道题是否已掌握（连续答对 3 次）
- `current_streak` 是新增的字段，用于显示给用户的连胜数

---

### 3. 今日学习概览动态数据

**功能说明：**
首页显示实时的学习数据：
- **今日做题**：统计当天的答题总数
- **今日正确率**：计算当天的正确率百分比
- **完成番茄**：统计当天完成的番茄钟数量
- **当前错题**：显示错题本中的题目总数

**新建的文件：**
- `app/api/daily-stats/route.ts` - 今日统计数据 API

**修改的文件：**
- `app/(dashboard)/dashboard/page.tsx` - 首页组件

**数据来源：**

| 指标 | 数据表 | 查询条件 |
|------|--------|---------|
| 今日做题 | `question_attempts` | `WHERE DATE(created_at) = CURRENT_DATE` |
| 今日正确率 | `question_attempts` | `COUNT(is_correct = true) / COUNT(*)` |
| 完成番茄 | `focus_sessions` | `WHERE DATE(ended_at) = CURRENT_DATE` |
| 当前错题 | `user_progress` | `WHERE status = 'wrong_book'` |

---

## 🧪 测试功能

### 测试连续打卡天数

1. 答一道题（任意题目）
2. 刷新首页，查看连续打卡天数是否为 `1天`
3. 在 Supabase Dashboard 中手动修改 `profiles.last_answer_date` 为昨天的日期：
   ```sql
   UPDATE profiles
   SET last_answer_date = CURRENT_DATE - INTERVAL '1 day'
   WHERE id = 'your-user-id';
   ```
4. 再答一道题
5. 刷新首页，查看连续打卡天数是否变为 `2天`

### 测试连胜数

1. 打开任意题目详情页
2. 答对第一题（题目A）
3. 查看成功弹窗，连胜数应该显示 `1`
4. 点击"下一题"或打开另一道题
5. 答对第二题（题目B，不同的题）
6. 查看成功弹窗，连胜数应该显示 `2`
7. 再打开第三题，答对
8. 连胜数应该显示 `3`
9. 打开第四题，答错
10. 再打开第五题，答对，连胜数应该重置为 `1`

**重点**：连胜数是全局的，不管你做的是哪道题，只要连续答对就会累加。

### 测试今日学习概览

1. 访问首页 `/dashboard`
2. 检查"今日学习概览"卡片是否显示实际数据
3. 答几道题
4. 刷新首页，查看"今日做题"和"今日正确率"是否更新
5. 完成一个番茄钟
6. 刷新首页，查看"完成番茄"是否 +1

---

## 🐛 常见问题

### Q: 连续打卡天数一直是 0

**A:** 请确保你已经执行了数据库迁移（添加 `last_answer_date` 字段）。如果已执行迁移但仍为 0，请尝试答一道题目，然后刷新页面。

### Q: 连胜数显示不正确

**A:** 连胜数基于 `user_progress` 表的 `consecutive_correct_count` 字段。请检查：
1. 你是否在同一个题目上连续答对
2. 数据库中该字段是否存在且有正确的值

### Q: 今日学习概览显示为 0

**A:** 如果你今天还没有做题/完成番茄钟，显示 0 是正常的。尝试答几道题或完成一个番茄钟后再刷新页面。

### Q: 打卡天数在跨天后没有自动更新

**A:** 打卡天数只会在你**答题时**更新，不会自动跨天更新。你需要每天至少答一道题才能保持连续打卡。

---

## 📊 API 响应格式

### `/api/answers` (POST)

**返回数据：**
```json
{
  "success": true,
  "is_correct": true,
  "xp_gained": 10,
  "correct_answer": "A",
  "level_up": false,
  "new_level": 3,
  "new_xp": 150,
  "streak_days": 5,
  "current_streak": 3,
  "consecutive_correct_count": 2,
  "message": "Answer is correct!"
}
```

**字段说明：**
- `current_streak`: 全局连胜数（当前连续答对了几道题，跨越所有题目）
- `consecutive_correct_count`: 该题目的连续答对次数（用于判断是否已掌握该题）
- `streak_days`: 连续打卡天数

### `/api/daily-stats` (GET)

**返回数据：**
```json
{
  "success": true,
  "data": {
    "today_questions": 15,
    "today_accuracy": "87%",
    "today_pomodoros": 3,
    "wrong_questions": 12
  }
}
```

---

## 🚀 下一步

功能已经全部实现，现在你可以：

1. ✅ 执行数据库迁移（最重要！）
2. ✅ 测试连续打卡天数功能
3. ✅ 测试连胜数显示
4. ✅ 测试今日学习概览
5. ✅ 如有问题，查看上方的"常见问题"部分

---

**需要帮助？** 如果遇到任何问题，请检查浏览器控制台的错误信息，或查看 Supabase Dashboard 的日志。
