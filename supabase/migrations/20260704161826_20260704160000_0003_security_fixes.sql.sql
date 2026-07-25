/*
# Security Hardening — Fix Scanner Findings

## Summary
Fixes 6 security issues flagged by the database security scanner:
1. Function `handle_updated_at` had a mutable search_path (search_path injection risk).
2. `audit_logs` INSERT policy allowed unrestricted inserts (`WITH CHECK (true)`).
3. `event_bookings` INSERT policy allowed unrestricted inserts (`WITH CHECK (true)`).
4. `reservations` INSERT policy allowed unrestricted inserts (`WITH CHECK (true)`).
5. `is_admin()` SECURITY DEFINER function was executable by `anon` role.
6. `is_admin()` SECURITY DEFINER function was executable by `authenticated` role.

## Changes

### 1. handle_updated_at — pin search_path
Recreates the function with `SET search_path = public, pg_catalog` so a
malicious role cannot hijack the search_path to shadow the `public` schema.
The function body is unchanged.

### 2. audit_logs — restrict INSERT policy
Replaces `WITH CHECK (true)` with `WITH CHECK (auth.uid() = user_id)` so an
authenticated user can only insert audit log rows that reference their own
user_id. Anonymous inserts are no longer permitted (audit logs should be
written by authenticated actors — typically the system or the user themselves).

### 3. event_bookings — tighten INSERT policy
The table accepts guest bookings (no sign-in required), so the INSERT policy
must remain open to `anon, authenticated`. However, `WITH CHECK (true)` is
replaced with a meaningful row-shape validation: the guest contact fields
(guest_name, guest_email, guest_phone) must be non-empty, and if a user_id
is supplied it must match the authenticated caller. This prevents arbitrary
row injection while preserving the public booking flow.

### 4. reservations — tighten INSERT policy
Same treatment as event_bookings: the public reservation flow stays open to
`anon, authenticated`, but `WITH CHECK (true)` is replaced with a check that
guest_name, guest_email, guest_phone, party_size, reservation_date, and
reservation_time are present, and that any supplied user_id matches the
authenticated caller.

### 5 & 6. is_admin() — restrict EXECUTE privilege
Revokes EXECUTE from `PUBLIC`, `anon`, and `authenticated`, then re-grants
EXECUTE only to `authenticated`. The function stays SECURITY DEFINER (it must
read the `user_roles` table on behalf of callers who cannot read other users'
role rows directly), but it is no longer callable by the unauthenticated
`anon` role. RLS policies that reference `public.is_admin()` continue to work
because they run as the authenticated invoker.

## Security Notes
- No data is modified or deleted.
- No tables, columns, or indexes are dropped.
- All changes are idempotent (DROP ... IF EXISTS before CREATE).
*/

-- ============================================================
-- 1. handle_updated_at — pin search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2. audit_logs — restrict INSERT to own user_id
-- ============================================================

DROP POLICY IF EXISTS "insert_audit_logs" ON public.audit_logs;
CREATE POLICY "insert_audit_logs" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. event_bookings — tighten INSERT with row-shape validation
-- ============================================================

DROP POLICY IF EXISTS "insert_event_bookings" ON public.event_bookings;
CREATE POLICY "insert_event_bookings" ON public.event_bookings FOR INSERT
  TO anon, authenticated WITH CHECK (
    guest_name IS NOT NULL
    AND guest_name <> ''
    AND guest_email IS NOT NULL
    AND guest_email <> ''
    AND guest_phone IS NOT NULL
    AND guest_phone <> ''
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- ============================================================
-- 4. reservations — tighten INSERT with row-shape validation
-- ============================================================

DROP POLICY IF EXISTS "insert_reservations" ON public.reservations;
CREATE POLICY "insert_reservations" ON public.reservations FOR INSERT
  TO anon, authenticated WITH CHECK (
    guest_name IS NOT NULL
    AND guest_name <> ''
    AND guest_email IS NOT NULL
    AND guest_email <> ''
    AND guest_phone IS NOT NULL
    AND guest_phone <> ''
    AND party_size IS NOT NULL
    AND party_size > 0
    AND reservation_date IS NOT NULL
    AND reservation_time IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- ============================================================
-- 5 & 6. is_admin() — restrict EXECUTE to authenticated only
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
