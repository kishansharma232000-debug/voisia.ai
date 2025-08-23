/*
  # Create assistants table for Vapi integration

  1. New Tables
    - `assistants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `vapi_assistant_id` (text, stores Vapi assistant ID)
      - `business_name` (text, business name for the assistant)
      - `timezone` (text, timezone for the assistant)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `assistants` table
    - Add policy for authenticated users to read/write their own assistant data
*/

CREATE TABLE IF NOT EXISTS assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vapi_assistant_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assistant data"
  ON assistants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant data"
  ON assistants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assistant data"
  ON assistants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assistant data"
  ON assistants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);