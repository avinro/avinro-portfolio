import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/navigation so usePathname is controllable in node env
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/client"),
}));

// Mock next/link as a plain anchor so renderToStaticMarkup works
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Stub SidebarMenuButton so sidebar variant renders a plain button wrapper
vi.mock("@/components/ui/sidebar", () => ({
  SidebarMenuButton: ({
    children,
    isActive,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    asChild,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tooltip,
    ...props
  }: {
    children: React.ReactNode;
    isActive?: boolean;
    asChild?: boolean;
    tooltip?: string;
  } & React.ComponentProps<"button">) => (
    <button data-active={isActive} {...props}>
      {children}
    </button>
  ),
}));

import { ClientPortalNavLink } from "./client-portal-nav-link";

const { usePathname } = await import("next/navigation");
const mockUsePathname = vi.mocked(usePathname);

/*
 * Tests for ClientPortalNavLink — active state and accessibility.
 *
 * Covers:
 * - aria-current="page" present on active links, absent on inactive
 * - data-active attribute matches active state
 * - Visible focus-ring classes present (regression guard)
 * - Both "sidebar" and "bottom" variants behave correctly
 * - Sub-path matching: /client/projects is active for href="/client/projects"
 */
describe("ClientPortalNavLink — bottom variant", () => {
  const renderLink = (href: string) =>
    renderToStaticMarkup(
      <ClientPortalNavLink
        href={href}
        label="Dashboard"
        icon={<span data-testid="icon" />}
        variant="bottom"
      />,
    );

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/client");
  });

  it("marks the exact matching route as active (aria-current + data-active)", () => {
    const html = renderLink("/client");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-active="true"');
  });

  it("does not mark a non-matching route as active", () => {
    const html = renderLink("/client/projects");
    expect(html).not.toContain('aria-current="page"');
    expect(html).not.toContain('data-active="true"');
  });

  it("marks a sub-path as active when pathname starts with href/", () => {
    mockUsePathname.mockReturnValue("/client/projects/abc");
    const html = renderLink("/client/projects");
    expect(html).toContain('aria-current="page"');
  });

  it("renders the label text", () => {
    const html = renderLink("/client");
    expect(html).toContain("Dashboard");
  });

  it("has focus-visible ring classes (keyboard visibility regression guard)", () => {
    const html = renderLink("/client");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-ring");
  });
});

describe("ClientPortalNavLink — sidebar variant", () => {
  const renderSidebarLink = (href: string) =>
    renderToStaticMarkup(
      <ClientPortalNavLink
        href={href}
        label="Projects"
        icon={<span data-testid="icon" />}
        variant="sidebar"
      />,
    );

  beforeEach(() => {
    mockUsePathname.mockReturnValue("/client/projects");
  });

  it("marks the active sidebar item", () => {
    const html = renderSidebarLink("/client/projects");
    expect(html).toContain('aria-current="page"');
  });

  it("does not mark inactive sidebar items", () => {
    const html = renderSidebarLink("/client/files");
    expect(html).not.toContain('aria-current="page"');
  });

  it("passes isActive to SidebarMenuButton (data-active on stub wrapper)", () => {
    const html = renderSidebarLink("/client/projects");
    expect(html).toContain('data-active="true"');
  });
});
