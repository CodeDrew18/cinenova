-- Migration: create login_attempts table
-- Apply this in the Supabase SQL editor or via psql against your project's DB.

-- Enable pgcrypto for gen_random_uuid (Supabase usually has this enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text,
  ip_address text,
  attempts_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_attempt_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_identifier_idx ON public.login_attempts(identifier);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON public.login_attempts(ip_address);

-- Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.login_attempts;
CREATE TRIGGER set_updated_at   
BEFORE UPDATE ON public.login_attempts
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
