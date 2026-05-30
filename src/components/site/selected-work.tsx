import { homeContent } from "@/lib/content/home";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkCard } from "./work-card";

export function SelectedWork() {
  const { selectedWork } = homeContent;
  const cases = getPublishedCaseStudies();

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6">
          <h2 className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
            {selectedWork.sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            {selectedWork.body}
          </p>
          <div>
            {cases.map((cs, i) => (
              <WorkCard
                key={cs.frontmatter.slug}
                case_={{
                  slug: cs.frontmatter.slug,
                  title: cs.frontmatter.title,
                  summary: cs.frontmatter.summary,
                  tags: cs.frontmatter.tags,
                  gradient: cs.frontmatter.gradient,
                }}
                index={i + 1}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
