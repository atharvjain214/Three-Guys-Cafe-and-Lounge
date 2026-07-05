/**
 * Server-side Supabase client using @supabase/server.
 *
 * This module is for use in Supabase Edge Functions (Deno runtime) and any
 * server-side context where the service role key is available. It must NEVER
 * be imported into client-side Vite code — Vite only exposes VITE_-prefixed
 * env vars to the browser, so importing this from a component would fail.
 *
 * In Edge Functions, the environment variables are injected automatically:
 *   - SUPABASE_URL
 *   - SUPABASE_PUBLISHABLE_KEY (anon/publishable)
 *   - SUPABASE_SECRET_KEY (service role, server-only)
 *
 * For local development, these are read from .env (non-VITE_ prefixed).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createServerClient(authToken?: string) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = authToken ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

  if (!url || !key) {
    throw new Error("Missing server Supabase environment variables");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    },
  });
}

export function createServiceClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SECRET_KEY") ?? "";

  if (!url || !key) {
    throw new Error("Missing SUPABASE_SECRET_KEY — required for service-level operations");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
