import fs from "fs";
import path from "path";

import { SITE_URL, OWNER_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { getPublishedWorks } from "@/lib/content/works";

export const dynamic = "force-static";

/**
 * /llms-full.txt — full-content companion to /llms.txt (llmstxt.org).
 *
 * Concatenates the CV plus the complete markdown body of every published
 * case study and work so generative engines can quote the source material
 * directly. English locale only — it is the canonical content source.
 */
export function GET(): Response {
  const caseStudies = getPublishedCaseStudies();
  const works = getPublishedWorks();

  const cvPath = path.join(process.cwd(), "content", "Ary_Vincench_CV.md");
  const cv = fs.existsSync(cvPath) ? fs.readFileSync(cvPath, "utf-8") : "";

  const sections: string[] = [
    `# Avinro — ${OWNER_NAME}, ${OWNER_JOB_TITLE} (full content)`,
    "",
    `Canonical site: ${SITE_URL}. Index: ${SITE_URL}/llms.txt`,
    "",
    "---",
    "",
    cv,
  ];

  for (const { frontmatter: fm, content } of caseStudies) {
    sections.push(
      "---",
      "",
      `# Case study: ${fm.title}`,
      "",
      `URL: ${SITE_URL}/case-studies/${fm.slug}`,
      `Client: ${fm.client} · Role: ${fm.role} · Year: ${String(fm.year)}`,
      `Coverage: ${fm.coverage.join(", ")}`,
      `Outcome: ${fm.outcome}`,
      "",
      content,
      "",
    );
  }

  for (const { frontmatter: fm, content } of works) {
    sections.push(
      "---",
      "",
      `# Design exploration: ${fm.title}`,
      "",
      `URL: ${SITE_URL}/work/${fm.slug}`,
      `Category: ${fm.category} · Year: ${String(fm.year)}`,
      `Summary: ${fm.summary}`,
      "",
      content,
      "",
    );
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
