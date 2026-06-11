"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { gsap } from "gsap";

export interface SelectedWorkItem {
  kind: "case-study" | "work";
  slug: string;
  title: string;
  coverImage: string;
  resultImage?: string;
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

function StaticWorkRow({ item, isFirst }: { item: SelectedWorkItem; isFirst: boolean }) {
  const t = useTranslations("workMenu");
  const href = item.kind === "work" ? `/work/${item.slug}` : `/case-studies/${item.slug}`;
  const splitHelloDojoTitle = item.slug === "hello-dojo" ? item.title.split(" — ", 2) : null;
  const ariaLabel =
    item.kind === "work"
      ? t("viewWork", { title: item.title })
      : t("viewCaseStudy", { title: item.title });

  return (
    <Link
      href={href}
      className="focus-ring group flex flex-1 items-center justify-between gap-8 px-4 py-5 transition-opacity duration-200 hover:opacity-70 sm:gap-4 sm:px-6 lg:px-8"
      style={{ borderTop: isFirst ? "none" : "1px solid oklch(0 0 0 / 12%)" }}
      aria-label={ariaLabel}
    >
      <div className="flex min-w-0 items-center gap-6">
        <span className="font-display text-foreground text-2xl leading-none font-semibold tracking-tight uppercase sm:text-3xl">
          {splitHelloDojoTitle?.length === 2 ? (
            <>
              <span className="block">{splitHelloDojoTitle[0]} —</span>
              <span className="block">{splitHelloDojoTitle[1]}</span>
            </>
          ) : (
            item.title
          )}
        </span>
        <span className="text-muted-foreground hidden font-mono text-[10px] tracking-widest uppercase sm:inline">
          {item.kind === "work" ? t("work") : t("caseStudy")}
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

const MARQUEE_SPEED = 15;
const ENTER_EASE = { duration: 0.6, ease: "expo.out" };

function FlowingWorkItem({ item, isFirst, isDesktopMotion }: FlowingWorkItemProps) {
  const t = useTranslations("workMenu");
  const href = item.kind === "work" ? `/work/${item.slug}` : `/case-studies/${item.slug}`;
  const ariaLabel =
    item.kind === "work"
      ? t("viewWork", { title: item.title })
      : t("viewCaseStudy", { title: item.title });

  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const marqueeAnimRef = useRef<gsap.core.Tween | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const [repetitions, setRepetitions] = useState(5);

  const calcRepetitions = useCallback(() => {
    if (!marqueeInnerRef.current) return;
    const part = marqueeInnerRef.current.querySelector<HTMLElement>(".marquee-part");
    if (!part) return;
    const contentWidth = part.offsetWidth;
    if (contentWidth === 0) return;
    const needed = Math.ceil(window.innerWidth / contentWidth) + 2;
    setRepetitions(Math.max(5, needed));
  }, []);

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

  useEffect(() => {
    if (!isDesktopMotion) return;
    const t = setTimeout(startMarquee, 60);
    return () => {
      clearTimeout(t);
    };
  }, [isDesktopMotion, repetitions, startMarquee]);

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
        <span
          className="text-muted-foreground font-mono text-[10px] tracking-widest uppercase"
          aria-hidden="true"
        >
          {item.kind === "work" ? t("work") : t("caseStudy")}
        </span>
      </Link>
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

export function FlowingWorkMenu({ items }: FlowingWorkMenuProps) {
  const t = useTranslations("workMenu");
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
      aria-label={t("sectionLabel")}
      className="bg-background text-foreground relative h-[calc(var(--item-count)*20vh)] min-h-[60vh] md:h-[calc(var(--item-count)*25vh)]"
      style={{ "--item-count": items.length } as React.CSSProperties}
    >
      <nav className="flex h-full flex-col" aria-label={t("sectionLabel")}>
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
