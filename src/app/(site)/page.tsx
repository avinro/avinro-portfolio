import type { Metadata } from "next";

import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { getPublishedWorks } from "@/lib/content/works";
import { siteMetaDescription } from "@/lib/content/home";
import { testimonials } from "@/lib/content/testimonials";
import { HomeHero } from "@/components/site/home-hero";
import { WorkDivider } from "@/components/site/work-divider";
import { FlowingWorkMenu } from "@/components/site/flowing-work-menu";
import type { SelectedWorkItem } from "@/components/site/flowing-work-menu";
import { AboutCursorImages } from "@/components/site/about-cursor-images";
import { TestimonialsCarousel } from "@/components/site/testimonials-carousel";

const HOME_TITLE = `${SITE_NAME} — ${OWNER_JOB_TITLE}`;

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: siteMetaDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: siteMetaDescription,
    url: SITE_URL,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: SITE_TWITTER_CARD,
    title: HOME_TITLE,
    description: siteMetaDescription,
    images: [SITE_OG_IMAGE.url],
  },
};

export default function Home() {
  const featured: SelectedWorkItem[] = [
    ...getPublishedCaseStudies()
      .filter((c) => c.frontmatter.featured)
      .map((c) => ({
        kind: "case-study" as const,
        slug: c.frontmatter.slug,
        title: c.frontmatter.title,
        coverImage: c.frontmatter.coverImage,
        order: c.frontmatter.order,
      })),
    ...getPublishedWorks()
      .filter((w) => w.frontmatter.featured)
      .map((w) => ({
        kind: "work" as const,
        slug: w.frontmatter.slug,
        title: w.frontmatter.title,
        coverImage: w.frontmatter.coverImage,
        resultImage: w.frontmatter.resultImage,
        order: w.frontmatter.featuredOrder ?? w.frontmatter.order,
      })),
  ].sort((a, b) => a.order - b.order);

  return (
    <main id="main-content">
      <PersonJsonLd />
      <HomeHero />
      <WorkDivider direction="left" />
      <FlowingWorkMenu items={featured} />
      <WorkDivider direction="right" />
      <AboutCursorImages />
      <TestimonialsCarousel testimonials={testimonials} />
    </main>
  );
}
