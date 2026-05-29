import type { ReactNode } from "react";

import { LenisProvider } from "@/components/site/lenis-provider";
import { MediaGuard } from "@/components/site/media-guard";
import { RouteScrollRestore } from "@/components/site/route-scroll-restore";
import { SiteIntroGate } from "@/components/site/site-intro-gate";
import { SiteChromeShell } from "@/components/site/site-chrome-shell";
import { PageTransition } from "@/components/site/page-transition";

export function SiteChrome({
  children,
  minimalChrome = false,
}: {
  children: ReactNode;
  minimalChrome?: boolean;
}) {
  return (
    <LenisProvider>
      <MediaGuard />
      <RouteScrollRestore />
      <SiteIntroGate>
        <PageTransition />
        <SiteChromeShell initialMinimalChrome={minimalChrome}>{children}</SiteChromeShell>
      </SiteIntroGate>
    </LenisProvider>
  );
}
