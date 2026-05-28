import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { RelatedItem } from "@/lib/content/related";

interface RelatedRailProps {
  items: RelatedItem[];
  className?: string;
}

export function RelatedRail({ items, className }: RelatedRailProps) {
  if (items.length === 0) return null;

  return (
    <aside
      aria-label="Explore more"
      className={cn("hidden xl:block", "xl:sticky xl:top-24 xl:self-start", className)}
    >
      <p className="text-muted-foreground mb-4 font-mono text-xs tracking-widest uppercase">
        Explore more
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={`${item.kind}-${item.slug}`}>
            <Link
              href={item.href}
              data-slot="related-rail-card"
              data-related-card-kind={item.kind}
              data-related-card-slug={item.slug}
              data-related-card-source="case_study_right_rail"
              aria-label={`${item.eyebrow}: ${item.title}`}
              className={cn(
                "group -mx-2 flex items-start gap-3 rounded-lg p-2",
                "transition-colors duration-150",
                "hover:bg-muted/40 focus-visible:bg-muted/40",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={item.coverImage}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                  aria-hidden
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                <span className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase">
                  {item.eyebrow}
                </span>
                <span
                  className={cn(
                    "text-foreground line-clamp-2 text-sm leading-snug font-medium",
                    "transition-transform duration-150 group-hover:translate-x-px",
                  )}
                >
                  {item.title}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
