"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

import { getPosthog } from "@/lib/analytics/posthog";

function PostHogInit() {
  useEffect(() => {
    getPosthog();
  }, []);

  return null;
}

function PageviewCapturer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ph = getPosthog();
    if (!ph) return;

    const qs = searchParams.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider() {
  return (
    <>
      <PostHogInit />
      <Suspense fallback={null}>
        <PageviewCapturer />
      </Suspense>
    </>
  );
}
