"use client";

import dynamic from "next/dynamic";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { useActivateMinimalSiteChrome } from "@/components/site/site-chrome-shell";

const HEADING_SIZE = "clamp(6rem, 28vh, 18rem)";

const LetterGlitch = dynamic(() => import("@/components/motion/letter-glitch"), {
  ssr: false,
  loading: () => null,
});

export function NotFoundPageContent({
  kicker = "You got lost in the matrix",
  body = "This page slipped through a crack in the simulation.",
  cta = "Back to reality",
}: {
  kicker?: string;
  body?: string;
  cta?: string;
}) {
  return (
    <Section spacing="section" className="relative flex flex-1 flex-col">
      {/* Decorative matrix backdrop, pinned to the full viewport so the page
          reads as a full-screen 404. The center vignette clears a calm zone so
          the foreground 404 and CTA stay legible and "pop" in front of it. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <LetterGlitch className="opacity-70 dark:opacity-60" centerVignette outerVignette />
      </div>

      <Container className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
          {kicker}
        </p>
        <h1
          className="font-display text-foreground font-black tracking-tight tabular-nums"
          style={{ fontSize: HEADING_SIZE, lineHeight: 1 }}
        >
          404
        </h1>
        {body ? (
          <p className="text-muted-foreground max-w-md text-base sm:text-lg">{body}</p>
        ) : null}
        <Button asChild variant="outline" size="lg" className="min-h-[44px]">
          <Link href="/">{cta}</Link>
        </Button>
      </Container>
    </Section>
  );
}

export function NotFoundPage(props: Parameters<typeof NotFoundPageContent>[0]) {
  useActivateMinimalSiteChrome();

  return <NotFoundPageContent {...props} />;
}
