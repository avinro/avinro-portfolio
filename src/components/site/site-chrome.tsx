import type { ReactNode } from "react";

import { LenisProvider } from "@/components/site/lenis-provider";
import { RouteScrollRestore } from "@/components/site/route-scroll-restore";
import { SiteIntroGate } from "@/components/site/site-intro-gate";
import { SiteChromeShell } from "@/components/site/site-chrome-shell";

/**
 * Shared marketing chrome (header, footer, Lenis, intro gate, mobile CTA).
 * Used by the (site) layout and by the root `not-found` page so unknown URLs
 * still get the same shell as in-app navigations.
 *
 * @param minimalChrome — When true, omits SiteHeader, MobileCtaBar, and AiChatLoader
 *                        (e.g. global not-found). In-app not-found uses NotFoundPage +
 *                        useActivateMinimalSiteChrome instead.
 */
export function SiteChrome({
  children,
  minimalChrome = false,
}: {
  children: ReactNode;
  minimalChrome?: boolean;
}) {
  return (
    <LenisProvider>
      <RouteScrollRestore />
      <SiteIntroGate>
        <SiteChromeShell initialMinimalChrome={minimalChrome}>{children}</SiteChromeShell>
      </SiteIntroGate>
    </LenisProvider>
  );
}
