/*
  # Add checkin_time column to daily_checkins table

  1. Changes
    - Add `checkin_time` column to `daily_checkins` table
      - Type: time with time zone
      - Default: current time
      - Stores the exact time when user completes their daily check-in
  
  2. Notes
    - This column will allow tracking when users complete their check-ins each day
    - Useful for displaying "2 capsules at 13:26" style messages
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_checkins' AND column_name = 'checkin_time'
  ) THEN
    ALTER TABLE daily_checkins 
    ADD COLUMN checkin_time timestamptz DEFAULT now();
  END IF;
END $$;
