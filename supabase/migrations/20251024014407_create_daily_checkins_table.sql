/*
  # Create Daily Check-ins Table

  ## Overview
  This migration creates a table to track daily check-ins for users, allowing each user 
  to mark their daily supplement intake once per day. The system automatically resets 
  at midnight, enabling a new check-in for the next day.

  ## 1. New Tables
  
  ### `daily_checkins`
  Stores daily check-in records for each user with the following columns:
  
  - `id` (uuid, primary key) - Unique identifier for each check-in record
  - `user_id` (uuid, foreign key) - References the user from auth.users table
  - `checkin_date` (date) - The date of the check-in (YYYY-MM-DD format)
  - `created_at` (timestamptz) - Timestamp when the check-in was recorded
  - `updated_at` (timestamptz) - Timestamp of last update
  
  ## 2. Constraints
  
  - **UNIQUE constraint** on (user_id, checkin_date) - Ensures each user can only check in once per day
  - **Foreign key** on user_id - Ensures referential integrity with auth.users
  - **ON DELETE CASCADE** - Automatically removes check-ins when a user is deleted
  
  ## 3. Security (Row Level Security)
  
  - **RLS enabled** on the table for data protection
  - **SELECT policy** - Users can only view their own check-ins
  - **INSERT policy** - Users can only create check-ins for themselves
  - **UPDATE policy** - Users can only update their own check-ins
  - **DELETE policy** - Users can only delete their own check-ins
  
  ## 4. Indexes
  
  - Index on `user_id` - Optimizes queries filtering by user
  - Index on `checkin_date` - Optimizes date-based queries and sorting
  - Composite index on (user_id, checkin_date) - Optimizes the most common query pattern
  
  ## 5. Important Notes
  
  - Each user can only have ONE check-in per day (enforced by unique constraint)
  - Check-ins are stored by date (not datetime) to ensure consistency across time zones
  - All check-ins are user-specific and protected by RLS policies
  - The system allows a new check-in each day at midnight (based on the date field)
  - Deleting a user automatically removes all their check-ins (CASCADE)
*/

-- Create the daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_date_checkin UNIQUE(user_id, checkin_date)
);

-- Enable Row Level Security
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own check-ins
CREATE POLICY "Users can view own checkins"
  ON daily_checkins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert only their own check-ins
CREATE POLICY "Users can insert own checkins"
  ON daily_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update only their own check-ins
CREATE POLICY "Users can update own checkins"
  ON daily_checkins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete only their own check-ins
CREATE POLICY "Users can delete own checkins"
  ON daily_checkins
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id 
  ON daily_checkins(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_date 
  ON daily_checkins(checkin_date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date 
  ON daily_checkins(user_id, checkin_date DESC);

-- Create function to update updated_at timestamp if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger to automatically update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_checkins_updated_at'
  ) THEN
    CREATE TRIGGER update_daily_checkins_updated_at
      BEFORE UPDATE ON daily_checkins
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;