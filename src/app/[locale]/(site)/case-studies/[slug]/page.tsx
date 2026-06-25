import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
  getPublishedCaseStudies,
} from "@/lib/content/case-studies";
import { extractTocHeadings } from "@/lib/content/toc";
import { SITE_URL, SITE_NAME } from "@/lib/seo/site";
import { buildLocaleAlternates } from "@/lib/seo/alternates";
import { CreativeWorkJsonLd } from "@/lib/seo/json-ld";
import { mdxOptions } from "@/lib/mdx/options";
import { mdxComponents, Stats } from "@/components/mdx/components";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CaseStudyScrollTracker } from "@/components/analytics/case-study-scroll-tracker";
import { CaseStudyBody } from "@/components/case-study/case-study-body";
import { CaseStudyBodyShell } from "@/components/case-study/case-study-body-shell";
import { RelatedRail } from "@/components/case-study/related-rail";
import { getRelatedItems } from "@/lib/content/related";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCaseStudySlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cs = getCaseStudyBySlug(slug, locale);
  if (!cs) return {};

  const { frontmatter } = cs;
  const title = `${frontmatter.title} | ${SITE_NAME}`;
  const description = frontmatter.outcome;
  const canonicalPath = locale === "es" ? `/es/case-studies/${slug}` : `/case-studies/${slug}`;
  const url = `${SITE_URL}${canonicalPath}`;

  return {
    title,
    description,
    alternates: buildLocaleAlternates(locale, `/case-studies/${slug}`),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "article",
      images: [
        {
          url: `/case-studies/${slug}/opengraph-image`,
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
      images: [`/case-studies/${slug}/opengraph-image`],
    },
    // Draft pages are not indexed — they are still built for preview purposes.
    ...(frontmatter.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

function ReadingTimeChip({ text }: { text: string }) {
  return <span className="text-muted-foreground font-mono text-xs tabular-nums">{text}</span>;
}

interface CoverMetaProps {
  title: string;
  client: string;
  role: string;
  year: number;
  coverage: string[];
  coverImage: string;
  readingTimeText: string;
  labels: {
    client: string;
    role: string;
    year: string;
    readTime: string;
  };
}

function CoverMeta({
  title,
  client,
  role,
  year,
  coverage,
  coverImage,
  readingTimeText,
  labels,
}: CoverMetaProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl">
        <Image
          src={coverImage}
          alt={`Cover image for ${title}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
          className="object-cover"
        />
      </div>

      <div className="border-border/40 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {labels.client}
          </span>
          <span className="text-sm font-medium">{client}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {labels.role}
          </span>
          <span className="text-sm font-medium">{role}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {labels.year}
          </span>
          <span className="text-sm font-medium tabular-nums">{year}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {labels.readTime}
          </span>
          <ReadingTimeChip text={readingTimeText} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {coverage.map((tag) => (
          <span
            key={tag}
            className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

interface NextCaseCTAProps {
  nextTitle: string;
  nextSlug: string;
  label: string;
}

function NextCaseCTA({ nextTitle, nextSlug, label }: NextCaseCTAProps) {
  return (
    <div className="border-border/40 mt-16 border-t pt-12">
      <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{label}</p>
      <Link
        href={`/case-studies/${nextSlug}`}
        aria-label={`${label}: ${nextTitle}`}
        data-cta-label={nextTitle}
        data-cta-href={`/case-studies/${nextSlug}`}
        data-cta-position="next_case"
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

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("caseStudies");
  const cs = getCaseStudyBySlug(slug, locale);
  if (!cs) notFound();

  const { frontmatter, content, readingTime } = cs;
  const tocHeadings = extractTocHeadings(content);

  const relatedItems = getRelatedItems(slug, locale);

  const published = getPublishedCaseStudies(locale);
  const currentIdx = published.findIndex((p) => p.frontmatter.slug === slug);
  const nextCs =
    currentIdx !== -1 && published.length > 1
      ? published[(currentIdx + 1) % published.length]
      : null;

  return (
    <main id="main-content">
      {!frontmatter.draft && <CreativeWorkJsonLd cs={cs} slug={slug} />}
      <Section spacing="heroInternal">
        <Container width="caseStudy">
          <h1 className="font-display mb-8 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {frontmatter.title}
          </h1>

          <CoverMeta
            title={frontmatter.title}
            client={frontmatter.client}
            role={frontmatter.role}
            year={frontmatter.year}
            coverage={frontmatter.coverage}
            coverImage={frontmatter.coverImage}
            readingTimeText={readingTime.text}
            labels={{
              client: t("coverMeta.client"),
              role: t("coverMeta.role"),
              year: t("coverMeta.year"),
              readTime: t("coverMeta.readTime"),
            }}
          />
        </Container>
      </Section>

      {Array.isArray(frontmatter.kpis) && frontmatter.kpis.length > 0 ? (
        <Section spacing="card">
          <Container width="caseStudy">
            <p className="text-muted-foreground mb-6 font-mono text-xs tracking-widest uppercase">
              {t("outcome")}
            </p>
            <Stats data={frontmatter.kpis} />
          </Container>
        </Section>
      ) : null}

      <Section>
        <CaseStudyBodyShell>
          <CaseStudyBody
            headings={tocHeadings}
            rail={relatedItems.length > 0 ? <RelatedRail items={relatedItems} /> : undefined}
          >
            <MDXRemote source={content} components={mdxComponents} options={mdxOptions} />

            <CaseStudyScrollTracker slug={slug} />

            {nextCs && (
              <NextCaseCTA
                nextTitle={nextCs.frontmatter.title}
                nextSlug={nextCs.frontmatter.slug}
                label={t("nextCaseStudy")}
              />
            )}
          </CaseStudyBody>
        </CaseStudyBodyShell>
      </Section>
    </main>
  );
}
