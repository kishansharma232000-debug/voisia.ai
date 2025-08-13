/*
  # Add assistant_active field to users_meta

  1. Changes
    - Add `assistant_active` boolean column to users_meta table
    - Add `plan` text column to store user's current plan
    - Set default values

  2. Security
    - Maintain existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'assistant_active'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN assistant_active boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'plan'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN plan text DEFAULT null;
  END IF;
END $$;