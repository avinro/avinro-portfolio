/**
 * CaseStudyBody — two-column layout wrapper for case study pages.
 *
 * Renders a sticky TOC sidebar on the left and the article content on the
 * right. Falls back to a single-column layout when the TOC has fewer than
 * 2 headings (drafts, stubs, or very short case studies).
 *
 * Column proportions (lg+):
 *   Left  — 14 rem  (TOC sidebar)
 *   Right — 1fr     (article content, all remaining space)
 *
 * Mobile-first: base styles are flex-col (single column), lg overrides to
 * the two-column grid.
 */

import type { ReactNode } from "react";
import type { TocHeading } from "@/lib/content/toc";
import { TocSidebar } from "./toc-sidebar";
import { cn } from "@/lib/utils";

interface CaseStudyBodyProps {
  headings: TocHeading[];
  children: ReactNode;
  className?: string;
}

export function CaseStudyBody({ headings, children, className }: CaseStudyBodyProps) {
  const hasToc = headings.length >= 2;

  if (!hasToc) {
    // Single-column fallback for drafts or short case studies.
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        // Mobile: single column, TOC above content (rendered in TocSidebar).
        "flex flex-col",
        // Desktop: two-column grid — sidebar left, content right.
        "lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12",
        className,
      )}
    >
      {/*
       * TocSidebar renders a mobile <details> element at the top of the flow
       * and a sticky <aside> for lg+. Placing it first in DOM order satisfies
       * a11y: keyboard users reach "skip to section" navigation before the
       * article body.
       */}
      <TocSidebar headings={headings} />

      {/* Article content */}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
