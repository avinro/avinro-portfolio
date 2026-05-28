"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

import type { ProcessStage } from "@/lib/content/about";
import { cn } from "@/lib/utils";

interface ProcessCardProps {
  stage: ProcessStage;
  index: number;
  total: number;
  reducedMotion: boolean;
  outerRef?: React.RefObject<HTMLDivElement | null>;
}

function ProcessCard({ stage, index, total, reducedMotion, outerRef }: ProcessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const stickyTop = `calc(17rem + ${String(index * 3)}vh)`;

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["end 0.85", "end 0.1"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.9, 0.72]);

  const isLast = index === total - 1;

  const setRef = (el: HTMLDivElement | null) => {
    cardRef.current = el;
    if (outerRef) {
      outerRef.current = el;
    }
  };

  const cardContent = (
    <div
      className={cn(
        "border-border/40 bg-background relative overflow-hidden rounded-2xl border shadow-md",
        "px-6 py-8 sm:px-10 sm:py-10",
      )}
    >
      <span
        aria-hidden="true"
        className="text-muted-foreground/10 absolute top-4 right-6 font-mono text-7xl font-bold tabular-nums select-none sm:top-6 sm:right-8 sm:text-8xl"
      >
        {stage.number}
      </span>

      <p className="text-muted-foreground mb-4 font-mono text-xs tracking-[0.15em] uppercase">
        {stage.number}
      </p>

      <h3
        className="font-display text-foreground mb-1 font-semibold tracking-tight"
        style={{ fontSize: "var(--text-display-xs, 1.5rem)", lineHeight: 1.15 }}
      >
        {stage.title}
      </h3>

      <p className="text-muted-foreground mb-5 font-mono text-sm tracking-wide">{stage.subtitle}</p>

      <p className="text-muted-foreground max-w-prose text-base leading-relaxed sm:text-lg">
        {stage.body}
      </p>
    </div>
  );

  if (reducedMotion) {
    return (
      <div ref={isLast ? setRef : cardRef} className="w-full">
        {cardContent}
      </div>
    );
  }

  return (
    <div
      ref={isLast ? setRef : cardRef}
      className={cn("w-full", "md:sticky")}
      style={{ top: stickyTop }}
    >
      <motion.div style={isLast ? undefined : { scale, opacity }} className="w-full">
        {cardContent}
      </motion.div>
    </div>
  );
}

interface ProcessStackProps {
  stages: ProcessStage[];
  sectionTitle: string;
  intro: string;
}

export function ProcessStack({ stages, sectionTitle, intro }: ProcessStackProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const lastCardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: lastCardProgress } = useScroll({
    target: lastCardRef,
    offset: ["start 0.7", "start 0.4"],
  });

  const headerOpacity = useTransform(lastCardProgress, [0, 1], [1, 0]);

  return (
    <div className="md:relative">
      <motion.div
        style={reducedMotion ? undefined : { opacity: headerOpacity }}
        className={[
          "flex flex-col items-center gap-4 text-center",
          "mb-10 md:mb-12",
          "md:sticky md:top-24 md:z-10",
          "md:bg-background md:py-6",
        ].join(" ")}
      >
        <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
          {sectionTitle}
        </p>
        <h2 className="sr-only">{sectionTitle}</h2>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed sm:text-lg">
          {intro}
        </p>
      </motion.div>

      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-8">
          {stages.map((stage, i) => (
            <ProcessCard
              key={stage.number}
              stage={stage}
              index={i}
              total={stages.length}
              reducedMotion={reducedMotion}
              outerRef={i === stages.length - 1 ? lastCardRef : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
