-- Consolidate feedback tables: add general feedback support to user_feedback
-- The `feedback` table (simple: user_id, content) has 0 rows and is only
-- referenced by FeedbackModal. We add feedback_type + content columns to
-- user_feedback so it handles both session and general feedback.

ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS feedback_type TEXT DEFAULT 'session',
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS content TEXT;

-- No data migration needed (feedback table has 0 rows)

-- Drop the now-redundant feedback table
DROP TABLE IF EXISTS feedback;
