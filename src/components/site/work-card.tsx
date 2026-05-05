import Link from "next/link";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { WorkCase } from "@/lib/content/home";

/*
 * WorkCard — case study card for the Selected Work section.
 *
 * The thumbnail is a decorative gradient placeholder (aria-hidden) since no
 * real project images are available yet.  The actual accessible content is the
 * title, summary, and tags rendered below it.
 *
 * The entire card is wrapped in a <Link> so the clickable area covers the full
 * card surface.  The min-h-[44px] constraint on the card title row ensures the
 * interactive area meets the >=44px touch target requirement even if the
 * thumbnail is removed later.
 *
 * data-slot="work-card" follows the project component pattern for targeting
 * in tests and parent selectors.
 */

interface WorkCardProps {
  case_: WorkCase;
  className?: string;
}

export function WorkCard({ case_, className }: WorkCardProps) {
  return (
    <Link
      href={`/work/${case_.slug}`}
      data-slot="work-card"
      className={cn(
        "group border-border bg-card hover:border-border/80 focus-visible:ring-ring block rounded-2xl border transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Thumbnail — decorative only, no meaningful content */}
      <div
        aria-hidden="true"
        className={cn(
          "aspect-[16/9] w-full rounded-t-2xl bg-gradient-to-br opacity-90 transition-opacity duration-200 group-hover:opacity-100",
          case_.gradient,
        )}
      />

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex min-h-[44px] flex-col justify-center gap-1">
          <h3 className="font-display text-base font-semibold tracking-tight sm:text-lg">
            {case_.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{case_.summary}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {case_.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
