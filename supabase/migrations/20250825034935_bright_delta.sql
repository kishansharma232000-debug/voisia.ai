/*
  # Add Vapi Assistant Support to users_meta

  1. New Columns
    - `assistant_id` (text) - Stores the Vapi assistant ID
    - `assistant_created_at` (timestamptz) - Timestamp when assistant was created

  2. Security
    - Maintains existing RLS policies
    - Adds index for performance on assistant_id lookups

  3. Notes
    - Uses IF NOT EXISTS to prevent errors on re-run
    - Preserves all existing data and structure
*/

-- Add assistant_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'assistant_id'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN assistant_id TEXT;
  END IF;
END $$;

-- Add assistant_created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'assistant_created_at'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN assistant_created_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add index for assistant_id lookups if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'users_meta' AND indexname = 'idx_users_meta_assistant_id'
  ) THEN
    CREATE INDEX idx_users_meta_assistant_id ON users_meta(assistant_id);
  END IF;
END $$;