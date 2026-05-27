-- Kiwtech License System — Supabase mein SQL Editor pe run karo
-- supabase.com → Project → SQL Editor → New Query → Paste → Run

CREATE TABLE IF NOT EXISTS licenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT DEFAULT 'Customer',
  plan TEXT DEFAULT 'monthly' CHECK (plan IN ('monthly','yearly','lifetime')),
  expiry DATE,
  machine_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  email TEXT NOT NULL,
  name TEXT,
  plan TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security OFF rakho (service key use hoti hai)
ALTER TABLE licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Index for faster key lookup
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
