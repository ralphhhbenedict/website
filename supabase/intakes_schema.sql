-- Leave Me a Loom - Async Video Intake Table
-- Run this in Supabase SQL Editor to create the intakes table

-- Create the intakes table
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  mode TEXT CHECK (mode IN ('audio', 'video')) DEFAULT 'video',
  storage_path TEXT,
  duration_seconds INT,
  file_size_bytes BIGINT,
  status TEXT CHECK (status IN ('created', 'uploading', 'completed', 'failed')) DEFAULT 'created',
  tos_consent BOOLEAN NOT NULL DEFAULT false,
  tos_consent_at TIMESTAMPTZ,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_intakes_email ON intakes(email);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);

-- Enable Row Level Security
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (anon users submitting recordings)
CREATE POLICY "Anyone can insert intakes"
  ON intakes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can read (for admin dashboard later)
CREATE POLICY "Authenticated users can read intakes"
  ON intakes FOR SELECT
  TO authenticated
  USING (true);

-- Create storage bucket for video/audio files (run separately in Storage settings)
-- Bucket name: intakes
-- Public: false (private bucket)
-- File size limit: 100MB
-- Allowed MIME types: video/webm, video/mp4, audio/webm, audio/mp4

-- Add comment for documentation
COMMENT ON TABLE intakes IS 'Async video/audio intake submissions from Leave Me a Loom feature';
COMMENT ON COLUMN intakes.tos_consent IS 'User explicitly checked ToS checkbox';
COMMENT ON COLUMN intakes.tos_consent_at IS 'Timestamp when ToS was accepted';
