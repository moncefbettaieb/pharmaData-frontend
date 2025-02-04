/*
  # Create orders table and security policies

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `stripe_session_id` (text, unique)
      - `amount` (decimal)
      - `status` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to view their own orders
*/

-- Create orders table without foreign key constraint
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_session_id text UNIQUE NOT NULL,
  amount decimal NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);