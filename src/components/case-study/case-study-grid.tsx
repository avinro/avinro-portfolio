import { Container } from "@/components/layout/container";
import { CaseStudyGridCard } from "./case-study-grid-card";
import type { CaseStudy } from "@/lib/content/case-studies";

/*
 * CaseStudyGrid — responsive 2-column case-study grid for /case-studies.
 *
 * Layout rules (mobile-first):
 *   - 1 column on mobile (all cards are full-width).
 *   - 2 columns from md upward.
 *   - featured === true  → col-span-2 (full row, i.e. a "weighted" card).
 *   - featured === false → col-span-1 (half-row card).
 *   - A lone non-featured card at the end of a row leaves the adjacent cell
 *     intentionally empty — consistent with future cards being added.
 *
 * Spacing:
 *   - gap-y-10  (40px) mobile — compact for small screens.
 *   - gap-y-20  (80px) md+   — breathing room on the designed breakpoint.
 *   - gap-x-6 / md:gap-x-8   — horizontal gutter between half-row cards.
 *
 * The Container (max-w-6xl + adaptive gutters) is applied here so the page
 * can simply render <CaseStudyGrid cases={cases} /> inside a <Section>.
 */

interface CaseStudyGridProps {
  cases: CaseStudy[];
}

export function CaseStudyGrid({ cases }: CaseStudyGridProps) {
  return (
    <Container>
      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-20"
        aria-label="Case studies"
      >
        {cases.map((cs) => (
          <li
            key={cs.frontmatter.slug}
            className={cs.frontmatter.featured ? "md:col-span-2" : "md:col-span-1"}
          >
            <CaseStudyGridCard cs={cs} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
