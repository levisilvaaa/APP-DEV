/*
  # Create Tracker Entries Table

  1. New Tables
    - `tracker_entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `user_id` (uuid, foreign key) - References auth.users table
      - `value` (numeric) - The numeric value being tracked
      - `note` (text) - Optional note/description for the entry
      - `created_at` (timestamptz) - Timestamp when entry was created
      - `updated_at` (timestamptz) - Timestamp when entry was last updated

  2. Security
    - Enable RLS on `tracker_entries` table
    - Add policy for users to view only their own entries
    - Add policy for users to insert their own entries
    - Add policy for users to update their own entries
    - Add policy for users to delete their own entries

  3. Indexes
    - Index on `user_id` for faster queries
    - Index on `created_at` for sorting and date-based queries

  4. Important Notes
    - All entries are user-specific and protected by RLS
    - Timestamps are automatically managed
    - Default value for `value` is 0 to prevent null values
*/

CREATE TABLE IF NOT EXISTS tracker_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value numeric NOT NULL DEFAULT 0,
  note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON tracker_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON tracker_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON tracker_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON tracker_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tracker_entries_user_id ON tracker_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tracker_entries_created_at ON tracker_entries(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_tracker_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_tracker_entries_updated_at
      BEFORE UPDATE ON tracker_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
