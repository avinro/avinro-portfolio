import { SITE_URL, OWNER_NAME, OWNER_JOB_TITLE, SOCIAL_LINKS } from "@/lib/seo/site";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { getPublishedWorks } from "@/lib/content/works";

export const dynamic = "force-static";

/**
 * /llms.txt — index file for generative engines (llmstxt.org convention).
 *
 * Mirrors the sitemap's publication rules: only non-draft content, English
 * locale as the canonical source. Full bodies live in /llms-full.txt.
 */
export function GET(): Response {
  const caseStudies = getPublishedCaseStudies();
  const works = getPublishedWorks();

  const lines: string[] = [
    `# Avinro — ${OWNER_NAME}, ${OWNER_JOB_TITLE}`,
    "",
    `> Portfolio of ${OWNER_NAME}, a ${OWNER_JOB_TITLE} based in Madrid, Spain, with 9+ years designing and shipping SaaS and multi-sided platforms. Covers product strategy, UX architecture, design systems, and AI-assisted front-end execution.`,
    "",
    `Site: ${SITE_URL} (English) and ${SITE_URL}/es (Spanish).`,
    `Contact: avinroart@gmail.com · GitHub: ${SOCIAL_LINKS.github} · LinkedIn: ${SOCIAL_LINKS.linkedin}`,
    "",
    "## Case studies",
    "",
    ...caseStudies.map(
      ({ frontmatter: fm }) =>
        `- [${fm.title}](${SITE_URL}/case-studies/${fm.slug}): ${fm.summary} (${fm.client}, ${String(fm.year)} — ${fm.role})`,
    ),
    "",
    "## Design explorations",
    "",
    ...works.map(
      ({ frontmatter: fm }) =>
        `- [${fm.title}](${SITE_URL}/work/${fm.slug}): ${fm.summary} (${fm.category}, ${String(fm.year)})`,
    ),
    "",
    "## Pages",
    "",
    `- [About](${SITE_URL}/about): background, experience, and approach`,
    `- [CV (PDF)](${SITE_URL}/AryVincench_CV_2026.pdf): full résumé`,
    "",
    "## Full content",
    "",
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): complete text of all case studies and design explorations`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
