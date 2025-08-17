/*
  # Drop plans table

  1. Changes
    - Drop the `plans` table and all its data
    - This removes all pricing plan information from the database

  2. Security
    - No RLS policies to remove as table will be deleted
*/

DROP TABLE IF EXISTS plans;