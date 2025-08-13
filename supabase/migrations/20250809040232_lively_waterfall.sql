/*
  # Create users_meta table for clinic information

  1. New Tables
    - `users_meta`
      - `id` (uuid, primary key, references auth.users)
      - `clinic_name` (text)
      - `phone_number` (text)
      - `clinic_connected` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users_meta` table
    - Add policy for users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS users_meta (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_name text,
  phone_number text,
  clinic_connected boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own meta data"
  ON users_meta
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own meta data"
  ON users_meta
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own meta data"
  ON users_meta
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_meta_updated_at
  BEFORE UPDATE ON users_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();