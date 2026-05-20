import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CaseStudyBodyShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Full-bleed horizontal shell for the case study article grid (TOC + body + rail).
 * Hero and metadata stay in the standard Container; only this block uses viewport
 * width capped at 2440px with 48px gutters on large screens.
 */
export function CaseStudyBodyShell({ children, className }: CaseStudyBodyShellProps) {
  return (
    <div
      data-slot="case-study-body-shell"
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        "lg:w-[min(100vw,2440px)] lg:max-w-[2440px] lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
