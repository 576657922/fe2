// User profile information
export interface Profile {
  id: string;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

// Question from the question bank
export interface Question {
  id: string;
  year: string;
  session: "AM" | "PM";
  category: string;
  question_number: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "easy" | "normal" | "hard";
  created_at: string;
}

// User's question progress/summary
export interface UserProgress {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: "A" | "B" | "C" | "D" | null;
  is_correct: boolean | null;
  attempt_count: number;
  consecutive_correct_count: number;
  status: "normal" | "wrong_book" | "mastered";
  last_attempt_at: string | null;
  created_at: string;
}

// User's question attempt history (one record per attempt)
export interface QuestionAttempt {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: "A" | "B" | "C" | "D";
  is_correct: boolean;
  pomodoro_session_id: string | null;
  created_at: string;
}

// User's bookmark
export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

// Pomodoro focus session
export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration: number; // seconds
  goal_description: string | null;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
