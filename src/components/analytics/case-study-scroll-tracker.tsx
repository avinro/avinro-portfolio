"use client";

import { useEffect, useRef } from "react";

import { trackCaseStudyScroll, markThresholdFired } from "@/lib/analytics/events";
import type { ScrollThreshold } from "@/lib/analytics/events";

interface CaseStudyScrollTrackerProps {
  slug: string;
}

const THRESHOLDS: ScrollThreshold[] = [25, 50, 75, 100];

export function CaseStudyScrollTracker({ slug }: CaseStudyScrollTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const sentinels = sentinelRefs.current.filter(Boolean) as HTMLDivElement[];
    if (sentinels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sentinels.indexOf(entry.target as HTMLDivElement);
          if (idx === -1) continue;
          const threshold = THRESHOLDS[idx];
          if (markThresholdFired(slug, threshold)) {
            trackCaseStudyScroll({ slug, threshold });
          }
        }
      },
      { rootMargin: "0px 0px -10px 0px", threshold: 0 },
    );

    sentinels.forEach((s) => {
      observer.observe(s);
    });

    return () => {
      observer.disconnect();
    };
  }, [slug]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none relative"
      style={{ height: "100%" }}
    >
      {THRESHOLDS.map((threshold, i) => (
        <div
          key={threshold}
          ref={(el) => {
            sentinelRefs.current[i] = el;
          }}
          data-scroll-sentinel={threshold}
          className="absolute left-0 w-px"
          style={{ top: `${String(threshold)}%`, height: "1px" }}
        />
      ))}
    </div>
  );
}
