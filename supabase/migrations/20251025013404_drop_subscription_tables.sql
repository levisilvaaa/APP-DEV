/*
  # Remove subscription tables

  1. Drop Tables
    - Drop `subscriptions` table (has foreign key to subscription_plans)
    - Drop `subscription_plans` table
  
  2. Notes
    - These tables were created for subscription feature that was reverted
    - Using CASCADE to handle foreign key relationships
*/

DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;