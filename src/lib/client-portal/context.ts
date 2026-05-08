import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ClientPortalContext {
  user: { id: string; email: string | null; displayName: string };
  account: { id: string; name: string; role: "admin" | "member" | "viewer" };
  projects: { id: string; name: string; currentPhase: string }[];
  activeProject: { id: string; name: string; currentPhase: string } | null;
  hasProjects: boolean;
}

/**
 * Loads the minimum data needed to render the client portal shell.
 *
 * Account selection: when a user belongs to multiple accounts, the first
 * confirmed membership ordered by (joined_at asc, created_at asc) is used.
 * This is a v1 default — a future issue will add explicit account switching.
 *
 * Active project: first project ordered by created_at asc. A future issue
 * will replace this with a URL-param or cookie-persisted selection once
 * per-project routes ship.
 *
 * This function is server-only and uses the authenticated Supabase server
 * client. All queries run under the user's session so existing RLS policies
 * (from PRO-36) enforce row visibility — no extra auth checks are needed here.
 * No changes to migrations, RLS, middleware, or auth helpers are required.
 */
export async function loadClientPortalContext(
  supabase: SupabaseClient,
): Promise<ClientPortalContext | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  // Single batched query: membership + account in one round-trip.
  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select(
      `
      role,
      joined_at,
      account_id,
      account:accounts!inner ( id, name )
    `,
    )
    .not("joined_at", "is", null)
    .order("joined_at", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) return null;

  // Supabase types the !inner embed as an array in the TS type, but at
  // runtime it returns a single object because of the LIMIT 1 + maybeSingle.
  // Cast to unknown first to satisfy the type checker.
  const accountEmbed = membership.account as unknown;
  const accountRaw = (Array.isArray(accountEmbed) ? accountEmbed[0] : accountEmbed) as {
    id: string;
    name: string;
  } | null;
  if (!accountRaw) return null;

  // Second round-trip: projects for this account, ordered by creation date.
  const { data: projectsRaw, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, current_phase")
    .eq("account_id", (membership.account_id as string | null) ?? "")
    .order("created_at", { ascending: true });

  if (projectsError) return null;

  interface ProjectRow {
    id: string;
    name: string;
    current_phase: string;
  }
  const rows = (projectsRaw as ProjectRow[] | null) ?? [];
  const projects = rows.map((p) => ({
    id: p.id,
    name: p.name,
    currentPhase: p.current_phase,
  }));

  const activeProject = projects[0]
    ? { id: projects[0].id, name: projects[0].name, currentPhase: projects[0].currentPhase }
    : null;

  const role = membership.role as string as "admin" | "member" | "viewer";

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      displayName: user.email?.split("@")[0] ?? "Client",
    },
    account: {
      id: accountRaw.id,
      name: accountRaw.name,
      role,
    },
    projects,
    activeProject,
    hasProjects: projects.length > 0,
  };
}
