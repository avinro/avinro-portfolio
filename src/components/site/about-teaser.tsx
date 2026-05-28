import { homeContent } from "@/lib/content/home";
import { SiteTextLink } from "@/components/site/site-text-link";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export function AboutTeaser() {
  const { aboutTeaser } = homeContent;

  return (
    <Section>
      <Container width="narrow">
        <div className="max-w3xl mx-auto flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col gap-3">
            <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
              {aboutTeaser.greeting}
            </p>
            <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
              {aboutTeaser.bio}
            </p>
          </div>
          <SiteTextLink href={aboutTeaser.linkHref} variant="inlineMono">
            {aboutTeaser.linkLabel}
            <span aria-hidden="true" className="transition-transform duration-150">
              →
            </span>
          </SiteTextLink>
        </div>
      </Container>
    </Section>
  );
}
