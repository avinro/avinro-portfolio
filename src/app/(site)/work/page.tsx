import type { Metadata } from "next";

import { SiteTextLink } from "@/components/site/site-text-link";
import { getPublishedWorks } from "@/lib/content/works";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkGalleryGrid } from "@/components/work/work-gallery-grid";

export const metadata: Metadata = {
  title: "Work",
  description:
    "UI explorations, visual systems, concepts, and product work from a product designer.",
  alternates: {
    canonical: "/work",
  },
};

export default function WorkPage() {
  const works = getPublishedWorks();

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
              Explore my work
            </p>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Explorations,
              <br className="hidden sm:block" /> concepts & UI.
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed sm:text-lg md:max-w-none">
              Visual explorations, UI systems, and product concepts.
            </p>
            <p className="text-muted-foreground text-sm">
              Looking for detailed product case studies?{" "}
              <SiteTextLink href="/case-studies" variant="inlineMono" className="text-foreground">
                View case studies
              </SiteTextLink>
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <WorkGalleryGrid works={works} />
      </Section>
    </main>
  );
}
