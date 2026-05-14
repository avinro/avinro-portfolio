"use client";

import dynamic from "next/dynamic";

/*
 * Client-side loader for AboutPortraitCard.
 *
 * next/dynamic with ssr: false must live inside a Client Component — Server
 * Components do not support it. This thin wrapper owns the dynamic import so
 * the About page (Server Component) can render it without triggering the
 * Next.js build error.
 *
 * ssr: false prevents Motion hooks (useMotionValue, useSpring) from running
 * during server-side rendering and in renderToStaticMarkup test contexts.
 */
const AboutPortraitCard = dynamic(
  () => import("@/components/site/about-portrait-card").then((m) => m.AboutPortraitCard),
  { ssr: false },
);

export function AboutPortraitCardLoader() {
  return <AboutPortraitCard />;
}
