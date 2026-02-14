/*
  # Create clinic_numbers table for Telnyx phone number tracking

  1. New Tables
    - `clinic_numbers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key → auth.users)
      - `telnyx_number` (text, the actual phone number like +1XXXXXXXXXX)
      - `telnyx_number_id` (text, the Telnyx API ID for the number)
      - `status` (text, active/inactive - tracks if number is in use)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clinic_numbers` table
    - Add policy for users to read their own number
    - Add policy for authenticated users to create their own numbers
    - Add policy for users to update their own number status

  3. Indexes
    - Add index on user_id for fast lookups
    - Add unique constraint on user_id to ensure one number per user
*/

CREATE TABLE IF NOT EXISTS clinic_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telnyx_number text NOT NULL,
  telnyx_number_id text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS clinic_numbers_user_id_idx ON clinic_numbers(user_id);

ALTER TABLE clinic_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own clinic number"
  ON clinic_numbers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clinic number"
  ON clinic_numbers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinic number status"
  ON clinic_numbers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
