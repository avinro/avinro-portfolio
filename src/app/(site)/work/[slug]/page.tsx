import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getWorkBySlug, getWorkSlugs, getPublishedWorkNeighbors } from "@/lib/content/works";
import { SITE_URL, SITE_NAME } from "@/lib/seo/site";
import { mdxOptions } from "@/lib/mdx/options";
import { workMdxComponents } from "@/components/work/work-mdx-components";
import { WorkGalleryFigure } from "@/components/work/work-gallery-figure";
import { WorkHeaderMeta, WorkHeaderTags } from "@/components/work/work-metadata";
import { buildWorkHeaderMetadata, buildWorkHeaderTags } from "@/lib/content/work-header-metadata";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Per-slug metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return {};

  const { frontmatter } = work;
  const title = `${frontmatter.title} | ${SITE_NAME}`;
  const description = frontmatter.summary;
  const url = `${SITE_URL}/work/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/work/${slug}`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "article",
      images: [
        {
          url: `/work/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/work/${slug}/opengraph-image`],
    },
    ...(frontmatter.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// Adjacent published work navigation (same order as /work listing)
// ---------------------------------------------------------------------------

interface WorkProjectNavLinkProps {
  variant: "previous" | "next";
  title: string;
  slug: string;
}

function WorkProjectNavLink({ variant, title, slug }: WorkProjectNavLinkProps) {
  const isNext = variant === "next";
  const kicker = isNext ? "Next project" : "Previous project";
  const ariaPrefix = isNext ? "Next project" : "Previous project";
  const href = `/work/${slug}`;
  const position = isNext ? "next_work" : "prev_work";

  const linkClassName =
    "group focus-visible:ring-ring flex min-h-[44px] items-center gap-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";

  const titleClassName = isNext
    ? "font-display text-2xl font-semibold tracking-tight transition-transform group-hover:translate-x-1 sm:text-3xl"
    : "font-display text-2xl font-semibold tracking-tight transition-transform group-hover:-translate-x-1 sm:text-3xl";

  const arrowClassName = isNext
    ? "text-muted-foreground shrink-0 transition-transform group-hover:translate-x-2"
    : "text-muted-foreground shrink-0 transition-transform group-hover:-translate-x-2";

  return (
    <div>
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{kicker}</p>
      <Link
        href={href}
        aria-label={`${ariaPrefix}: ${title}`}
        data-cta-label={title}
        data-cta-href={href}
        data-cta-position={position}
        className={linkClassName}
      >
        {!isNext && (
          <span aria-hidden="true" className={arrowClassName}>
            ←
          </span>
        )}
        <span className={titleClassName}>{title}</span>
        {isNext && (
          <span aria-hidden="true" className={arrowClassName}>
            →
          </span>
        )}
      </Link>
    </div>
  );
}

interface WorkProjectAdjacentNavProps {
  prevTitle: string | null;
  prevSlug: string | null;
  nextTitle: string | null;
  nextSlug: string | null;
}

function WorkProjectAdjacentNav({
  prevTitle,
  prevSlug,
  nextTitle,
  nextSlug,
}: WorkProjectAdjacentNavProps) {
  if (!prevSlug && !nextSlug) return null;

  const hasPrev = Boolean(prevSlug && prevTitle);
  const hasNext = Boolean(nextSlug && nextTitle);
  const both = hasPrev && hasNext;

  const layoutClassName = both
    ? "grid grid-cols-1 gap-8 sm:grid-cols-2"
    : `flex flex-col gap-8 sm:flex-row ${hasNext ? "sm:justify-end" : "sm:justify-start"}`;

  return (
    <div className="border-border/40 border-t pt-6">
      <div className={layoutClassName}>
        {hasPrev && prevSlug && prevTitle ? (
          <div className="min-w-0">
            <WorkProjectNavLink variant="previous" title={prevTitle} slug={prevSlug} />
          </div>
        ) : null}
        {hasNext && nextSlug && nextTitle ? (
          <div className={`min-w-0 ${both ? "sm:text-right" : ""}`}>
            <div className={both ? "flex sm:justify-end" : undefined}>
              <WorkProjectNavLink variant="next" title={nextTitle} slug={nextSlug} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cover image — full-bleed, above the fold
// ---------------------------------------------------------------------------

function WorkCover({ src, alt, aspect }: { src: string; alt: string; aspect: string }) {
  const ASPECT_RATIOS: Record<string, string> = {
    portrait: "4/5",
    square: "1/1",
    landscape: "16/9",
  };
  const ratio = ASPECT_RATIOS[aspect] ?? "4/5";

  return (
    <div
      className="bg-muted relative w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        className="object-cover"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// MDX body — ensure result payoff image appears in ## Result when absent
// ---------------------------------------------------------------------------

/**
 * When `resultImage` is set but the MDX body never references that URL, inject
 * a <Figure> right after "## Result" so the detail page matches the /work card
 * hover payoff without duplicating frontmatter in every file.
 */
function buildWorkMdxSource(
  content: string,
  resultImage: string | undefined,
  title: string,
): string {
  if (!resultImage?.trim()) return content;
  if (content.includes(resultImage)) return content;
  if (!/^## Result\s/m.test(content)) return content;

  const figureBlock = `<Figure
  src=${JSON.stringify(resultImage)}
  alt=${JSON.stringify(`${title} — prototype payoff`)}
  caption=${JSON.stringify(
    "High-fidelity prototype — key screens aligned with the listing card hover state.",
  )}
  aspect="landscape"
/>

`;

  return content.replace(/^## Result\s*\n+/m, `## Result\n\n${figureBlock}`);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const { frontmatter, content } = work;

  const { prev: prevWork, next: nextWork } = getPublishedWorkNeighbors(slug);

  const mdxSource = buildWorkMdxSource(content, frontmatter.resultImage, frontmatter.title);
  const hasIntro = mdxSource.trim().length > 0;
  const headerMetadata = buildWorkHeaderMetadata(frontmatter);
  const headerTags = buildWorkHeaderTags(frontmatter.tags, frontmatter.tools);

  return (
    <main id="main-content">
      {/* Hero — title, cover image, and meta strip in one block (mirrors case study pattern) */}
      <Section spacing="heroInternal">
        <Container>
          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
            {/* Title + tags | summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
              <div className="flex min-w-0 flex-col gap-2 sm:gap-1">
                <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {frontmatter.title}
                </h1>
                <WorkHeaderTags labels={headerTags} />
              </div>

              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg lg:pt-1">
                {frontmatter.summary}
              </p>
            </div>

            {/* Cover image — inline with hero, above metadata strip */}
            <WorkCover
              src={frontmatter.coverImage}
              alt={`${frontmatter.title} cover`}
              aspect={frontmatter.coverAspect}
            />

            {/* Metadata strip — expanded from frontmatter, below cover */}
            <WorkHeaderMeta items={headerMetadata} />
          </div>
        </Container>
      </Section>

      {/* Optional MDX body — compact project narrative */}
      {hasIntro && (
        <Section spacing="card">
          <Container width="wide">
            <MDXRemote source={mdxSource} components={workMdxComponents} options={mdxOptions} />
          </Container>
        </Section>
      )}

      {/* Frontmatter gallery — primary visual content */}
      {frontmatter.gallery.length > 0 && (
        <Section>
          <Container width="wide">
            {/* Selected screens label — editorial bridge between narrative and visuals */}
            <div className="border-border/40 mb-8 flex items-center gap-4 border-t pt-6">
              <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                Selected screens
              </p>
            </div>
            <div className="flex flex-col gap-8">
              {frontmatter.gallery.map((item, idx) => (
                <WorkGalleryFigure key={item.src} item={item} priority={idx === 0} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Previous / next project navigation */}
      {(prevWork != null || nextWork != null) && (
        <Section spacing="card" className="mb-16">
          <Container>
            <WorkProjectAdjacentNav
              prevTitle={prevWork?.frontmatter.title ?? null}
              prevSlug={prevWork?.frontmatter.slug ?? null}
              nextTitle={nextWork?.frontmatter.title ?? null}
              nextSlug={nextWork?.frontmatter.slug ?? null}
            />
          </Container>
        </Section>
      )}
    </main>
  );
}
