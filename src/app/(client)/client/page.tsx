import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { loadClientPortalContext } from "@/lib/client-portal/context";

export const metadata: Metadata = {
  title: "Dashboard — Client Portal",
  robots: { index: false },
};

/**
 * /client — Client portal dashboard.
 *
 * Shows the active project summary or an empty state when the account has
 * no projects yet. Navigation and authentication chrome come from the
 * ClientPortalShell rendered in the parent layout.
 *
 * Route protection is enforced upstream in proxy.ts (updateSession).
 */
export default async function ClientPage() {
  const supabase = await createClient();
  const context = await loadClientPortalContext(supabase);

  if (!context) return null;

  if (!context.hasProjects) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-card border-border max-w-sm rounded-xl border p-8 shadow-sm">
          <h1 className="text-foreground text-xl font-bold">No projects yet</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your project hasn&apos;t started yet. Your project owner will set things up and
            you&apos;ll see updates here.
          </p>
          {context.user.email && (
            <p className="text-muted-foreground mt-4 text-xs">
              Need help?{" "}
              <a
                href={`mailto:${context.user.email}`}
                className="text-accent underline underline-offset-4 hover:no-underline"
              >
                Contact your project owner
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  const project = context.activeProject;
  if (!project) return null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Page heading */}
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {context.account.name}
        </p>
        <h1 className="text-foreground text-2xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Current phase:{" "}
          <span className="text-foreground font-medium capitalize">
            {project.currentPhase.split("_").join(" ")}
          </span>
        </p>
      </div>

      {/* Placeholder project summary card */}
      <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Project details, milestones and deliverables are coming soon in the next release.
        </p>
      </div>
    </div>
  );
}
