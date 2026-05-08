import type { Metadata } from "next";

import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { WorkSnapContainer } from "@/components/work/work-snap-container";

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of 0→1 products and multi-app systems, designed and shipped.",
  alternates: {
    canonical: "/work",
  },
};

/*
 * /work — full-page snap-scroll listing of published case studies.
 *
 * Each case study occupies one 100dvh viewport slide: its coverImage fills
 * the background, a dark scrim sits above it, and the project name, tags,
 * summary, and a CTA link overlay the foreground.
 *
 * The WorkSnapContainer client island applies scroll-snap-type to the root
 * scroll container on mount (cleared on unmount) so the global layout —
 * sticky SiteHeader and SiteFooter — stays unaffected on other routes.
 *
 * The sr-only h1 satisfies heading-hierarchy and gives screen readers a
 * page-level label without duplicating the visual slide titles (h2 each).
 */
export default function WorkPage() {
  const cases = getPublishedCaseStudies();

  return (
    <main id="main-content">
      {/* Visually-hidden page title for screen readers and heading hierarchy. */}
      <h1 className="sr-only">Selected work</h1>

      <WorkSnapContainer cases={cases} />
    </main>
  );
}
