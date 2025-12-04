-- ============================================
-- FIX RLS POLICIES FOR ANSWER SUBMISSION
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This will fix the 42501 error when submitting answers

-- 1. DROP existing policies on question_attempts (if any) to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Users can view their own question attempts" ON question_attempts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON question_attempts;

-- 2. CREATE new RLS policies for question_attempts table
-- Allow authenticated users to INSERT their own attempts
CREATE POLICY "Users can insert their own question attempts" ON question_attempts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own attempts
CREATE POLICY "Users can view their own question attempts" ON question_attempts
FOR SELECT USING (auth.uid() = user_id);

-- ============================================

-- 3. DROP existing policies on user_progress (if any)
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;

-- 4. CREATE new RLS policies for user_progress table
-- Allow authenticated users to INSERT their own progress
CREATE POLICY "Users can insert their own progress" ON user_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to UPDATE their own progress
CREATE POLICY "Users can update their own progress" ON user_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to SELECT their own progress
CREATE POLICY "Users can view their own progress" ON user_progress
FOR SELECT USING (auth.uid() = user_id);

-- ============================================

-- 5. DROP existing policies on profiles (if any)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 6. CREATE new RLS policies for profiles table
-- Allow anyone to SELECT profiles (for leaderboard)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
FOR SELECT USING (true);

-- Allow users to INSERT their own profile during signup
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- ============================================

-- 7. VERIFY RLS is enabled on all tables
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verification: Run this query to check existing policies
-- SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('question_attempts', 'user_progress', 'profiles')
-- ORDER BY tablename, policyname;
