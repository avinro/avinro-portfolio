import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { getPublishedCaseStudiesForSitemap } from "@/lib/content/case-studies";
import { getPublishedWorksForSitemap } from "@/lib/content/works";

function languageAlternates(pathname = "") {
  const path = pathname === "/" ? "" : pathname;

  return {
    languages: {
      en: `${SITE_URL}${path}`,
      es: `${SITE_URL}/es${path}`,
    },
  };
}

/**
 * Native App Router sitemap — no external dependency needed.
 *
 * Includes:
 *   - Static public pages: /, /work, /case-studies, /about
 *   - One entry per published (non-draft) case study with real fs mtime.
 *   - One entry per published (non-draft) work with real fs mtime.
 *
 * Drafts are intentionally excluded — they carry robots:noindex so including
 * them in the sitemap would send contradictory signals to search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 1,
      alternates: languageAlternates("/"),
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: languageAlternates("/work"),
    },
    {
      url: `${SITE_URL}/case-studies`,
      lastModified: buildDate,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: languageAlternates("/case-studies"),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: languageAlternates("/about"),
    },
  ];

  const caseStudyEntries: MetadataRoute.Sitemap = getPublishedCaseStudiesForSitemap().map(
    ({ slug, lastModified }) => ({
      url: `${SITE_URL}/case-studies/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: languageAlternates(`/case-studies/${slug}`),
    }),
  );

  const workEntries: MetadataRoute.Sitemap = getPublishedWorksForSitemap().map(
    ({ slug, lastModified }) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: languageAlternates(`/work/${slug}`),
    }),
  );

  return [...staticPages, ...caseStudyEntries, ...workEntries];
}
