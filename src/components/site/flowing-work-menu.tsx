"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Unified item shape for the home "Selected work" section.
 * Merges featured case studies and featured works into one ordered list.
 */
export interface SelectedWorkItem {
  kind: "case-study" | "work";
  slug: string;
  title: string;
  coverImage: string;
  /** Payoff shot — shown on mobile static rows when set; falls back to coverImage. */
  resultImage?: string;
  /** Effective sort order — uses featuredOrder when available, falls back to order. */
  order: number;
}

interface FlowingWorkMenuProps {
  items: SelectedWorkItem[];
}

interface FlowingWorkItemProps {
  item: SelectedWorkItem;
  isFirst: boolean;
  isDesktopMotion: boolean;
}

// ---------------------------------------------------------------------------
// Edge detection
// Determines whether the cursor entered/left from the top or bottom edge of
// the element — used to animate the marquee overlay in from the correct side.
// ---------------------------------------------------------------------------

function findClosestEdge(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
): "top" | "bottom" {
  const topDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
  const bottomDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
  return topDist < bottomDist ? "top" : "bottom";
}

// ---------------------------------------------------------------------------
// Static / mobile fallback row
// ---------------------------------------------------------------------------

function StaticWorkRow({ item, isFirst }: { item: SelectedWorkItem; isFirst: boolean }) {
  const href = item.kind === "work" ? `/work/${item.slug}` : `/case-studies/${item.slug}`;
  const ariaLabel =
    item.kind === "work" ? `View work: ${item.title}` : `View case study: ${item.title}`;

  return (
    <Link
      href={href}
      className="focus-ring group flex flex-1 items-center justify-between gap-8 px-4 py-5 transition-opacity duration-200 hover:opacity-70 sm:gap-4 sm:px-6 lg:px-8"
      style={{ borderTop: isFirst ? "none" : "1px solid oklch(0 0 0 / 12%)" }}
      aria-label={ariaLabel}
    >
      <div className="flex min-w-0 items-center gap-6">
        <span className="font-display text-foreground text-2xl font-semibold tracking-tight uppercase sm:text-3xl">
          {item.title}
        </span>
        {/* Kind badge — helps visitors distinguish content types */}
        <span className="text-muted-foreground hidden font-mono text-[10px] tracking-widest uppercase sm:inline">
          {item.kind === "work" ? "Work" : "Case study"}
        </span>
      </div>
      <div className="relative ml-auto h-14 max-w-36 min-w-0 flex-1 overflow-hidden rounded-full sm:ml-0 sm:size-14 sm:max-w-none sm:flex-none sm:shrink-0 sm:rounded-md">
        <Image
          src={item.resultImage ?? item.coverImage}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 56px"
          className="object-cover"
          loading="lazy"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

// Module-level constants — defined outside the component to keep stable
// references and satisfy react-hooks/exhaustive-deps.
const MARQUEE_SPEED = 15; // seconds per content-width cycle
const ENTER_EASE = { duration: 0.6, ease: "expo.out" };

// ---------------------------------------------------------------------------
// Desktop marquee item
// ---------------------------------------------------------------------------

function FlowingWorkItem({ item, isFirst, isDesktopMotion }: FlowingWorkItemProps) {
  const href = item.kind === "work" ? `/work/${item.slug}` : `/case-studies/${item.slug}`;
  const ariaLabel =
    item.kind === "work" ? `View work: ${item.title}` : `View case study: ${item.title}`;

  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const marqueeAnimRef = useRef<gsap.core.Tween | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const [repetitions, setRepetitions] = useState(5);

  // Calculate how many copies of marquee-part are needed to fill the viewport
  const calcRepetitions = useCallback(() => {
    if (!marqueeInnerRef.current) return;
    const part = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee-part");
    if (!part) return;
    const contentWidth = part.offsetWidth;
    if (contentWidth === 0) return;
    const needed = Math.ceil(window.innerWidth / contentWidth) + 2;
    setRepetitions(Math.max(5, needed));
  }, []);

  // Start the looping marquee animation
  const startMarquee = useCallback(() => {
    if (!marqueeInnerRef.current) return;
    const part = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee-part");
    if (!part || part.offsetWidth === 0) return;
    if (marqueeAnimRef.current) marqueeAnimRef.current.kill();
    marqueeAnimRef.current = gsap.to(marqueeInnerRef.current, {
      x: -part.offsetWidth,
      duration: MARQUEE_SPEED,
      ease: "none",
      repeat: -1,
    });
  }, []);

  useEffect(() => {
    if (!isDesktopMotion) return;

    calcRepetitions();
    window.addEventListener("resize", calcRepetitions);
    return () => {
      window.removeEventListener("resize", calcRepetitions);
    };
  }, [isDesktopMotion, calcRepetitions]);

  // Re-init marquee when repetitions settle after first calcRepetitions run
  useEffect(() => {
    if (!isDesktopMotion) return;
    const t = setTimeout(startMarquee, 60);
    return () => {
      clearTimeout(t);
    };
  }, [isDesktopMotion, repetitions, startMarquee]);

  // Cleanup marquee tween on unmount
  useEffect(() => {
    return () => {
      marqueeAnimRef.current?.kill();
      ctxRef.current?.revert();
    };
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height,
    );

    ctxRef.current?.revert();
    ctxRef.current = gsap.context(() => {
      const targets = [marqueeRef.current, marqueeInnerRef.current].filter(Boolean);
      gsap
        .timeline({ defaults: ENTER_EASE })
        .set(marqueeRef.current ?? [], { y: edge === "top" ? "-101%" : "101%" })
        .set(marqueeInnerRef.current ?? [], { y: edge === "top" ? "101%" : "-101%" })
        .to(targets, { y: "0%" });
    });
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      e.clientX - rect.left,
      e.clientY - rect.top,
      rect.width,
      rect.height,
    );

    ctxRef.current?.revert();
    ctxRef.current = gsap.context(() => {
      gsap
        .timeline({ defaults: ENTER_EASE })
        .to([marqueeRef.current, marqueeInnerRef.current].filter(Boolean), {
          y: edge === "top" ? "-101%" : "101%",
        });
    });
  }, []);

  return (
    <div
      ref={itemRef}
      className="relative flex-1 overflow-hidden text-center"
      style={{ borderTop: isFirst ? "none" : "1px solid oklch(0 0 0 / 12%)" }}
    >
      {/* Primary interactive link — the accessible content */}
      <Link
        href={href}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="focus-ring relative flex h-full cursor-pointer items-center justify-center gap-3 uppercase"
        aria-label={ariaLabel}
      >
        <span
          className="font-display text-foreground leading-none font-semibold"
          style={{ fontSize: "clamp(1.75rem, 4vh, 3.5rem)" }}
        >
          {item.title}
        </span>
        {/* Kind badge — tiny label so visitors can tell formats apart at a glance */}
        <span
          className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase"
          aria-hidden="true"
        >
          {item.kind === "work" ? "Work" : "Case study"}
        </span>
      </Link>

      {/*
       * Marquee overlay — decorative, aria-hidden so screen readers skip it.
       * Starts translated off-screen (101%) and slides in on mouseenter.
       * bg-background / text-foreground inverts the palette vs the base row.
       */}
      <div
        ref={marqueeRef}
        aria-hidden="true"
        className="bg-foreground text-background pointer-events-none absolute inset-0 flex translate-y-[101%] items-center overflow-hidden"
      >
        <div ref={marqueeInnerRef} className="flex h-full w-fit items-center">
          {Array.from({ length: repetitions }).map((_, idx) => (
            <div key={idx} className="marquee-part flex shrink-0 items-center">
              <span
                className="font-display text-background leading-none font-normal uppercase"
                style={{
                  fontSize: "clamp(1.75rem, 4vh, 3.5rem)",
                  paddingInline: "1vw",
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </span>
              {/* Thumbnail pill inside the marquee */}
              <div className="relative mx-[2vw] h-[7vh] w-[200px] shrink-0 overflow-hidden rounded-[50px]">
                <Image
                  src={item.coverImage}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                  loading="lazy"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlowingWorkMenu — exported section
// ---------------------------------------------------------------------------

export function FlowingWorkMenu({ items }: FlowingWorkMenuProps) {
  // Lazy initializer reads media queries once on mount (client-only).
  const [isDesktopMotion, setIsDesktopMotion] = useState(false);

  useEffect(() => {
    const desktopMQ = window.matchMedia("(min-width: 768px)");
    const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setIsDesktopMotion(desktopMQ.matches && !reducedMQ.matches);
    };

    update();
    desktopMQ.addEventListener("change", update);
    reducedMQ.addEventListener("change", update);
    return () => {
      desktopMQ.removeEventListener("change", update);
      reducedMQ.removeEventListener("change", update);
    };
  }, []);

  return (
    <section
      data-slot="flowing-work-menu"
      aria-label="Selected work"
      className="bg-background text-foreground relative h-[calc(var(--item-count)*20vh)] min-h-[60vh] md:h-[calc(var(--item-count)*25vh)]"
      style={{ "--item-count": items.length } as React.CSSProperties}
    >
      <nav className="flex h-full flex-col" aria-label="Selected work">
        {items.map((item, i) =>
          isDesktopMotion ? (
            <FlowingWorkItem
              key={`${item.kind}-${item.slug}`}
              item={item}
              isFirst={i === 0}
              isDesktopMotion={isDesktopMotion}
            />
          ) : (
            <StaticWorkRow key={`${item.kind}-${item.slug}`} item={item} isFirst={i === 0} />
          ),
        )}
      </nav>
    </section>
  );
}
