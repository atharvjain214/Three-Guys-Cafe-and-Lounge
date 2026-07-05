/*
# Fix is_admin() RLS Permissions

## Summary
The previous security fix revoked EXECUTE on `is_admin()` from `anon`, which broke
RLS policies that reference `is_admin()` in their USING clauses. When an unauthenticated
(anon) request hits any table with a policy like `USING (... OR is_admin())`, the RLS
engine calls `is_admin()` as the anon role — and the permission denial surfaces as a
toast error in the UI.

## Root Cause
Revoking EXECUTE from `anon` on `is_admin()` prevents RLS from evaluating policies
that call the function for anon requests. The RLS engine cannot bypass this.

## Fix
Re-grant EXECUTE to `anon` so RLS works correctly. The REST API exposure (`/rest/v1/rpc/is_admin`)
is a separate concern — it is mitigated by the function itself: `is_admin()` checks
`auth.uid() = user_id` in the user_roles table. For an anon caller, `auth.uid()` is
NULL, so the function always returns FALSE. There is no data leakage or privilege escalation.

## Security Impact
- `anon` calling `is_admin()` via REST will always get `false` (no session = no admin)
- No sensitive data is exposed by this function
- Keeping `anon` EXECUTE is required for RLS correctness on tables with `is_admin()` policies

## Changes
Re-grant EXECUTE on `is_admin()` to `anon`.
*/

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
