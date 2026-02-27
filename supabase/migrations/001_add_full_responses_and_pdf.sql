-- ============================================================
-- Migration: Add full response JSON columns + PDF storage
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Add new JSONB columns to questionnaire_results
ALTER TABLE questionnaire_results
  ADD COLUMN IF NOT EXISTS responses        JSONB,
  ADD COLUMN IF NOT EXISTS context_responses JSONB,
  ADD COLUMN IF NOT EXISTS followup_responses JSONB,
  ADD COLUMN IF NOT EXISTS interpretation   JSONB,
  ADD COLUMN IF NOT EXISTS user_data        JSONB,
  ADD COLUMN IF NOT EXISTS completed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pdf_url          TEXT;

-- 2. Create the 'reports' storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Allow authenticated users to upload to the reports bucket
CREATE POLICY "Users can upload reports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reports');

-- 4. Allow anyone to read (download) reports via public URL
CREATE POLICY "Public read access for reports"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'reports');

-- 5. Allow anonymous uploads too (for users who haven't signed in)
CREATE POLICY "Anonymous users can upload reports"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'reports');
