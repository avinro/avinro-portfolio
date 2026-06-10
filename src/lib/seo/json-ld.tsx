import "server-only";

import type { CaseStudy } from "@/lib/content/case-studies";
import { SITE_URL, OWNER_NAME, OWNER_JOB_TITLE, SOCIAL_LINKS } from "@/lib/seo/site";

/**
 * Serialise a JSON-LD payload to a string safe for dangerouslySetInnerHTML.
 *
 * JSON.stringify can produce `</script>` sequences that break HTML parsing.
 * Replacing `<` with its Unicode escape `\u003c` prevents that while keeping
 * the output valid JSON (the spec allows Unicode escapes for any character).
 */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Builds an absolute URL from a path relative to SITE_URL.
 * Handles both paths that start with "/" and full https:// URLs (cover images).
 */
function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return new URL(pathOrUrl, SITE_URL).toString();
}

/**
 * Injects a JSON-LD Person schema for the portfolio owner.
 *
 * Place at the top of <main> on / and /about.
 */
export function PersonJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: OWNER_NAME,
    jobTitle: OWNER_JOB_TITLE,
    url: SITE_URL,
    sameAs: Object.values(SOCIAL_LINKS),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
  );
}

interface CreativeWorkJsonLdProps {
  cs: CaseStudy;
  slug: string;
}

/**
 * Injects a JSON-LD CreativeWork schema for a case study page.
 *
 * Only call this for published (non-draft) case studies — drafts carry
 * robots:noindex,nofollow and must not contribute indexed structured data.
 *
 * @param cs   - Full CaseStudy object from the content layer.
 * @param slug - URL slug (passed separately to avoid re-computing from cs).
 */
export function CreativeWorkJsonLd({ cs, slug }: CreativeWorkJsonLdProps) {
  const { frontmatter } = cs;
  const pageUrl = absoluteUrl(`/case-studies/${slug}`);
  const imageUrl = absoluteUrl(frontmatter.coverImage);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: frontmatter.title,
    description: frontmatter.outcome,
    url: pageUrl,
    image: imageUrl,
    dateCreated: String(frontmatter.year),
    keywords: frontmatter.coverage.join(", "),
    creator: {
      "@type": "Person",
      name: OWNER_NAME,
      jobTitle: OWNER_JOB_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
  );
}
