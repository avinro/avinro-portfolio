"use client";

/**
 * TocSidebar — sticky table-of-contents sidebar for case study pages.
 *
 * Mobile (base): rendered as a <details> disclosure above the article body.
 * Desktop (lg+): rendered as a sticky <aside> in the left column of the
 * two-column layout.
 *
 * Active heading tracking: an IntersectionObserver watches each H2 anchor in
 * the page and marks the one closest to the top of the viewport as active.
 * rootMargin "-96px 0px -65% 0px" compensates for the sticky nav and treats
 * "active" as the section occupying the upper third of the screen.
 */

import { useEffect, useRef, useState } from "react";
import type { TocHeading } from "@/lib/content/toc";
import { cn } from "@/lib/utils";

interface TocSidebarProps {
  headings: TocHeading[];
}

export function TocSidebar({ headings }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileStuck, setIsMobileStuck] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mobileDetailsRef = useRef<HTMLDetailsElement | null>(null);
  const mobileWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    // Collect all heading elements — we need them to set up the observer.
    const elements: HTMLElement[] = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Track which headings are currently intersecting and their relative
    // order so we can pick the topmost visible one.
    const visible = new Map<string, number>();

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.boundingClientRect.top);
          } else {
            visible.delete(id);
          }
        }

        if (visible.size > 0) {
          // Pick the heading with the smallest (topmost) boundingClientRect.top
          // among currently visible ones.
          const topId = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActiveId(topId);
        }
      },
      {
        // Shrink the observation window: 96px from top (sticky nav height +
        // buffer) and cut off the bottom 65% so only headings near the top
        // of the viewport count as "active".
        rootMargin: "-96px 0px -65% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  useEffect(() => {
    const updateStickyState = () => {
      if (!mobileWrapperRef.current) return;
      const rect = mobileWrapperRef.current.getBoundingClientRect();
      // Keep threshold aligned with top-[72px] used by the sticky container.
      setIsMobileStuck(rect.top <= 72);
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, []);

  const activeHeading = headings.find((h) => h.id === activeId);

  // -------------------------------------------------------------------------
  // Shared list content (used in both mobile and desktop renders)
  // -------------------------------------------------------------------------

  const navList = (
    <nav aria-label="On this page">
      <ul className="space-y-1">
        {headings.map(({ id, text }) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={cn(
                  // Min touch target height (≥44px) via py + leading.
                  "block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors",
                  isActive
                    ? "border-accent text-foreground font-medium"
                    : "text-muted-foreground hover:border-border hover:text-foreground border-transparent",
                )}
                aria-current={isActive ? "location" : undefined}
                onClick={() => {
                  setActiveId(id);
                  // Mobile UX: close the disclosure after selecting a heading,
                  // then let the native anchor navigation scroll to the section.
                  mobileDetailsRef.current?.removeAttribute("open");
                }}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  // -------------------------------------------------------------------------
  // Mobile: <details> disclosure, hidden on lg+
  // -------------------------------------------------------------------------

  const mobileDisclosure = (
    <div ref={mobileWrapperRef} className="sticky top-[72px] z-20 mb-8 lg:hidden">
      <p
        className={cn(
          "text-muted-foreground font-mono text-xs tracking-widest uppercase transition-all",
          isMobileStuck
            ? "pointer-events-none mb-0 h-0 overflow-hidden opacity-0"
            : "mb-2 opacity-100",
        )}
      >
        On this page
      </p>
      <details
        ref={mobileDetailsRef}
        className="border-border/40 bg-background/95 rounded-lg border backdrop-blur-sm"
      >
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 select-none">
          <span className="text-foreground text-base leading-relaxed">
            {activeHeading ? activeHeading.text : "Select a section"}
          </span>
          {/* Chevron indicator */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground shrink-0 transition-transform [[open]_&]:rotate-180"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="border-border/40 border-t px-4 py-3">{navList}</div>
      </details>
    </div>
  );

  // -------------------------------------------------------------------------
  // Desktop: sticky aside, visible on lg+
  // -------------------------------------------------------------------------

  const desktopSidebar = (
    <aside aria-label="On this page" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <p className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
        On this page
      </p>
      {/* Scroll within the sidebar if TOC overflows viewport height */}
      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">{navList}</div>
    </aside>
  );

  return (
    <>
      {mobileDisclosure}
      {desktopSidebar}
    </>
  );
}
