"use client";

import { useRef, useState } from "react";
import { SiteTextLink } from "@/components/site/site-text-link";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

interface ImageConfig {
  range: [number, number];
  xFrom: number;
  xTo: number;
  top: string;
  rotate: string;
  width: string;
  height: string;
  zIndex: number;
  hideOnMobile?: boolean;
}

const IMAGE_CONFIGS: ImageConfig[] = [
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
    top: "67%",
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

interface ScrollPanImageProps {
  src: string;
  caption: string;
  config: ImageConfig;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

const HOVER_SPRING = { damping: 30, stiffness: 140, mass: 1.4 } as const;
const CAPTION_SPRING = { damping: 30, stiffness: 350, mass: 1 } as const;

interface FloatingImageCardProps {
  src: string;
  caption: string;
  reducedMotion?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

function FloatingImageCard({
  src,
  caption,
  reducedMotion = false,
  onHoverChange,
}: FloatingImageCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [lastY, setLastY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), HOVER_SPRING);
  const rotateY = useSpring(useMotionValue(0), HOVER_SPRING);
  const scale = useSpring(1, HOVER_SPRING);
  const captionOpacity = useSpring(0, HOVER_SPRING);
  const captionRotate = useSpring(0, CAPTION_SPRING);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const localX = event.clientX - rect.left;
    cursorX.set(localX > rect.width / 2 ? localX - 208 : localX + 16);
    cursorY.set(event.clientY - rect.top + 8);

    if (reducedMotion) return;

    const amplitude = 6;
    rotateX.set((offsetY / (rect.height / 2)) * -amplitude);
    rotateY.set((offsetX / (rect.width / 2)) * amplitude);
    captionRotate.set(-(offsetY - lastY) * 0.35);
    setLastY(offsetY);
  }

  function handlePointerEnter() {
    setIsHovered(true);
    onHoverChange?.(true);
    if (!reducedMotion) captionOpacity.set(1);
    if (!reducedMotion) scale.set(1.03);
  }

  function handlePointerLeave() {
    if (isTouchActive) return;
    setIsHovered(false);
    onHoverChange?.(false);
    scale.set(1);
    if (!reducedMotion) captionOpacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    captionRotate.set(0);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;

    const nextTouchActive = !isTouchActive;
    setIsTouchActive(nextTouchActive);
    setIsHovered(nextTouchActive);
    onHoverChange?.(nextTouchActive);
    captionOpacity.set(nextTouchActive ? 1 : 0);
    scale.set(nextTouchActive && !reducedMotion ? 1.03 : 1);
  }

  return (
    <div
      ref={cardRef}
      className="pointer-events-auto relative size-full"
      style={{ perspective: "800px" }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <motion.div
        className="relative size-full overflow-hidden rounded-lg shadow-xl"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 60vw, 400px"
          className="object-cover"
          loading="lazy"
          aria-hidden="true"
          onError={(event) => {
            const target = event.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) parent.style.background = "oklch(0.9 0 0)";
          }}
        />
      </motion.div>

      {reducedMotion ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-3 right-3 z-30 max-w-52 rounded bg-white px-2.5 py-1 font-mono text-[10px] leading-snug text-[#2d2d2d] shadow-sm ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          {caption}
        </span>
      ) : (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-30 max-w-52 rounded bg-white px-2.5 py-1 font-mono text-[10px] leading-snug text-[#2d2d2d] shadow-sm"
          style={{
            x: cursorX,
            y: cursorY,
            opacity: captionOpacity,
            rotate: captionRotate,
          }}
        >
          {caption}
        </motion.span>
      )}
    </div>
  );
}

function ScrollPanImage({ src, caption, config, scrollYProgress }: ScrollPanImageProps) {
  const [isHovered, setIsHovered] = useState(false);
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
        zIndex: isHovered ? 30 : config.zIndex,
      }}
      className={cn(
        "pointer-events-auto will-change-transform",
        config.hideOnMobile && "hidden md:block",
      )}
    >
      <FloatingImageCard src={src} caption={caption} onHoverChange={setIsHovered} />
    </motion.div>
  );
}

function StaticCollage({ captions }: { captions: string[] }) {
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
      bottom: "7%",
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
      bottom: "20%",
      left: "22%",
      width: "min(46%, 390px)",
      height: "min(22%, 280px)",
      rotate: "-6deg",
    },
  ];

  return (
    <div className="pointer-events-auto absolute inset-0 overflow-hidden">
      {homeContent.aboutImages.map((img, i) => (
        <div
          key={img.src}
          className={cn(
            "pointer-events-auto absolute hover:z-30",
            [5, 6, 7].includes(i) && "hidden md:block",
          )}
          style={POSITIONS[i]}
          aria-hidden="true"
        >
          <FloatingImageCard src={img.src} caption={captions[i]} reducedMotion />
        </div>
      ))}
    </div>
  );
}

export function AboutCursorImages() {
  const { aboutTeaser } = homeContent;
  const t = useTranslations("home");
  const imageCaptions = t.raw("aboutTeaser.imageCaptions") as string[];
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
      aria-label={t("aboutTeaser.aria")}
      className="bg-background relative"
      style={{ height: "300dvh" }}
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {reducedMotion ? (
          <>
            <StaticCollage captions={imageCaptions} />
            <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-4">
              <TextContent linkHref={aboutTeaser.linkHref} />
            </div>
          </>
        ) : (
          <>
            <div className="pointer-events-auto absolute inset-0">
              {homeContent.aboutImages.map((img, i) => (
                <ScrollPanImage
                  key={img.src}
                  src={img.src}
                  caption={imageCaptions[i]}
                  config={IMAGE_CONFIGS[i]}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

            <div className="pointer-events-none relative z-10 flex h-full items-center justify-center px-4">
              <TextContent linkHref={aboutTeaser.linkHref} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function TextContent({ linkHref }: { linkHref: string }) {
  const t = useTranslations("home");

  return (
    <Container width="narrow">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-3">
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
            {t("aboutTeaser.greeting")}
          </p>
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
            {t("aboutTeaser.bio")}
          </p>
        </div>
        <span className="pointer-events-auto relative z-20 inline-flex justify-center">
          <SiteTextLink href={linkHref} variant="inlineMono">
            {t("aboutTeaser.linkLabel")}
            <span aria-hidden="true" className="transition-transform duration-150">
              →
            </span>
          </SiteTextLink>
        </span>
      </div>
    </Container>
  );
}
