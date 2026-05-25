"use client";

import { useRef, useState } from "react";
import { SiteTextLink } from "@/components/site/site-text-link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";

/*
 * AboutCursorImages — sticky text with scroll-panning images.
 *
 * Behavior:
 *   The section is tall (300dvh) to give the user scroll runway.
 *   Inside, a sticky viewport-height wrapper keeps the bio text dead-center
 *   while 10 images slide across the screen at different vertical bands
 *   and stagger times.
 *
 *   Z-index alternation:
 *     Even indices  → z-0  (behind text at z-10)
 *     Odd indices   → z-20 (in front of text)
 *
 *   Each image has a [progressStart, progressEnd] scroll range and an
 *   [xStart → xEnd] translation in viewport-width units so images cross
 *   the full screen independently, entering and exiting on opposite sides.
 *
 *   Image sizing: widths and heights use CSS min(Nvw, Xpx) so images are
 *   proportionally large on narrow viewports (up to 60vw) and capped to the
 *   original desktop pixel sizes on wide ones — no JS breakpoint detection.
 *
 * prefers-reduced-motion: static collage rendered instead.
 *
 * Image source: homeContent.aboutImages (paths under public/about/lifestyle/).
 * Images that fail to load show a neutral bg placeholder via onError.
 */

// ---------------------------------------------------------------------------
// Image choreography config — single fluid set, no mobile/desktop split
// ---------------------------------------------------------------------------

interface ImageConfig {
  /** Scroll progress window [0..1] that this image is active */
  range: [number, number];
  /** translateX from → to in vw units (positive = right) */
  xFrom: number;
  xTo: number;
  /** Vertical position relative to the sticky viewport */
  top: string;
  /** Slight rotation for organic feel */
  rotate: string;
  /** Width and height as CSS values (vw units for fluid scaling) */
  width: string;
  height: string;
  /** z-index: 0 = behind text (z-10), 20 = in front */
  zIndex: number;
  /** Hide below md breakpoint — keeps mobile to 7 images */
  hideOnMobile?: boolean;
}

// useScroll offset ["start end", "end start"] tracks the full visible life of
// the section (400dvh = 300dvh section + 100dvh viewport):
//   0.00–0.25  pre-sticky  (section enters from below)
//   0.25–0.75  sticky      (section pinned at top)
//   0.75–1.00  post-sticky (section exits above)
//
// 10 images interleaved in two groups of 5 (S=0.07 within each group,
// offset by 0.035 between groups), span [0.05, 0.97].
// Range width W=0.62 per image (wider = appears sooner, exits later).
// ~5 images on screen simultaneously throughout most of the sticky phase.
//
// Z-index: odd indices → z-20 (in front of text), even → z-0 (behind).
// Sizes use min(Nvw, Xpx) so images scale with the viewport on narrow screens
// (mobile: up to 60vw) while being capped to the original desktop pixel sizes
// on wide viewports — no JS breakpoint detection needed.
const IMAGE_CONFIGS: ImageConfig[] = [
  // --- group A (original 5) ---
  {
    range: [0.05, 0.67],
    xFrom: 130,
    xTo: -130,
    top: "8%",
    rotate: "-4deg",
    width: "min(60vw, 400px)",
    height: "min(43vw, 290px)",
    zIndex: 0,
  },
  {
    range: [0.12, 0.74],
    xFrom: -130,
    xTo: 130,
    top: "55%",
    rotate: "3deg",
    width: "min(50vw, 315px)",
    height: "min(64vw, 432px)",
    zIndex: 20,
  },
  {
    range: [0.19, 0.81],
    xFrom: 130,
    xTo: -130,
    top: "28%",
    rotate: "5deg",
    width: "min(54vw, 360px)",
    height: "min(39vw, 260px)",
    zIndex: 0,
  },
  {
    range: [0.26, 0.88],
    xFrom: -130,
    xTo: 130,
    top: "62%",
    rotate: "-3deg",
    width: "min(43vw, 288px)",
    height: "min(60vw, 400px)",
    zIndex: 20,
  },
  {
    range: [0.33, 0.95],
    xFrom: 130,
    xTo: -130,
    top: "15%",
    rotate: "6deg",
    width: "min(55vw, 375px)",
    height: "min(47vw, 317px)",
    zIndex: 0,
  },
  // --- group B (new 5, interleaved at +0.035 offset from group A) ---
  // Vertical positions chosen so same-direction images are far apart:
  //   R→L in use: 8%, 15%, 28%  → group B adds 58%, 82%
  //   L→R in use: 55%, 62%      → group B adds 5%, 32%, 45%
  {
    range: [0.08, 0.7],
    xFrom: -130,
    xTo: 130,
    top: "5%",
    rotate: "-2deg",
    width: "min(52vw, 350px)",
    height: "min(38vw, 250px)",
    zIndex: 20,
    hideOnMobile: true,
  },
  {
    range: [0.15, 0.77],
    xFrom: 130,
    xTo: -130,
    top: "58%",
    rotate: "4deg",
    width: "min(48vw, 320px)",
    height: "min(65vw, 440px)",
    zIndex: 0,
    hideOnMobile: true,
  },
  {
    range: [0.22, 0.84],
    xFrom: -130,
    xTo: 130,
    top: "32%",
    rotate: "-5deg",
    width: "min(56vw, 380px)",
    height: "min(40vw, 268px)",
    zIndex: 20,
    hideOnMobile: true,
  },
  {
    range: [0.29, 0.91],
    xFrom: 130,
    xTo: -130,
    top: "82%",
    rotate: "2deg",
    width: "min(46vw, 305px)",
    height: "min(62vw, 415px)",
    zIndex: 0,
  },
  {
    range: [0.36, 0.97],
    xFrom: -130,
    xTo: 130,
    top: "45%",
    rotate: "-6deg",
    width: "min(58vw, 390px)",
    height: "min(42vw, 280px)",
    zIndex: 20,
  },
];

// ---------------------------------------------------------------------------
// Single animated image
// ---------------------------------------------------------------------------

interface ScrollPanImageProps {
  src: string;
  config: ImageConfig;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function ScrollPanImage({ src, config, scrollYProgress }: ScrollPanImageProps) {
  const x = useTransform(scrollYProgress, config.range, [
    `${String(config.xFrom)}vw`,
    `${String(config.xTo)}vw`,
  ]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: config.top,
        left: "50%",
        translateX: "-50%",
        x,
        rotate: config.rotate,
        width: config.width,
        height: config.height,
        zIndex: config.zIndex,
      }}
      className={`overflow-hidden rounded-lg shadow-xl will-change-transform${config.hideOnMobile ? "hidden md:block" : ""}`}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 60vw, 400px"
        className="object-cover"
        loading="lazy"
        aria-hidden="true"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) parent.style.background = "oklch(0.9 0 0)";
        }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion static fallback
// ---------------------------------------------------------------------------

function StaticCollage() {
  // Percentage widths relative to the 100dvh sticky container scale with
  // the viewport. min() caps pixel size on desktop while keeping large
  // proportions on mobile — largest ≈ min(55%, 400px).
  const POSITIONS: React.CSSProperties[] = [
    { top: "5%", left: "3%", width: "min(55%, 400px)", height: "min(22%, 290px)", rotate: "-4deg" },
    {
      bottom: "8%",
      left: "5%",
      width: "min(45%, 315px)",
      height: "min(34%, 432px)",
      rotate: "3deg",
    },
    {
      top: "12%",
      right: "2%",
      width: "min(50%, 360px)",
      height: "min(20%, 260px)",
      rotate: "5deg",
    },
    {
      bottom: "12%",
      right: "4%",
      width: "min(42%, 288px)",
      height: "min(30%, 400px)",
      rotate: "-3deg",
    },
    {
      top: "42%",
      left: "38%",
      width: "min(42%, 375px)",
      height: "min(18%, 317px)",
      rotate: "6deg",
    },
    {
      bottom: "4%",
      left: "38%",
      width: "min(48%, 350px)",
      height: "min(19%, 250px)",
      rotate: "-2deg",
    },
    {
      top: "2%",
      left: "28%",
      width: "min(40%, 320px)",
      height: "min(33%, 440px)",
      rotate: "4deg",
    },
    {
      top: "35%",
      right: "8%",
      width: "min(44%, 380px)",
      height: "min(21%, 268px)",
      rotate: "-5deg",
    },
    {
      top: "18%",
      left: "20%",
      width: "min(38%, 305px)",
      height: "min(31%, 415px)",
      rotate: "2deg",
    },
    {
      bottom: "20%",
      left: "22%",
      width: "min(46%, 390px)",
      height: "min(22%, 280px)",
      rotate: "-6deg",
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {homeContent.aboutImages.map((img, i) => (
        <div
          key={img.src}
          className={`absolute overflow-hidden rounded-lg shadow-lg${[5, 6, 7].includes(i) ? "hidden md:block" : ""}`}
          style={POSITIONS[i]}
          aria-hidden="true"
        >
          <Image
            src={img.src}
            alt=""
            fill
            sizes="(max-width: 768px) 55vw, 400px"
            className="object-cover"
            loading="lazy"
            aria-hidden="true"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) parent.style.background = "oklch(0.9 0 0)";
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function AboutCursorImages() {
  const { aboutTeaser } = homeContent;
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      aria-label="About"
      className="bg-background relative"
      style={{ height: "300dvh" }}
    >
      {/* Sticky viewport — keeps text and images in view during the scroll */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {reducedMotion ? (
          // Reduced-motion: static collage behind text
          <>
            <StaticCollage />
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <TextContent aboutTeaser={aboutTeaser} />
            </div>
          </>
        ) : (
          <>
            {/* Scroll-panning images */}
            <div className="pointer-events-none absolute inset-0">
              {homeContent.aboutImages.map((img, i) => (
                <ScrollPanImage
                  key={img.src}
                  src={img.src}
                  config={IMAGE_CONFIGS[i]}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

            {/* Centered text — z-10 so images alternate in front/behind */}
            <div className="relative z-10 flex h-full items-center justify-center px-4">
              <TextContent aboutTeaser={aboutTeaser} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Bio text block — extracted for reuse in both paths
// ---------------------------------------------------------------------------

interface AboutTeaser {
  greeting: string;
  bio: string;
  linkLabel: string;
  linkHref: string;
}

function TextContent({ aboutTeaser }: { aboutTeaser: AboutTeaser }) {
  return (
    <Container width="narrow">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-3">
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
            {aboutTeaser.greeting}
          </p>
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
            {aboutTeaser.bio}
          </p>
        </div>
        <span className="relative z-20 inline-flex justify-center">
          <SiteTextLink href={aboutTeaser.linkHref} variant="inlineMono">
            {aboutTeaser.linkLabel}
            <span aria-hidden="true" className="transition-transform duration-150">
              →
            </span>
          </SiteTextLink>
        </span>
      </div>
    </Container>
  );
}
