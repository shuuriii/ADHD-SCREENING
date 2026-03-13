-- ============================================================
-- Row Level Security (RLS) policies for all tables
-- Suggested by: Compliance Auditor Agent (2026-03-13)
--
-- Applies the principle of least privilege:
--   - Authenticated users: CRUD on their own rows (matched by user_id)
--   - Anonymous inserts: allowed for session-based usage (no user_id)
--   - No cross-user reads or writes
-- ============================================================

-- ============================================================
-- 1. SESSIONS
-- ============================================================
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own sessions
CREATE POLICY "Users can read own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert sessions linked to themselves
CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous inserts (no user_id) are allowed
CREATE POLICY "Anonymous can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 2. PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 3. QUESTIONNAIRE_RESULTS
-- ============================================================
ALTER TABLE questionnaire_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own questionnaire results"
  ON questionnaire_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questionnaire results"
  ON questionnaire_results FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous can insert questionnaire results"
  ON questionnaire_results FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 4. GONOGO_SCORES
-- ============================================================
ALTER TABLE gonogo_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gonogo scores"
  ON gonogo_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gonogo scores"
  ON gonogo_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous can insert gonogo scores"
  ON gonogo_scores FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 5. CHRONOS_SCORES
-- ============================================================
ALTER TABLE chronos_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chronos scores"
  ON chronos_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chronos scores"
  ON chronos_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous can insert chronos scores"
  ON chronos_scores FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 6. FOCUS_QUEST_SCORES
-- ============================================================
ALTER TABLE focus_quest_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own focus quest scores"
  ON focus_quest_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus quest scores"
  ON focus_quest_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous can insert focus quest scores"
  ON focus_quest_scores FOR INSERT
  WITH CHECK (user_id IS NULL);
