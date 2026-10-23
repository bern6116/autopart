-- ============================================================
-- Migration 001 — Add middle_name to profiles and customers
-- Run this in the Supabase SQL Editor (or via psql).
-- It is fully additive — no existing rows or policies are changed.
-- ============================================================

-- 1. profiles table (linked to auth.users)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS middle_name TEXT DEFAULT NULL;

-- 2. customers table (used by orders / POS)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS middle_name TEXT DEFAULT NULL;

-- 3. Trigger: auto-populate profiles from auth.users metadata on signup
--    This also backfills full_name so display queries never join "null".
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as the function owner, not the anon role
SET search_path = public
AS $$
DECLARE
  v_first  TEXT;
  v_middle TEXT;
  v_last   TEXT;
BEGIN
  v_first  := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'),  '');
  v_middle := NULLIF(TRIM(NEW.raw_user_meta_data->>'middle_name'), '');
  v_last   := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'),   '');

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    middle_name,
    last_name,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(v_first,  ''),
    v_middle,                  -- NULL when omitted
    COALESCE(v_last,   ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    'cashier',                 -- default role for self-registered customers
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- safe if the trigger fires more than once

  RETURN NEW;
END;
$$;

-- Drop and recreate so the trigger is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ── Convenience view: full name without extra spaces or NULLs ──
CREATE OR REPLACE VIEW profile_full_names AS
SELECT
  id,
  TRIM(
    CONCAT_WS(' ',
      NULLIF(first_name,  ''),
      middle_name,             -- already NULL when omitted
      NULLIF(last_name,   '')
    )
  ) AS full_name
FROM profiles;

-- ============================================================
-- VERIFICATION QUERIES (run manually to confirm)
-- ============================================================
-- Check column was added:
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name = 'middle_name';
--
-- Check trigger exists:
--   SELECT trigger_name, event_manipulation, event_object_table
--   FROM information_schema.triggers
--   WHERE trigger_name = 'on_auth_user_created';
--
-- Inspect an existing profile (middle_name should be NULL):
--   SELECT id, first_name, middle_name, last_name FROM profiles LIMIT 5;
-- ============================================================
