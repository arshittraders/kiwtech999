-- ═══════════════════════════════════════════════
-- KIWTECH DISTRIBUTOR SYSTEM — Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Distributors table
CREATE TABLE IF NOT EXISTS distributors (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT NOT NULL,
  city          TEXT,
  why           TEXT,
  upi_id        TEXT,
  ref_code      TEXT UNIQUE,
  status        TEXT DEFAULT 'pending', -- pending | approved | rejected
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  total_earned  DECIMAL(10,2) DEFAULT 0,
  total_withdrawn DECIMAL(10,2) DEFAULT 0,
  total_sales   INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  approved_at   TIMESTAMPTZ
);

-- 2. Commissions table
CREATE TABLE IF NOT EXISTS dist_commissions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id  UUID REFERENCES distributors(id),
  distributor_email TEXT,
  referee_email   TEXT,
  tool_name       TEXT NOT NULL,
  tool_key        TEXT, -- shipping_topup | research_basic | research_advanced
  sale_amount     DECIMAL(10,2),
  commission      DECIMAL(10,2),
  payment_id      TEXT,
  status          TEXT DEFAULT 'credited', -- credited | reversed
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Withdrawals table
CREATE TABLE IF NOT EXISTS dist_withdrawals (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  distributor_id    UUID REFERENCES distributors(id),
  distributor_email TEXT,
  amount            DECIMAL(10,2) NOT NULL,
  upi_id            TEXT,
  status            TEXT DEFAULT 'pending', -- pending | paid | rejected
  requested_at      TIMESTAMPTZ DEFAULT NOW(),
  paid_at           TIMESTAMPTZ,
  payment_proof     TEXT,
  admin_note        TEXT
);

-- 4. Auto generate ref_code on insert
CREATE OR REPLACE FUNCTION generate_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_code IS NULL THEN
    NEW.ref_code := UPPER(SUBSTRING(MD5(NEW.email || NOW()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ref_code
  BEFORE INSERT ON distributors
  FOR EACH ROW EXECUTE FUNCTION generate_ref_code();

-- 5. RLS Policies (disable for server-side access via service_role)
ALTER TABLE distributors DISABLE ROW LEVEL SECURITY;
ALTER TABLE dist_commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE dist_withdrawals DISABLE ROW LEVEL SECURITY;

-- Done! Test insert:
-- INSERT INTO distributors (name, email, phone) VALUES ('Test', 'test@gmail.com', '9999999999');
