-- ============================================
-- ENABLE RLS POLICIES FOR PRODUCTION
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This enables Row-Level Security on all sensitive tables

-- ============================================
-- 1. QUESTION_ATTEMPTS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Users can view their own question attempts" ON question_attempts;

-- Allow authenticated users to INSERT their own attempts
CREATE POLICY "Users can insert their own question attempts" ON question_attempts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own attempts
CREATE POLICY "Users can view their own question attempts" ON question_attempts
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 2. USER_PROGRESS TABLE
-- ============================================

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;

-- Allow authenticated users to INSERT their own progress
CREATE POLICY "Users can insert their own progress" ON user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to UPDATE their own progress
CREATE POLICY "Users can update their own progress" ON user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own progress
CREATE POLICY "Users can view their own progress" ON user_progress
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 3. PROFILES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow anyone to SELECT profiles (for leaderboard, public stats)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
FOR SELECT
USING (true);

-- Allow users to INSERT their own profile during signup
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- 4. BOOKMARKS TABLE (if needed for future)
-- ============================================

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON bookmarks;

-- Allow authenticated users to manage their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. FOCUS_SESSIONS TABLE (if needed for future)
-- ============================================

-- Enable RLS
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own sessions" ON focus_sessions;

-- Allow authenticated users to manage their own sessions
CREATE POLICY "Users can manage their own sessions" ON focus_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- Check policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
