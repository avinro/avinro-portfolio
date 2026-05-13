import { cn } from "@/lib/utils";

/*
 * WorkDetail — prose wrapper for the /work/[slug] detail page.
 *
 * Intentionally simple: no TOC, no two-column layout. The visual gallery
 * (rendered from frontmatter) is the primary content; MDX prose is a short
 * optional intro that precedes it.
 *
 * Max-width is tighter than case-study pages (max-w-3xl vs max-w-7xl) to keep
 * the prose column readable without the side TOC acting as a counterweight.
 */

interface WorkDetailProps {
  children: React.ReactNode;
  className?: string;
}

export function WorkDetail({ children, className }: WorkDetailProps) {
  return (
    <article
      className={cn(
        // Prose max-width — keeps ~70ch even on wide viewports
        "mx-auto max-w-3xl",
        className,
      )}
    >
      {children}
    </article>
  );
}
