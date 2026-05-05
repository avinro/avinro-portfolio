import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * HomeHero — above-the-fold section.
 *
 * CTA hierarchy:
 *   - Primary CTA ("Book a call") is intentionally absent here; it lives in
 *     SiteHeader (md+) and MobileCtaBar (<md) so there is exactly one primary
 *     CTA visible at any scroll depth (ui-ux-pro-max §4 primary-action).
 *   - The secondary CTA ("View work") uses variant="outline" to signal
 *     subordinate importance.
 *
 * Typography: H1 uses the display font scale defined in globals.css.
 * The scale goes 4xl → 5xl → 6xl so it fills the viewport progressively
 * without hitting non-standard values.
 */
export function HomeHero() {
  const { hero } = homeContent;

  return (
    <Section as="header" spacing="hero">
      <Container width="wide">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg sm:text-xl">{hero.subheadline}</p>
          </div>

          <p className="text-muted-foreground text-sm tracking-wide uppercase">{hero.valueProp}</p>

          {/* Secondary CTA — outline variant so it doesn't compete with the sticky primary */}
          <div>
            <Button asChild variant="outline" size="lg">
              <Link href={hero.secondaryCtaHref}>{hero.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
