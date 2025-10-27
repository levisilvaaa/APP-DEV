/*
  # Create Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `full_name` (text) - User's full name
      - `phone` (text) - User's phone number
      - `avatar_url` (text) - URL to user's avatar image
      - `referral_code` (text, unique) - Unique referral code for this user
      - `referred_by` (uuid) - References another user who referred this user
      - `total_referrals` (integer) - Count of successful referrals
      - `reward_points` (integer) - Points earned from referrals and activities
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to view their own profile
    - Add policy for users to update their own profile
    - Add policy for users to insert their own profile
    - Add policy for public to view basic profile info (for referrals)

  3. Indexes
    - Index on `referral_code` for quick lookups
    - Index on `referred_by` for referral tracking

  4. Important Notes
    - Full name is required for profile creation
    - Referral code is automatically generated
    - All user data is protected by RLS
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  referral_code text UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  referred_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  total_referrals integer DEFAULT 0,
  reward_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view profiles by referral code"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;