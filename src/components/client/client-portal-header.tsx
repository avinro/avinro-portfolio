import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientPortalProjectSwitcher } from "./client-portal-project-switcher";
import type { ClientPortalContext } from "@/lib/client-portal/context";

interface ClientPortalHeaderProps {
  context: ClientPortalContext;
}

/**
 * Sticky portal header.
 *
 * Displays: account name, active project switcher, dummy notification bell,
 * and a logout form that posts to /auth/signout.
 *
 * Notification bell is a disabled visual placeholder. No badge, no popover.
 * Replace the TODO(notifications) block when the real notifications issue ships.
 *
 * The logout uses a native <form> POST (not a client-side action) so it works
 * without JS and avoids importing client-side auth code in a server component.
 */
export function ClientPortalHeader({ context }: ClientPortalHeaderProps) {
  return (
    <header className="bg-background border-border sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4">
      {/* Account and project identity */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-muted-foreground hidden shrink-0 text-xs font-semibold tracking-wider uppercase sm:block">
          {context.account.name}
        </span>

        {context.hasProjects && (
          <>
            <span className="text-muted-foreground hidden text-xs sm:block" aria-hidden="true">
              /
            </span>
            <ClientPortalProjectSwitcher
              projects={context.projects}
              activeProject={context.activeProject}
            />
          </>
        )}

        {/* Mobile: show account name when no project label is available */}
        {!context.hasProjects && (
          <span className="text-foreground truncate text-sm font-semibold sm:hidden">
            {context.account.name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* TODO(notifications): replace with real notification popover */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          disabled
          className="text-muted-foreground"
        >
          <Bell aria-hidden="true" />
        </Button>

        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut aria-hidden="true" />
          </Button>
        </form>
      </div>
    </header>
  );
}
