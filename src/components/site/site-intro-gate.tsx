"use client";

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { IntroOpener } from "@/components/site/intro-opener";
import { useLenis } from "@/components/site/lenis-provider";
import { clearIntroCheckingMark, isIntroHomePath } from "@/lib/intro/block-first-paint";
import { INTRO_JUST_COMPLETED_SESSION_KEY, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

type GateState = "intro" | "ready";

const introGateListeners = new Set<() => void>();

function subscribeIntroGate(onStoreChange: () => void) {
  introGateListeners.add(onStoreChange);
  return () => {
    introGateListeners.delete(onStoreChange);
  };
}

function notifyIntroGateChange() {
  introGateListeners.forEach((listener) => {
    listener();
  });
}

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) === "1";
  } catch {
    return true;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
  } catch {
    return;
  }
}

function markIntroJustCompleted(): void {
  try {
    sessionStorage.setItem(INTRO_JUST_COMPLETED_SESSION_KEY, "1");
  } catch {
    return;
  }
}

function getIntroGateServerSnapshot(): GateState {
  return "ready";
}

interface SiteIntroGateProps {
  children: ReactNode;
}

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const pathname = usePathname();
  const getIntroGateSnapshot = useCallback<() => GateState>(() => {
    if (hasSeenIntro()) return "ready";
    return isIntroHomePath(pathname) ? "intro" : "ready";
  }, [pathname]);

  const state = useSyncExternalStore(
    subscribeIntroGate,
    getIntroGateSnapshot,
    getIntroGateServerSnapshot,
  );
  const lenis = useLenis();

  useEffect(() => {
    if (state === "ready" && !isIntroHomePath(pathname)) {
      markIntroSeen();
    }
  }, [pathname, state]);

  useLayoutEffect(() => {
    clearIntroCheckingMark();
  }, [state]);

  useEffect(() => {
    if (state !== "ready" || !lenis) return;
    scheduleRefreshLenisBounds(lenis);
  }, [state, lenis]);

  const handleIntroComplete = () => {
    markIntroSeen();
    markIntroJustCompleted();
    clearIntroCheckingMark();
    notifyIntroGateChange();
  };

  if (state === "intro") {
    return <IntroOpener onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
