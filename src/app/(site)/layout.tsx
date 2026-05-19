import type { ReactNode } from "react";

import { SiteChrome } from "@/components/site/site-chrome";

/**
 * Marketing site layout — applies to all public portfolio pages.
 *
 * Structure:
 *   LenisProvider   — smooth scroll + GSAP ScrollTrigger sync (>=md only)
 *   RouteScrollRestore — scroll to top on pathname change (Lenis + native)
 *   SiteIntroGate   — hard render gate for the first-session intro.
 *                     On first visit: renders only the intro overlay; the site
 *                     tree is not mounted until the intro completes.
 *                     On return visits: mounts the site tree immediately.
 *   SiteHeader      — z-40, sticky top
 *   SiteFooter      — z-0, fixed bottom (curtain effect; revealed as content scrolls away)
 *   main            — z-10, bg-background; sits above footer, scrolls normally
 *   MobileCtaBar    — z-40, fixed bottom on mobile
 *
 * Layer scale:
 *   z-0   SiteFooter curtain
 *   z-10  Content wrapper (main)
 *   z-40  SiteHeader, MobileCtaBar
 *   z-70  SiteIntroGate checking surface / IntroOpener
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
