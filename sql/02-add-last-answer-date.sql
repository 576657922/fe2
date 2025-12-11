-- Add last_answer_date field to profiles table
-- This field is used to track the last date the user answered a question
-- for calculating streak_days (consecutive check-in days)

ALTER TABLE profiles
ADD COLUMN last_answer_date DATE;

-- Add current_streak field to profiles table
-- This field tracks the current consecutive correct answers (global streak)
-- Increments by 1 when user answers correctly, resets to 0 when user answers incorrectly
ALTER TABLE profiles
ADD COLUMN current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0);

-- Create index for efficient streak calculation queries
CREATE INDEX idx_profiles_last_answer_date ON profiles(last_answer_date);
