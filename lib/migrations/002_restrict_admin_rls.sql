-- ============================================================
-- Migration 002 — Restrict admin access to a single user UUID
-- Run this in the Supabase SQL Editor AFTER finding Kendall's UUID.
-- ============================================================
-- 
-- STEP 1: Find the UUID for kendallrot@gmail.com
-- Run this query first (requires service-role access):
--
--   SELECT id, email, created_at
--   FROM auth.users
--   WHERE email = 'kendallrot@gmail.com';
--
-- Copy the UUID from the result.
--
-- STEP 2: Confirm the linked public.profiles row exists and has the
-- correct role and active status:
--
--   SELECT id, email, role, is_active, first_name, last_name
--   FROM public.profiles
--   WHERE id = '<uuid-from-step-1>';
--
-- Expected: role = 'super_admin', is_active = true.
-- If the profile is missing, insert it (see below).
-- If is_active is false, update it.
--
-- STEP 3: Replace <ADMIN_UUID> below with the real UUID, then run.
-- ============================================================

-- ── 1. Ensure the profile row is correct ─────────────────────
-- Run only if the profile row is missing:
--
-- INSERT INTO public.profiles (id, email, role, is_active, first_name, last_name)
-- VALUES (
--   '<ADMIN_UUID>',
--   'kendallrot@gmail.com',
--   'super_admin',
--   true,
--   'Kendall',
--   ''
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   role      = EXCLUDED.role,
--   is_active = EXCLUDED.is_active;

-- ── 2. Prevent any profile from self-elevating to super_admin ─
-- Users can UPDATE their own profile row (name, phone, avatar)
-- but must never be able to set role or is_active themselves.
--
-- Drop and recreate the "Own profile" policy to be column-specific.
-- Supabase column-level policies require a modern Postgres version
-- (14+). Use a row-level check expression instead:

DROP POLICY IF EXISTS "Own profile" ON public.profiles;

-- Read own profile
CREATE POLICY "Own profile read"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Update own profile — only allow changes to safe columns.
-- The USING clause still scopes to the owner; the WITH CHECK
-- clause ensures the values of role and is_active cannot change.
CREATE POLICY "Own profile update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    role      = (SELECT role      FROM public.profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
  );

-- ── 3. Restrict profiles INSERT to service role only ─────────
-- Self-registration inserts go through the handle_new_user trigger
-- (which runs as SECURITY DEFINER). Direct client inserts are blocked.
CREATE POLICY "Profiles insert service only"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false);   -- blocked for anon and authenticated roles;
                        -- triggers with SECURITY DEFINER bypass RLS.

-- ── 4. Prevent deletion of profiles ──────────────────────────
-- Profiles cascade-delete with auth.users ON DELETE CASCADE,
-- which is handled at the DB level. Block direct client deletes.
CREATE POLICY "Profiles delete blocked"
  ON public.profiles
  FOR DELETE
  USING (false);

-- ── 5. Add NEXT_PUBLIC_ADMIN_USER_ID to .env.local ───────────
-- After running the query in Step 1, add this line to .env.local
-- (use the real UUID, not the placeholder shown here):
--
--   NEXT_PUBLIC_ADMIN_USER_ID=<ADMIN_UUID>
--
-- This value is read by:
--   - proxy.ts  (server-side: blocks /admin/* for all other sessions)
--   - components/auth/StaffGuard.tsx (client-side: redirects admin
--     from customer pages; no-ops for all other users)
--
-- IMPORTANT: NEXT_PUBLIC_* values are compiled into the JS bundle
-- and visible in the browser. They act as an additional filter
-- on top of the role = 'super_admin' + is_active check, NOT as
-- a secret. The Supabase RLS policies above are the authoritative
-- server-side enforcement.

-- ── 6. Verification queries ───────────────────────────────────
-- After applying, confirm the policies are in place:
--
--   SELECT policyname, cmd, qual, with_check
--   FROM pg_policies
--   WHERE tablename = 'profiles';
--
-- Confirm only one super_admin exists:
--
--   SELECT id, email, role, is_active
--   FROM public.profiles
--   WHERE role = 'super_admin';
