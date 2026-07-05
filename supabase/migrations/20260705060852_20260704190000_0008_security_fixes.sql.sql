/*
# Security Fixes — RLS, Storage, and Function Permissions

## Summary
Fixes 14 security issues identified by the Supabase security scanner:

1. **analytics_events INSERT policy** — `WITH CHECK (true)` allowed unrestricted
   inserts. Replaced with an ownership check so users can only insert their own events.
2. **5 public bucket SELECT policies** — Broad SELECT policies on `storage.objects`
   for `avatars`, `events`, `food-images`, `gallery`, `marketing-assets` allowed
   clients to list all files in each bucket. Dropped these policies entirely —
   public bucket objects are accessible via their public URLs without RLS policies,
   and listing is not needed for URL access.
3. **3 SECURITY DEFINER functions executable by anon/authenticated** —
   `create_order`, `check_reservation_conflict`, and `log_activity` were callable
   via `/rest/v1/rpc/...` by any client. Revoked EXECUTE from anon and authenticated
   since these are only called by edge functions using the service role key.
   `is_admin()` is intentionally left executable by anon/authenticated because RLS
   policies reference it in their USING clauses — the RLS engine invokes the function
   as the requesting role, so it must retain EXECUTE for both roles. `is_admin()`
   safely returns `false` for unauthenticated callers since `auth.uid()` is NULL.

## Security Impact
- Analytics events can no longer be spoofed with arbitrary user_id values
- Storage bucket contents can no longer be enumerated by unauthenticated clients
- Order creation, reservation conflict checks, and audit logging can no longer be
  triggered directly via the REST API by clients — only edge functions with the
  service role key can invoke these functions
- `is_admin()` remains callable but returns false for anon (no data leakage)

## Changes
1. Drop and recreate `insert_analytics_events` policy with ownership check
2. Drop 5 `public_read_*` SELECT policies on `storage.objects`
3. Revoke EXECUTE on `create_order`, `check_reservation_conflict`, `log_activity` from anon and authenticated
*/

-- ============================================================
-- 1. Fix analytics_events INSERT policy
-- ============================================================

DROP POLICY IF EXISTS "insert_analytics_events" ON public.analytics_events;

CREATE POLICY "insert_analytics_events" ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ============================================================
-- 2. Drop broad SELECT policies on public storage buckets
-- ============================================================
-- Public bucket objects are accessible via their public URLs without
-- any RLS policy. These SELECT policies only enabled bucket listing
-- via the storage API, which exposed file metadata to any client.

DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
DROP POLICY IF EXISTS "public_read_events" ON storage.objects;
DROP POLICY IF EXISTS "public_read_food_images" ON storage.objects;
DROP POLICY IF EXISTS "public_read_gallery" ON storage.objects;
DROP POLICY IF EXISTS "public_read_marketing" ON storage.objects;

-- ============================================================
-- 3. Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
-- ============================================================
-- These functions are only called by edge functions using the service
-- role key. Revoking EXECUTE from anon and authenticated prevents direct
-- invocation via /rest/v1/rpc/... by clients.
--
-- is_admin() is intentionally NOT revoked — RLS policies reference it
-- in USING clauses, and the RLS engine invokes it as the requesting
-- role (anon or authenticated). Revoking would break all public reads.

REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_reservation_conflict(date, text, int) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_activity(uuid, text, text, uuid, text, jsonb) FROM anon, authenticated;
