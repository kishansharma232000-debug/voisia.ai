/*
  # Update users_meta table for Vapi integration

  1. Schema Changes
    - Add `assistant_id` column to store Vapi assistant ID
    - Add `assistant_created_at` timestamp for tracking
    - Update RLS policies to include new columns

  2. Security
    - Maintain existing RLS policies
    - Ensure users can only access their own assistant data
*/

-- Add assistant_id column to users_meta table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'assistant_id'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN assistant_id text;
  END IF;
END $$;

-- Add assistant_created_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'assistant_created_at'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN assistant_created_at timestamptz;
  END IF;
END $$;

-- Create index for faster assistant lookups
CREATE INDEX IF NOT EXISTS idx_users_meta_assistant_id ON users_meta(assistant_id);

-- Update RLS policies to include assistant fields (policies already exist, this ensures they cover new fields)
-- The existing policies already cover all columns with SELECT, INSERT, UPDATE permissions