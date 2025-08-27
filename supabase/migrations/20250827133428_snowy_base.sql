/*
  # Add Google Calendar connection status to users_meta

  1. New Columns
    - `google_connected` (boolean, default false) - Tracks if user has connected Google Calendar
    - `google_refresh_token` (text, nullable) - Stores refresh token for Google API access
    - `google_calendar_id` (text, nullable) - Primary calendar ID for the user

  2. Security
    - Maintains existing RLS policies
    - No additional policies needed as existing ones cover new columns
*/

-- Add Google Calendar integration columns to users_meta table
DO $$
BEGIN
  -- Add google_connected column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_connected'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_connected boolean DEFAULT false;
  END IF;

  -- Add google_refresh_token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_refresh_token'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_refresh_token text;
  END IF;

  -- Add google_calendar_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_calendar_id'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_calendar_id text;
  END IF;
END $$;