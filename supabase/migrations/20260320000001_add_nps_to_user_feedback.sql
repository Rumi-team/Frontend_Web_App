-- Add NPS (Net Promoter Score) columns to user_feedback
-- nps_score: 0-10 scale ("Would you tell a friend about Rumi?")
-- nps_category: derived from score (detractor 0-6, passive 7-8, promoter 9-10)
ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS nps_score smallint CHECK (nps_score >= 0 AND nps_score <= 10),
  ADD COLUMN IF NOT EXISTS nps_category text CHECK (nps_category IN ('detractor', 'passive', 'promoter'));
