import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "./env";

// Singleton avoids duplicate auth listeners and storage races across React renders.
let client: SupabaseClient | undefined;

export function createClient(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    isSingleton: true,
    auth: {
      // Match server.ts and middleware.ts — see server.ts for the rationale.
      // All Supabase clients in this app must share the same flow type or
      // session cookies set by one will not be read by another.
      flowType: "implicit",
    },
  });

  return client;
}
