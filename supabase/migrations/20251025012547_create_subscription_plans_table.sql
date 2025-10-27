/*
  # Create subscription plans table

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text) - Plan name (e.g., "Monthly", "Quarterly", "Yearly")
      - `bottles` (integer) - Number of bottles per delivery
      - `frequency_days` (integer) - Delivery frequency in days
      - `original_price` (numeric) - Original price before discount
      - `price` (numeric) - Subscription price
      - `discount_percentage` (integer) - Discount percentage
      - `price_per_bottle` (numeric) - Price per bottle
      - `is_active` (boolean) - Whether plan is currently available
      - `display_order` (integer) - Order to display plans
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `subscription_plans` table
    - Add policy for anyone to read active plans
    - Add policy for authenticated users to read all plans

  3. Sample Data
    - Insert default subscription plans (monthly, quarterly, semi-annual)
*/

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bottles integer NOT NULL,
  frequency_days integer NOT NULL,
  original_price numeric(10,2) NOT NULL,
  price numeric(10,2) NOT NULL,
  discount_percentage integer NOT NULL,
  price_per_bottle numeric(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, bottles, frequency_days, original_price, price, discount_percentage, price_per_bottle, display_order) VALUES
  ('Mensal', 1, 30, 99.00, 55.00, 44, 55.00, 1),
  ('Trimestral', 3, 90, 297.00, 147.00, 51, 49.00, 2),
  ('Semestral', 6, 180, 594.00, 234.00, 61, 39.00, 3)
ON CONFLICT DO NOTHING;