import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";

/**
 * Marketing site layout — applies to all public portfolio pages.
 *
 * Renders SiteHeader, SiteFooter, and MobileCtaBar. This chrome lives here
 * rather than in the root layout so that the authenticated client portal
 * and outreach backoffice can render their own navigation shells without
 * inheriting or overriding marketing-specific UI.
 *
 * Route group `(site)` is transparent to URLs — pages in this folder keep
 * their original routes (/, /about, /work, etc.).
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <MobileCtaBar />
    </>
  );
}
