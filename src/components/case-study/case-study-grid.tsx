import { Container } from "@/components/layout/container";
import { CaseStudyGridCard } from "./case-study-grid-card";
import type { CaseStudy } from "@/lib/content/case-studies";

interface CaseStudyGridProps {
  cases: CaseStudy[];
}

export function CaseStudyGrid({ cases }: CaseStudyGridProps) {
  return (
    <Container>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Case studies">
        {cases.map((cs) => (
          <li key={cs.frontmatter.slug}>
            <CaseStudyGridCard cs={cs} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
