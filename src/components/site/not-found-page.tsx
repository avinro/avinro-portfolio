"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { useActivateMinimalSiteChrome } from "@/components/site/site-chrome-shell";

const HEADING_SIZE = "25vh";

const FuzzyText = dynamic(() => import("@/components/motion/fuzzy-text"), {
  ssr: false,
  loading: () => (
    <span
      className="font-display font-black tracking-tight text-zinc-500 dark:text-zinc-400"
      style={{ fontSize: HEADING_SIZE, lineHeight: 1 }}
      aria-hidden="true"
    >
      404
    </span>
  ),
});

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
  };
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function NotFoundHeading() {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [color, setColor] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (reduced || !headingRef.current) {
      setColor(null);
      return;
    }
    setColor(window.getComputedStyle(headingRef.current).color);
  }, [reduced]);

  return (
    <h1
      ref={headingRef}
      className="font-display flex min-h-[25vh] w-full flex-col items-center justify-center overflow-x-auto font-black tracking-tight text-zinc-500 dark:text-zinc-400"
      style={{ fontSize: HEADING_SIZE, lineHeight: 1 }}
    >
      {reduced ? (
        "404"
      ) : (
        <>
          {color ? (
            <span aria-hidden="true">
              <FuzzyText
                fontSize={HEADING_SIZE}
                fontWeight={900}
                fontFamily="Google Sans Flex, ui-sans-serif, system-ui, sans-serif"
                color={color}
                baseIntensity={0.18}
                hoverIntensity={0.45}
                enableHover
                fps={45}
                direction="horizontal"
                clickEffect={false}
                glitchMode={false}
                className="mx-auto block max-w-full cursor-default touch-manipulation"
              >
                404
              </FuzzyText>
            </span>
          ) : (
            <span aria-hidden="true">404</span>
          )}
          <span className="sr-only">404</span>
        </>
      )}
    </h1>
  );
}

/**
 * 404 body — use inside layouts that already set minimal chrome (e.g. global
 * `not-found` with `SiteChrome minimalChrome`).
 */
export function NotFoundPageContent() {
  return (
    <Section spacing="section" className="flex flex-1 flex-col">
      <Container className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
          Page not found
        </p>
        <NotFoundHeading />
        <p className="text-muted-foreground max-w-md text-base sm:text-lg">
          This page doesn&apos;t exist or may have moved.
        </p>
        <Button asChild variant="outline" size="lg" className="min-h-[44px]">
          <Link href="/">Go to portfolio</Link>
        </Button>
      </Container>
    </Section>
  );
}

/** 404 with minimal chrome (no header / mobile bar / AI chat) for in-app `notFound()`. */
export function NotFoundPage() {
  useActivateMinimalSiteChrome();

  return <NotFoundPageContent />;
}
