"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SPRING = { damping: 30, stiffness: 100, mass: 2 } as const;

const CAPTION_SPRING = { stiffness: 350, damping: 30, mass: 1 } as const;

function InterestBadges({ className }: { className?: string }) {
  const t = useTranslations("about");
  const badges = t.raw("interests") as string[];
  return (
    <>
      {badges.map((badge) => (
        <span
          key={badge}
          className={cn(
            "bg-background/80 text-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase shadow-sm backdrop-blur-sm",
            className,
          )}
        >
          {badge}
        </span>
      ))}
    </>
  );
}

export interface AboutPortraitCardProps {
  imageSrc: string;
}

export function AboutPortraitCard({ imageSrc }: AboutPortraitCardProps) {
  const t = useTranslations("about");
  const figureRef = useRef<HTMLElement>(null);
  const [lastY, setLastY] = useState(0);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const rotateX = useSpring(useMotionValue(0), SPRING);
  const rotateY = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(1, SPRING);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, CAPTION_SPRING);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!figureRef.current) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const rect = figureRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const amplitude = 12;
    rotateX.set((offsetY / (rect.height / 2)) * -amplitude);
    rotateY.set((offsetX / (rect.width / 2)) * amplitude);

    cursorX.set(e.clientX - rect.left + 20);
    cursorY.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    scale.set(1.05);
    opacity.set(1);
  }

  function handleMouseLeave() {
    scale.set(1);
    opacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={figureRef}
      data-testid="portrait-card"
      aria-label={t("portraitAria")}
      className="relative flex w-full items-center justify-center"
      style={{ perspective: "800px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full rounded-xl"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <div className="border-border/40 bg-muted relative aspect-[3/4] w-full overflow-hidden rounded-xl border">
          <Image
            src={imageSrc}
            alt={t("portraitAlt")}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
            priority
          />
        </div>
        <div
          aria-label={t("interestsAria")}
          className="absolute bottom-4 left-0 z-10 flex w-full flex-wrap justify-start gap-2 px-4 md:hidden"
        >
          <InterestBadges />
        </div>
        <motion.div
          aria-hidden="true"
          className="absolute bottom-4 left-0 z-10 hidden w-full flex-wrap justify-start gap-2 px-4 md:flex"
          style={{ transform: "translateZ(40px)", opacity }}
        >
          <InterestBadges />
        </motion.div>
      </motion.div>
      <figcaption className="absolute top-4 right-4 z-10 rounded bg-white px-2.5 py-1 font-mono text-[10px] text-[#2d2d2d] shadow-sm md:hidden">
        Hi! What&apos;s up?
      </figcaption>
      <motion.figcaption
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 hidden rounded bg-white px-2.5 py-1 font-mono text-[10px] text-[#2d2d2d] md:block"
        style={{
          x: cursorX,
          y: cursorY,
          opacity,
          rotate: rotateFigcaption,
        }}
      >
        Hi! What&apos;s up?
      </motion.figcaption>
    </figure>
  );
}
