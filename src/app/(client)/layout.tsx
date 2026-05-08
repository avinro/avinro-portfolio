import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";
import { loadClientPortalContext } from "@/lib/client-portal/context";
import { ClientPortalShell } from "@/components/client/client-portal-shell";

/**
 * Client portal layout — wraps all /(client)/* pages.
 *
 * Loads the portal context (account + projects) server-side using existing
 * RLS policies from PRO-36. No backend changes required.
 *
 * Route protection is enforced upstream in proxy.ts (updateSession). By the
 * time a request reaches this layout the user is a confirmed account member.
 *
 * Renders the full portal shell: header, sidebar (md+), bottom nav (<md).
 * Falls back to bare children render if context cannot be loaded — the
 * middleware upstream ensures this only happens if Supabase is unreachable.
 */
export default async function ClientPortalLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const context = await loadClientPortalContext(supabase);

  if (!context) {
    // Defensive fallback — middleware should have rejected the request before here.
    return (
      <main id="main-content" className="flex min-h-dvh flex-col">
        {children}
      </main>
    );
  }

  return <ClientPortalShell context={context}>{children}</ClientPortalShell>;
}
