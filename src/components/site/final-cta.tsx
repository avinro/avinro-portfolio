import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * FinalCta — full-bleed dark closing section.
 *
 * Design intent (PRO-13 visual refinement):
 *   Colour inversion (bg-foreground text-background) creates the final visual
 *   punctuation of the page — a strong, weighty close that signals "this is the
 *   end, and here's the action." The inverted surface uses existing tokens:
 *     --foreground (oklch 0.109) on --background (oklch 0.985) = ~17:1 AAA
 *   In dark mode the values naturally swap, maintaining the same contrast.
 *
 *   CTA rule: a text-link replaces the previous outline Button so there is
 *   still exactly one primary CTA on the page (SiteHeader md+ / MobileCtaBar
 *   <md). A large styled anchor is visually prominent without using
 *   variant="default" which would create a competing primary action.
 *
 *   The Section component receives bg/text via className — the full-bleed
 *   dark surface extends edge-to-edge because Section renders a block-level
 *   landmark element spanning the full viewport width.
 */
export function FinalCta() {
  const { finalCta } = homeContent;

  return (
    <Section spacing="hero" className="bg-foreground text-background">
      <Container>
        <div className="flex flex-col gap-8">
          {/* Large display heading */}
          <h2
            className="font-display leading-tight font-semibold tracking-tight text-balance"
            style={{ fontSize: "var(--text-display-md)" }}
          >
            {finalCta.heading}
          </h2>

          {/* Supporting text-link — secondary, visually prominent but not primary */}
          <Link
            href={finalCta.linkHref}
            className="font-display inline-flex w-fit items-center gap-2 border-b-2 border-current pb-0.5 text-2xl font-semibold tracking-tight transition-opacity duration-150 hover:opacity-70 sm:text-3xl"
          >
            {finalCta.linkLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
