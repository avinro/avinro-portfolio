import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * AboutTeaser — short bio with a link to the full /about page.
 *
 * Uses Container width="narrow" (max-w-prose) to keep the bio at a
 * comfortable reading measure on wide viewports.
 */
export function AboutTeaser() {
  const { aboutTeaser } = homeContent;

  return (
    <Section>
      <Container width="narrow">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {aboutTeaser.sectionTitle}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">{aboutTeaser.bio}</p>
          <Link
            href={aboutTeaser.linkHref}
            className="text-foreground text-sm font-medium underline-offset-4 hover:underline"
          >
            {aboutTeaser.linkLabel} &rarr;
          </Link>
        </div>
      </Container>
    </Section>
  );
}
