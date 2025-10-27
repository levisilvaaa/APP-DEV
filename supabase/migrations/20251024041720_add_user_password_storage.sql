/*
  # Add Plain Text Password Storage

  **WARNING: This is a security anti-pattern and should NEVER be used in production**
  
  This migration adds a column to store user passwords in plain text for demonstration purposes.
  
  1. Changes
    - Add `plain_password` column to `profiles` table to store unencrypted passwords
  
  2. Security
    - RLS policies remain unchanged
    - This is intentionally insecure as requested
*/

-- Add plain_password column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plain_password'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plain_password text;
  END IF;
END $$;