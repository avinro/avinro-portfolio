import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * HomeHero — above-the-fold section.
 *
 * Design intent (PRO-13 visual refinement):
 *   - Type is the entire visual. --text-display-lg scales from 4rem to 9rem
 *     via clamp so the headline fills the viewport at any width.
 *   - Kicker (mono, small, tracked) anchors the editorial tone above the h1.
 *   - Entrance stagger: kicker → headline → sub → CTA row. Total ~600ms via
 *     tw-animate-css CSS-only utilities which respect prefers-reduced-motion.
 *   - Line-height 0.95 and tracking -0.04em give the headline tight, printed
 *     magazine character — Google Sans Flex supports these optical extremes.
 *   - Value prop ("Available for new projects") lives beside the secondary CTA
 *     as a lightweight signal, not as a floating chip above the heading.
 *
 * CTA rule: only outline/link variants here. Primary CTA lives in SiteHeader
 * (md+) and MobileCtaBar (<md) — never duplicated in-page content.
 */
export function HomeHero() {
  const { hero } = homeContent;

  return (
    <Section as="header" spacing="hero">
      <Container width="wide">
        <div className="flex flex-col gap-8 sm:gap-12">
          {/* Kicker — editorial mono label */}
          <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase duration-500">
            {hero.kicker}
          </p>

          {/* Primary headline — display type protagonist */}
          <h1
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-display font-semibold text-balance delay-100 duration-700"
            style={{
              fontSize: "var(--text-display-lg)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            {hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-2xl text-xl leading-snug delay-200 duration-700 sm:text-2xl">
            {hero.subheadline}
          </p>

          {/* Secondary CTA + availability note */}
          <div className="animate-in fade-in fill-mode-both flex flex-wrap items-center gap-4 delay-300 duration-700 sm:gap-6">
            <Button asChild variant="outline" size="lg">
              <Link href={hero.secondaryCtaHref}>{hero.secondaryCta}</Link>
            </Button>
            <span className="text-muted-foreground text-sm">{hero.valueProp}</span>
          </div>
        </div>
      </Container>
    </Section>
  );
}
