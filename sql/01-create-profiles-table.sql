-- Step 1.6: Create profiles table (用户信息表)
-- Reference: database-schema.md

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on level for leaderboard queries (ORDER BY level DESC)
CREATE INDEX idx_profiles_level ON profiles(level DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to read all profiles (for leaderboard)
CREATE POLICY "Allow public read" ON profiles
  FOR SELECT
  USING (true);

-- Policy 2: Allow users to update only their own profile
CREATE POLICY "Allow self update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to delete only their own profile
CREATE POLICY "Allow self delete" ON profiles
  FOR DELETE
  USING (auth.uid() = id);
