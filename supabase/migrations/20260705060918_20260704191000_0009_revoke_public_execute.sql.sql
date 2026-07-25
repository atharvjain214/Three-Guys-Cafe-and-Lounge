/*
# Security Fixes — Revoke PUBLIC EXECUTE on SECURITY DEFINER Functions

## Summary
The previous migration revoked EXECUTE from `anon` and `authenticated` explicitly,
but the functions also had a `PUBLIC` grant (`=X/postgres` in proacl) which implicitly
grants EXECUTE to all roles including anon and authenticated. This migration revokes
EXECUTE from PUBLIC on the three functions that should only be callable by edge
functions via the service role key.

## Functions Fixed
1. `public.create_order(jsonb)` — revoke PUBLIC EXECUTE
2. `public.check_reservation_conflict(date, text, int)` — revoke PUBLIC EXECUTE
3. `public.log_activity(uuid, text, text, uuid, text, jsonb)` — revoke PUBLIC EXECUTE

## Not Changed
- `public.is_admin()` — retains explicit anon+authenticated EXECUTE because RLS
  policies reference it in USING clauses. The RLS engine invokes the function as
  the requesting role (anon or authenticated), so it must have EXECUTE. The function
  safely returns false for unauthenticated callers (auth.uid() is NULL).

## Security Impact
After this migration, only `postgres` and `service_role` can execute the three
functions. Clients (anon, authenticated) can no longer call them via
`/rest/v1/rpc/...`. Edge functions using the service role key continue to work.
*/

REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_reservation_conflict(date, text, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_activity(uuid, text, text, uuid, text, jsonb) FROM PUBLIC;
