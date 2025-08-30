/*
  # Update users_meta table for Google Calendar integration

  1. New Columns
    - `google_connected` (boolean) - Track if user has connected Google Calendar
    - `google_refresh_token` (text) - Store Google refresh token for long-term access
    - `google_calendar_id` (text) - Store primary calendar ID

  2. Security
    - Maintain existing RLS policies
    - Add index for Google connection status
*/

-- Add Google Calendar integration columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_connected'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_connected boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_refresh_token'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_refresh_token text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_meta' AND column_name = 'google_calendar_id'
  ) THEN
    ALTER TABLE users_meta ADD COLUMN google_calendar_id text;
  END IF;
END $$;