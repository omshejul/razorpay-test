-- Supabase SQL Schema for Razorpay Integration

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create payment_orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL, -- Amount in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  user_id UUID REFERENCES auth.users(id),
  receipt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  signature TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay_order_id ON payment_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- Enable Row Level Security on payment_orders
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own orders
CREATE POLICY "Users can view their own payment orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for service role to manage all orders
CREATE POLICY "Service role can manage all payment orders" ON payment_orders
  FOR ALL USING (auth.role() = 'service_role');

-- Enable Row Level Security on webhook_events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage webhook events
CREATE POLICY "Service role can manage webhook events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for payment_orders
CREATE TRIGGER update_payment_orders_updated_at 
  BEFORE UPDATE ON payment_orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Subscriptions table to store plan subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions
CREATE POLICY "Service role manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- trigger to update updated_at
grant usage on schema public to postgres, anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add plan and email fields to payment_orders if missing
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS plan_id TEXT;
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE payment_orders ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_orders_plan ON payment_orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_email ON payment_orders(email);
