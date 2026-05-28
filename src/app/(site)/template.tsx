"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";

import { INTRO_JUST_COMPLETED_SESSION_KEY } from "@/lib/intro/constants";

export default function SiteTemplate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const introJustCompleted = sessionStorage.getItem(INTRO_JUST_COMPLETED_SESSION_KEY);
    if (introJustCompleted) {
      sessionStorage.removeItem(INTRO_JUST_COMPLETED_SESSION_KEY);
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}
