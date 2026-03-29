-- Migration: Create user_onboarding table for onboarding flow data collection
-- Stores survey responses, AI calibration preferences, and completion state

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acquisition_source TEXT,
  age_range TEXT,
  gender TEXT,
  occupation TEXT,
  relationship_status TEXT,
  support_type TEXT CHECK (support_type IN ('emotional', 'coaching', 'both', 'unsure')),
  current_struggles TEXT[] DEFAULT '{}',
  life_events TEXT[] DEFAULT '{}',
  commitment_weeks INT CHECK (commitment_weeks BETWEEN 1 AND 4),
  voice_persona_id TEXT,
  communication_approach TEXT,
  radar_calibration JSONB DEFAULT '{}',
  selected_theme TEXT,
  current_step INT DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own onboarding"
  ON user_onboarding FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own onboarding"
  ON user_onboarding FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own incomplete onboarding"
  ON user_onboarding FOR UPDATE USING (auth.uid() = user_id AND completed_at IS NULL);

-- No DELETE policy — onboarding records are permanent

CREATE INDEX idx_user_onboarding_user_completed
  ON user_onboarding(user_id, completed_at);

COMMENT ON TABLE user_onboarding IS 'Stores onboarding survey data, AI calibration preferences, and flow completion state';
