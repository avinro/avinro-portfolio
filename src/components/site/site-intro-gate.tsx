"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { IntroOpener } from "@/components/site/intro-opener";
import { useLenis } from "@/components/site/lenis-provider";
import { clearIntroPendingMark } from "@/lib/intro/block-first-paint";
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

function getIntroGateSnapshot(): GateState {
  return sessionStorage.getItem(INTRO_SEEN_SESSION_KEY) ? "ready" : "intro";
}

function getIntroGateServerSnapshot(): GateState {
  return "ready";
}

interface SiteIntroGateProps {
  children: ReactNode;
}

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const state = useSyncExternalStore(
    subscribeIntroGate,
    getIntroGateSnapshot,
    getIntroGateServerSnapshot,
  );
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (state === "ready") {
      clearIntroPendingMark();
    }
  }, [state]);

  useEffect(() => {
    if (state !== "ready" || !lenis) return;
    scheduleRefreshLenisBounds(lenis);
  }, [state, lenis]);

  const handleIntroComplete = () => {
    sessionStorage.setItem(INTRO_SEEN_SESSION_KEY, "1");
    sessionStorage.setItem(INTRO_JUST_COMPLETED_SESSION_KEY, "1");
    clearIntroPendingMark();
    notifyIntroGateChange();
  };

  if (state === "intro") {
    return <IntroOpener onComplete={handleIntroComplete} />;
  }

  return <>{children}</>;
}
