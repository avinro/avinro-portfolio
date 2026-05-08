"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { getPosthog } from "@/lib/analytics/posthog";

/**
 * PageviewCapturer — listens to App Router URL changes and fires a manual
 * pageview event on every client navigation.
 *
 * App Router replaces the URL via pushState/replaceState, which does not fire
 * native browser navigation events. PostHog's built-in `capture_pageview` only
 * catches the initial load, so all subsequent client transitions are missed.
 * Placing this in a Suspense boundary is required because useSearchParams()
 * opts the subtree into dynamic rendering — Suspense prevents the rest of the
 * layout from being affected.
 */
function PageviewCapturer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ph = getPosthog();
    if (!ph) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

/**
 * PostHogProvider — mounts once in the root layout.
 *
 * Wraps PageviewCapturer in a Suspense boundary to prevent the
 * useSearchParams() call from blocking the rest of the layout during SSR.
 */
export function PostHogProvider() {
  return (
    <Suspense fallback={null}>
      <PageviewCapturer />
    </Suspense>
  );
}
