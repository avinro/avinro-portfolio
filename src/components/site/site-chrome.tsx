import type { ReactNode } from "react";

import { LenisProvider } from "@/components/site/lenis-provider";
import { MediaGuard } from "@/components/site/media-guard";
import { RouteScrollRestore } from "@/components/site/route-scroll-restore";
import { SiteIntroGate } from "@/components/site/site-intro-gate";
import { SiteChromeShell } from "@/components/site/site-chrome-shell";

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
        <SiteChromeShell initialMinimalChrome={minimalChrome}>{children}</SiteChromeShell>
      </SiteIntroGate>
    </LenisProvider>
  );
}
