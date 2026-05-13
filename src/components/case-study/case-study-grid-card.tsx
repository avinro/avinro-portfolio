import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CaseStudy } from "@/lib/content/case-studies";

/*
 * CaseStudyGridCard — flat card for the /case-studies listing grid.
 *
 * Anatomy:
 *   ┌──────────────────────────┐
 *   │  Cover image (16:9)      │  ← full-bleed, no border-radius
 *   ├──────────────────────────┤
 *   │  Title                   │  ← font-display, tight tracking
 *   │  [Sector] [Type] [Role]  │  ← max 3 Badge outline chips
 *   └──────────────────────────┘
 *
 * Rules:
 *   - No rounded-*, no bg-*, no outer border (flat editorial card).
 *   - Hover: image shifts to 90% opacity, title translates +1px (no scale).
 *   - Focus: uses the site-wide focus-ring utility.
 *   - Mobile-first: full-width image at all sizes; text block padding via
 *     CSS custom property --space-card (24px).
 *   - Image uses 16:9 aspect ratio — `sizes` accounts for the 2-col grid split at md.
 */

interface CaseStudyGridCardProps {
  cs: CaseStudy;
  className?: string;
}

export function CaseStudyGridCard({ cs, className }: CaseStudyGridCardProps) {
  const { frontmatter } = cs;
  const badges = [frontmatter.sector, frontmatter.softwareType, frontmatter.role] as const;

  return (
    <Link
      href={`/case-studies/${frontmatter.slug}`}
      data-slot="case-study-grid-card"
      data-work-slug={frontmatter.slug}
      className={cn("group focus-ring flex cursor-pointer flex-col", className)}
      aria-label={`${frontmatter.title} — case study`}
    >
      {/* Cover image container — bg-muted provides a light gray placeholder
          while the image loads and delineates the container boundary */}
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

      {/* Text block — interior padding, no bg, no border */}
      <div className="flex flex-col gap-3 pt-4 pb-2">
        <h3 className="font-display text-foreground text-xl font-semibold tracking-tight transition-transform duration-200 group-hover:translate-x-px sm:text-2xl">
          {frontmatter.title}
        </h3>

        {/* Badges: sector / softwareType / role — outline variant, max 3 */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((label) => (
            <Badge key={label} variant="outline">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
