"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackCtaClick, trackWorkCardClick } from "@/lib/analytics/events";
import type { CtaPosition, WorkCardSource } from "@/lib/analytics/events";

export function AnalyticsClickDelegator() {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const ctaEl = target.closest("[data-cta-position]");
      if (ctaEl instanceof HTMLElement) {
        const label = ctaEl.dataset.ctaLabel ?? "";
        const href = ctaEl.dataset.ctaHref ?? "";
        const position = ctaEl.dataset.ctaPosition as CtaPosition;
        trackCtaClick({ label, href, position, page: pathname });
        return;
      }

      const cardEl = target.closest("[data-work-card-slug]");
      if (cardEl instanceof HTMLElement) {
        const slug = cardEl.dataset.workCardSlug ?? "";
        const title = cardEl.dataset.workCardTitle ?? "";
        const source = cardEl.dataset.workCardSource as WorkCardSource;
        trackWorkCardClick({ slug, title, source });
      }
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname]);

  return null;
}
