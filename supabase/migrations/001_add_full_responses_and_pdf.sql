-- ============================================================
-- FULL DATABASE SETUP — creates all tables, storage & policies
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id   TEXT UNIQUE NOT NULL,
  user_id      UUID REFERENCES auth.users(id),
  age          INT NOT NULL,
  gender       TEXT NOT NULL,
  pet_preference TEXT,
  instrument   TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           TEXT,
  age            INT NOT NULL,
  gender         TEXT NOT NULL,
  pet_preference TEXT,
  session_id     TEXT NOT NULL,
  user_id        UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONNAIRE RESULTS
CREATE TABLE IF NOT EXISTS questionnaire_results (
  id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id              TEXT NOT NULL,
  user_id                 UUID REFERENCES auth.users(id),
  instrument              TEXT NOT NULL,
  domain_a_score          INT,
  domain_b_score          INT,
  domain_a_total          INT,
  domain_b_total          INT,
  presentation_type       TEXT,
  risk_level              TEXT,
  part_a_shaded_count     INT,
  part_a_high_risk        BOOLEAN,
  meets_symptom_threshold BOOLEAN,
  multiple_settings       BOOLEAN,
  before_age_12           BOOLEAN,
  significant_impact      BOOLEAN,
  responses               JSONB,
  context_responses       JSONB,
  followup_responses      JSONB,
  interpretation          JSONB,
  user_data               JSONB,
  completed_at            TIMESTAMPTZ,
  pdf_url                 TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GO/NO-GO SCORES
CREATE TABLE IF NOT EXISTS gonogo_scores (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id          TEXT NOT NULL,
  user_id             UUID REFERENCES auth.users(id),
  aq_vis              FLOAT,
  rcq_vis             FLOAT,
  icv                 FLOAT,
  mean_rt             FLOAT,
  sd_rt               FLOAT,
  hits                INT,
  false_alarms        INT,
  omissions           INT,
  correct_rejections  INT,
  omission_pct        FLOAT,
  commission_pct      FLOAT,
  vig_slope           FLOAT,
  go_total            INT,
  nogo_total          INT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHRONOS SCORES
CREATE TABLE IF NOT EXISTS chronos_scores (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id        TEXT NOT NULL,
  user_id           UUID REFERENCES auth.users(id),
  c_im              FLOAT,
  c_hr              FLOAT,
  c_ie              FLOAT,
  mean_error_pct    FLOAT,
  premature_rate    FLOAT,
  phase1_mean_error FLOAT,
  phase2_mean_error FLOAT,
  total_trials      INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FOCUS QUEST SCORES
CREATE TABLE IF NOT EXISTS focus_quest_scores (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id            TEXT NOT NULL,
  user_id               UUID REFERENCES auth.users(id),
  c_cpt_x               FLOAT,
  x_omission_pct        FLOAT,
  x_commission_pct      FLOAT,
  x_mean_rt             FLOAT,
  x_sd_rt               FLOAT,
  x_icv                 FLOAT,
  x_vig_slope           FLOAT,
  x_hits                INT,
  x_omissions           INT,
  x_false_alarms        INT,
  x_correct_rejections  INT,
  c_cpt_ax              FLOAT,
  d_prime               FLOAT,
  ax_hits               INT,
  ax_omissions          INT,
  bx_errors             INT,
  ay_errors             INT,
  ax_total_ax           INT,
  ax_total_non_ax       INT,
  ax_mean_rt            FLOAT,
  ax_sd_rt              FLOAT,
  c_ia                  FLOAT,
  c_hi                  FLOAT,
  total_trials          INT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY — enable on all tables
ALTER TABLE sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gonogo_scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronos_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_quest_scores    ENABLE ROW LEVEL SECURITY;

-- Allow anon + authenticated to insert into all tables
CREATE POLICY "Allow inserts" ON sessions              FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON profiles              FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON questionnaire_results FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON gonogo_scores         FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON chronos_scores        FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow inserts" ON focus_quest_scores    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow anon + authenticated to read rows
CREATE POLICY "Allow select" ON sessions              FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select" ON profiles              FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select" ON questionnaire_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select" ON gonogo_scores         FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select" ON chronos_scores        FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow select" ON focus_quest_scores    FOR SELECT TO anon, authenticated USING (true);

-- Allow updates (needed for upsert on sessions + pdf_url updates)
CREATE POLICY "Allow updates" ON sessions              FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow updates" ON questionnaire_results FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKET for PDF reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload reports"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Anonymous users can upload reports"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Public read access for reports"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'reports');
