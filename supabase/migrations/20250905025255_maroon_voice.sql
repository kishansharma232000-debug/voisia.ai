/*
  # Add Multi-Industry Support

  1. New Tables
    - `faq_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Schema Updates
    - Add `industry_type` column to users_meta
    - Add `industry_settings` JSON column to users_meta
    - Add `faq_usage_count` column to faq_entries for analytics

  3. Security
    - Enable RLS on faq_entries table
    - Add policies for authenticated users to manage their own FAQs
    - Add indexes for performance optimization
*/

-- Add industry support columns to users_meta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'industry_type'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN industry_type text DEFAULT 'clinic';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'industry_settings'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN industry_settings jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create FAQ entries table
CREATE TABLE IF NOT EXISTS faq_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  faq_usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on faq_entries
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for faq_entries
CREATE POLICY "Users can read own FAQs"
  ON faq_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own FAQs"
  ON faq_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own FAQs"
  ON faq_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own FAQs"
  ON faq_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_faq_entries_user_id ON faq_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_faq_entries_question_search ON faq_entries USING gin(to_tsvector('english', question));
CREATE INDEX IF NOT EXISTS idx_faq_entries_answer_search ON faq_entries USING gin(to_tsvector('english', answer));
CREATE INDEX IF NOT EXISTS idx_users_meta_industry_type ON users_meta(industry_type);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_faq_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for faq_entries
DROP TRIGGER IF EXISTS update_faq_entries_updated_at ON faq_entries;
CREATE TRIGGER update_faq_entries_updated_at
  BEFORE UPDATE ON faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_entries_updated_at();