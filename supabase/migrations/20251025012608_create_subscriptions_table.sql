/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_id` (uuid, foreign key to subscription_plans)
      - `status` (text) - Subscription status: active, paused, cancelled, expired
      - `start_date` (timestamptz) - When subscription started
      - `next_delivery_date` (timestamptz) - Next scheduled delivery
      - `last_delivery_date` (timestamptz) - Last delivery date
      - `delivery_count` (integer) - Total deliveries made
      - `payment_method` (text) - Payment method used
      - `checkout_url` (text) - URL for managing subscription
      - `cancellation_reason` (text) - Reason for cancellation if cancelled
      - `cancelled_at` (timestamptz) - When subscription was cancelled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for users to read their own subscriptions
    - Add policy for users to insert their own subscriptions
    - Add policy for users to update their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz DEFAULT now(),
  next_delivery_date timestamptz,
  last_delivery_date timestamptz,
  delivery_count integer DEFAULT 0,
  payment_method text,
  checkout_url text,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'cancelled', 'expired'))
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery ON subscriptions(next_delivery_date);