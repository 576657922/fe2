-- ========================================
-- 快速创建测试错题数据
-- ========================================
-- 说明：这个脚本会自动获取当前用户 ID 和前 3 道题目，创建错题记录
--
-- 使用方法：
-- 1. 访问 Supabase Dashboard → SQL Editor
-- 2. 复制粘贴这整个脚本
-- 3. 点击 "Run" 执行
-- 4. 完成！
-- ========================================

-- 插入 3 条错题记录（自动获取用户 ID 和题目 ID）
WITH selected_user AS (
  SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1
),
test_questions AS (
  SELECT id FROM questions ORDER BY created_at LIMIT 3
)
INSERT INTO user_progress (
  user_id,
  question_id,
  user_answer,
  is_correct,
  attempt_count,
  consecutive_correct_count,
  status,
  last_attempt_at,
  created_at
)
SELECT
  selected_user.id,
  test_questions.id,
  CASE
    WHEN row_number() OVER () = 1 THEN 'A'
    WHEN row_number() OVER () = 2 THEN 'C'
    ELSE 'B'
  END as user_answer,
  false as is_correct,
  CASE
    WHEN row_number() OVER () = 1 THEN 2
    WHEN row_number() OVER () = 2 THEN 1
    ELSE 3
  END as attempt_count,
  0 as consecutive_correct_count,
  'wrong_book' as status,
  NOW() - (row_number() OVER ()) * INTERVAL '1 hour' as last_attempt_at,
  NOW() - (row_number() OVER ()) * INTERVAL '1 day' as created_at
FROM selected_user, test_questions;

-- 验证插入成功
SELECT
  up.id,
  up.user_answer,
  up.is_correct,
  up.attempt_count,
  up.status,
  up.last_attempt_at,
  q.year,
  q.category,
  q.question_number,
  q.content
FROM user_progress up
JOIN questions q ON up.question_id = q.id
WHERE up.status = 'wrong_book'
ORDER BY up.last_attempt_at DESC;
