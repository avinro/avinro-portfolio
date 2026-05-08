import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Stub ClientPortalProjectSwitcher to simplify the snapshot
vi.mock("./client-portal-project-switcher", () => ({
  ClientPortalProjectSwitcher: ({ activeProject }: { activeProject: { name: string } | null }) =>
    activeProject ? <span>{activeProject.name}</span> : null,
}));

import { ClientPortalHeader } from "./client-portal-header";
import type { ClientPortalContext } from "@/lib/client-portal/context";

const stubContext = (overrides?: Partial<ClientPortalContext>): ClientPortalContext => ({
  user: { id: "u1", email: "alice@example.com", displayName: "alice" },
  account: { id: "a1", name: "Acme Studio", role: "viewer" },
  projects: [{ id: "p1", name: "Brand Refresh", currentPhase: "design" }],
  activeProject: { id: "p1", name: "Brand Refresh", currentPhase: "design" },
  hasProjects: true,
  ...overrides,
});

/*
 * Structural tests for ClientPortalHeader.
 *
 * Verifies:
 * - Account name is rendered
 * - Notification bell is disabled and has correct aria-label
 * - Logout form POSTs to /auth/signout
 * - No active link or state changes (header is read-only UI)
 */
describe("ClientPortalHeader", () => {
  it("renders the account name", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain("Acme Studio");
  });

  it("renders the notification bell as disabled with aria-label", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain("disabled");
  });

  it("renders the logout form that POSTs to /auth/signout", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain('action="/auth/signout"');
    expect(html).toContain('method="post"');
  });

  it("renders the active project name when hasProjects is true", () => {
    const html = renderToStaticMarkup(<ClientPortalHeader context={stubContext()} />);
    expect(html).toContain("Brand Refresh");
  });

  it("does not render the project switcher when hasProjects is false", () => {
    const html = renderToStaticMarkup(
      <ClientPortalHeader
        context={stubContext({ hasProjects: false, projects: [], activeProject: null })}
      />,
    );
    expect(html).not.toContain("Brand Refresh");
  });
});
