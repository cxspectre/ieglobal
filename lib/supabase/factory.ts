import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client factories that read environment variables at call time.
 *
 * Never build a client at module scope: `next build` evaluates route modules
 * while collecting page data, so a missing env var would abort the whole
 * build instead of surfacing as a runtime error for a single request.
 */

const MISSING_ADMIN_CONFIG_MESSAGE =
  'Supabase admin client is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.';

function readSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

/** Service-role client for privileged API routes. Throws a clear error when unconfigured. */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = readSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(MISSING_ADMIN_CONFIG_MESSAGE);
  }
  return createClient(url, serviceRoleKey);
}

/** Anon-key client for public reads. Returns null when Supabase is not configured. */
export function tryCreatePublicSupabaseClient(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

/** Server-side reads that prefer the service role and fall back to anon. Returns null when unconfigured. */
export function tryCreateServerReadClient(): SupabaseClient | null {
  const url = readSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
