import Image from "next/image";
import { Link } from "@/i18n/navigation";

import { PixelTransition } from "@/components/ui/pixel-transition";
import { cn } from "@/lib/utils";
import type { Work } from "@/lib/content/works";

interface WorkGalleryCardProps {
  work: Work;
  /** Localized category label (resolved via the work.categories.* catalog). */
  categoryLabel: string;
  className?: string;
}

const CARD_SIZES = "(min-width: 768px) 50vw, 100vw";

function CardOverlay({
  title,
  category,
  tags,
}: {
  title: string;
  category: string;
  tags: string[];
}) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          "opacity-100",
          "md:opacity-0 md:transition-opacity md:duration-300",
          "md:group-hover:opacity-100 md:group-focus-visible:opacity-100",
        )}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 z-10 flex flex-col gap-2 p-4 sm:p-5",
          "translate-y-0 opacity-100",
          "md:translate-y-2 md:opacity-0",
          "md:transition-all md:duration-300 md:ease-out",
          "md:group-hover:translate-y-0 md:group-hover:opacity-100",
          "md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100",
        )}
      >
        <div className="flex flex-col gap-0">
          <span className="font-mono text-xs leading-none tracking-widest text-white/70 uppercase">
            {category}
          </span>

          <h3 className="font-display mt-0.5 text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
            {title}
          </h3>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[10px] tracking-wide text-white/90 uppercase backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function WorkGalleryCard({ work, categoryLabel, className }: WorkGalleryCardProps) {
  const { frontmatter } = work;
  const cardStyle = { aspectRatio: "16/9" };

  return (
    <Link
      href={`/work/${frontmatter.slug}`}
      data-slot="work-gallery-card"
      data-work-slug={frontmatter.slug}
      className={cn("group focus-ring relative block cursor-pointer", className)}
      aria-label={`${frontmatter.title} — ${categoryLabel}`}
    >
      {frontmatter.resultImage ? (
        <PixelTransition
          defaultImageSrc={frontmatter.coverImage}
          hoverImageSrc={frontmatter.resultImage}
          alt={`${frontmatter.title} cover`}
          sizes={CARD_SIZES}
          priority={frontmatter.order === 1}
          className="bg-muted w-full rounded-xl"
          style={cardStyle}
        >
          <CardOverlay title={frontmatter.title} category={categoryLabel} tags={frontmatter.tags} />
        </PixelTransition>
      ) : (
        <div className="bg-muted relative w-full overflow-hidden rounded-xl" style={cardStyle}>
          <Image
            src={frontmatter.coverImage}
            alt={`${frontmatter.title} cover`}
            fill
            sizes={CARD_SIZES}
            priority={frontmatter.order === 1}
            className="object-cover"
          />
          <CardOverlay title={frontmatter.title} category={categoryLabel} tags={frontmatter.tags} />
        </div>
      )}
    </Link>
  );
}
