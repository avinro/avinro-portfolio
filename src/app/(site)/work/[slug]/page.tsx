import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getWorkBySlug, getWorkSlugs, getPublishedWorks } from "@/lib/content/works";
import { SITE_URL, SITE_NAME } from "@/lib/seo/site";
import { mdxOptions } from "@/lib/mdx/options";
import { workMdxComponents } from "@/components/work/work-mdx-components";
import { WorkDetail } from "@/components/work/work-detail";
import { WorkGalleryFigure } from "@/components/work/work-gallery-figure";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";

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
// Meta strip — year / category / client / tools / external link
// ---------------------------------------------------------------------------

interface WorkMetaStripProps {
  year: number;
  category: string;
  client?: string;
  tools: string[];
  externalLink?: string;
  tags: string[];
}

function WorkMetaStrip({ year, category, client, tools, externalLink, tags }: WorkMetaStripProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Grid: year / category / client */}
      <div className="border-border/40 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Year
          </span>
          <span className="text-sm font-medium tabular-nums">{year}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            Category
          </span>
          <span className="text-sm font-medium">{category}</span>
        </div>
        {client && (
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Client
            </span>
            <span className="text-sm font-medium">{client}</span>
          </div>
        )}
      </div>

      {/* Tools */}
      {tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tools.map((tool) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* External link */}
      {externalLink && (
        <a
          href={externalLink}
          target="_blank"
          rel="noreferrer noopener"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase transition-colors"
        >
          View live
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next work CTA
// ---------------------------------------------------------------------------

interface NextWorkCTAProps {
  nextTitle: string;
  nextSlug: string;
}

function NextWorkCTA({ nextTitle, nextSlug }: NextWorkCTAProps) {
  return (
    <div className="border-border/40 mt-16 border-t pt-12">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">Next work</p>
      <Link
        href={`/work/${nextSlug}`}
        aria-label={`Next work: ${nextTitle}`}
        data-cta-label={nextTitle}
        data-cta-href={`/work/${nextSlug}`}
        data-cta-position="next_work"
        className="group focus-visible:ring-ring mt-4 flex min-h-[44px] items-center gap-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="font-display text-2xl font-semibold tracking-tight transition-transform group-hover:translate-x-1 sm:text-3xl">
          {nextTitle}
        </span>
        <span
          aria-hidden="true"
          className="text-muted-foreground shrink-0 transition-transform group-hover:translate-x-2"
        >
          →
        </span>
      </Link>
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
// Page
// ---------------------------------------------------------------------------

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const { frontmatter, content } = work;

  // Next published work (wraps around).
  const published = getPublishedWorks();
  const currentIdx = published.findIndex((w) => w.frontmatter.slug === slug);
  const nextWork =
    currentIdx !== -1 && published.length > 1
      ? published[(currentIdx + 1) % published.length]
      : null;

  const hasIntro = content.trim().length > 0;

  return (
    <main id="main-content">
      {/* Hero: title + summary + meta strip */}
      <Section spacing="heroInternal">
        <Container>
          <div className="flex flex-col gap-6">
            {/* Category kicker */}
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {frontmatter.category}
            </p>

            {/* h1 */}
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {frontmatter.title}
            </h1>

            {/* Summary — mandatory one-liner */}
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
              {frontmatter.summary}
            </p>

            <WorkMetaStrip
              year={frontmatter.year}
              category={frontmatter.category}
              client={frontmatter.client}
              tools={frontmatter.tools}
              externalLink={frontmatter.externalLink}
              tags={frontmatter.tags}
            />
          </div>
        </Container>
      </Section>

      {/* Full-bleed cover image */}
      <Section spacing="card">
        <Container width="wide">
          <WorkCover
            src={frontmatter.coverImage}
            alt={`${frontmatter.title} cover`}
            aspect={frontmatter.coverAspect}
          />
        </Container>
      </Section>

      {/* Optional MDX intro — short prose, no primitives */}
      {hasIntro && (
        <Section spacing="card">
          <Container>
            <WorkDetail>
              <MDXRemote source={content} components={workMdxComponents} options={mdxOptions} />
            </WorkDetail>
          </Container>
        </Section>
      )}

      {/* Frontmatter gallery — primary visual content */}
      {frontmatter.gallery.length > 0 && (
        <Section>
          <Container width="wide">
            <div className="flex flex-col gap-8">
              {frontmatter.gallery.map((item, idx) => (
                <WorkGalleryFigure key={item.src} item={item} priority={idx === 0} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Next work CTA */}
      {nextWork && (
        <Section spacing="card">
          <Container>
            <NextWorkCTA
              nextTitle={nextWork.frontmatter.title}
              nextSlug={nextWork.frontmatter.slug}
            />
          </Container>
        </Section>
      )}
    </main>
  );
}
