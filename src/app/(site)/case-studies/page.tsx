import type { Metadata } from "next";

import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CaseStudyGrid } from "@/components/case-study/case-study-grid";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "A selection of 0→1 products and multi-app systems, designed and shipped.",
  alternates: {
    canonical: "/case-studies",
  },
};

export default function CaseStudiesPage() {
  const cases = getPublishedCaseStudies();

  return (
    <main id="main-content">
      <Section
        as="header"
        spacing="heroInternalCompact"
        className="border-border border-b"
        style={{ paddingBottom: "calc(var(--space-hero) / 2)" }}
      >
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Into my process
            </p>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Problems solved,
              <br className="hidden sm:block" /> products shipped.
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed sm:text-lg md:max-w-none">
              Real constraints, real teams, real outcomes.
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <CaseStudyGrid cases={cases} />
      </Section>
    </main>
  );
}
