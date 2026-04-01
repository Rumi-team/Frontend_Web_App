-- Migration: Create gamification tables (user_progress, badges, user_badges, journal_entries)
-- Supports XP, streaks, badges, and quest completions per DESIGN.md

-- User progress: XP, streaks, session stats (referenced by existing /api/user/progress endpoint)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  word_count INT DEFAULT 0,
  sessions_completed INT DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Badge definitions (seeded, not user-writable)
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_value TEXT,
  xp_reward INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are readable by all authenticated users"
  ON badges FOR SELECT USING (auth.role() = 'authenticated');

-- Seed badge definitions from DESIGN.md
INSERT INTO badges (id, name, description, icon, trigger_type, trigger_value, xp_reward, sort_order) VALUES
  ('first_light', 'First Light', 'Complete your first coaching session', 'star', 'session_count', '1', 10, 1),
  ('7_day_flame', '7-Day Flame', 'Maintain a 7-day coaching streak', 'fire', 'streak', '7', 25, 2),
  ('pattern_breaker', 'Pattern Breaker', 'Complete Step 5: The Hidden Payoff', 'eye', 'step', '5', 50, 3),
  ('identity_shift', 'Identity Shift', 'Complete Step 7: Deconstructing Identity', 'mirror', 'step', '7', 50, 4),
  ('the_declaration', 'The Declaration', 'Complete Step 15: Your Declaration', 'scroll', 'step', '15', 100, 5),
  ('transformer', 'Transformer', 'Complete all 20 coaching steps', 'crown', 'step', '20', 200, 6),
  ('streak_master', 'Streak Master', 'Maintain a 30-day coaching streak', 'diamond', 'streak', '30', 100, 7),
  ('deep_diver', 'Deep Diver', '3+ exchanges on a deep step (5, 7, 10, or 12)', 'dive', 'deep_step', '3', 25, 8)
ON CONFLICT (id) DO NOTHING;

-- User badges (earned achievements)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal entries (quest completions, reflections)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id TEXT,
  content TEXT,
  word_count INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journal entries"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
