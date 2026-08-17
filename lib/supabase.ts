import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Server-only Supabase client using the service_role key.
 *
 * Every table has RLS enabled with no policies, so this key is the only way
 * in — which is exactly why it must never reach the browser. Nothing here is
 * imported from a client component, and "server-only" makes that a build
 * error rather than a leak.
 *
 * Typed against lib/database.types.ts, which mirrors supabase/schema.sql by
 * hand — supabase-js resolves untyped tables to `never`, so an untyped client
 * makes every insert a compile error.
 */
type Client = SupabaseClient<Database, "public">;

let client: Client | null = null;

export function db(): Client {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required — copy .env.example to .env.local and fill them in.",
    );
  }

  client = createClient<Database, "public">(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

export function isConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
