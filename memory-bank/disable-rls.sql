-- ============================================
-- DISABLE RLS FOR DEVELOPMENT (QUICK FIX)
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This temporarily disables RLS to test answer submission
-- WARNING: Only use this for development - enable RLS in production!

-- Disable RLS on question_attempts
ALTER TABLE question_attempts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_progress
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- After testing is complete, re-enable RLS:
-- ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ============================================
