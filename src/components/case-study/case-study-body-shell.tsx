import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CaseStudyBodyShellProps {
  children: ReactNode;
  className?: string;
}

export function CaseStudyBodyShell({ children, className }: CaseStudyBodyShellProps) {
  return (
    <div
      data-slot="case-study-body-shell"
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        // Subtract the chat panel width so this full-bleed block reflows instead
        // of sliding under the desktop chat panel (vw ignores the body padding).
        "lg:w-[min(calc(100vw-var(--chat-panel-w)),1920px)] lg:max-w-[1920px] lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
