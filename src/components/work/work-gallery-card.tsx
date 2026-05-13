import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Work } from "@/lib/content/works";

/*
 * WorkGalleryCard — flat 16:9 card for the /work listing grid.
 *
 * Anatomy (mobile-first):
 *   ┌────────────────────────┐
 *   │  Cover image (16:9)    │
 *   ├────────────────────────┤
 *   │  [Category badge]      │
 *   │  Title                 │
 *   │  Summary               │
 *   └────────────────────────┘
 *
 * All cards occupy 1 column — no featured distinction in the grid.
 */

interface WorkGalleryCardProps {
  work: Work;
  className?: string;
}

export function WorkGalleryCard({ work, className }: WorkGalleryCardProps) {
  const { frontmatter } = work;

  return (
    <Link
      href={`/work/${frontmatter.slug}`}
      data-slot="work-gallery-card"
      data-work-slug={frontmatter.slug}
      className={cn("group focus-ring flex cursor-pointer flex-col", className)}
      aria-label={`${frontmatter.title} — ${frontmatter.category}`}
    >
      {/* Cover image */}
      <div className="bg-muted relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <Image
          src={frontmatter.coverImage}
          alt={`${frontmatter.title} cover`}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-85"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={frontmatter.order === 1}
        />
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-2 pt-4 pb-2">
        {/* Category badge */}
        <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {frontmatter.category}
        </span>

        <h3 className="font-display text-foreground text-xl font-semibold tracking-tight transition-transform duration-200 group-hover:translate-x-px sm:text-2xl">
          {frontmatter.title}
        </h3>

        {/* Summary — problem descriptor, not just an artefact description */}
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {frontmatter.summary}
        </p>
      </div>
    </Link>
  );
}
