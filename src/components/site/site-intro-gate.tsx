"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";

import { IntroOpener } from "@/components/site/intro-opener";
import { useLenis } from "@/components/site/lenis-provider";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

// ---------------------------------------------------------------------------
// SiteIntroGate
//
// Hard render gate for the first-session intro experience.
//
// State machine:
//   Initial render is always "ready" (matches SSR) to avoid hydration mismatch.
//   useLayoutEffect reads sessionStorage and switches to "intro" before paint
//   when the intro has not been seen this session.
//   - "intro"     — first visit: renders IntroOpener only
//   - "ready"     — returning visit OR after intro completes: mounts children
//
// Session keys:
//   avinro:intro-seen          — set when intro completes; persists for the
//                                session to skip the intro on subsequent visits.
//   avinro:intro-just-completed — one-shot flag read by template.tsx to skip
//                                 its page-enter animation on the first mount
//                                 right after intro (avoids a double-animation).
// ---------------------------------------------------------------------------

const SESSION_KEY = "avinro:intro-seen";
const JUST_COMPLETED_KEY = "avinro:intro-just-completed";

type GateState = "intro" | "ready";

interface SiteIntroGateProps {
  children: ReactNode;
}

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const [state, setState] = useState<GateState>("ready");
  const lenis = useLenis();

  useLayoutEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      // Sync before paint to avoid SSR markup mismatch while still honoring session.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional gate flip
      setState("intro");
    }
  }, []);

  // Lenis may initialize while only the intro is mounted; remeasure once the site tree mounts.
  useEffect(() => {
    if (state !== "ready" || !lenis) return;
    scheduleRefreshLenisBounds(lenis);
  }, [state, lenis]);

  const handleIntroComplete = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    sessionStorage.setItem(JUST_COMPLETED_KEY, "1");
    setState("ready");
  };

  if (state === "intro") {
    return <IntroOpener onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
