"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * SiteHeader — global navigation with scroll-driven pill morph.
 *
 * Positioning:
 *   `fixed inset-x-0 top-0` — no space reserved in the layout flow. Content
 *   scrolls under the blurred header, which is the intended look for a
 *   portfolio site with a full-viewport hero.
 *
 * Morph states:
 *   At top (scrollY ≤ 40px): full-width bar, more translucent to blend with hero.
 *   Scrolled (scrollY > 40px): centered pill, max 72rem, 8px from top, more
 *   opaque to separate from content behind. No shadow; border carries definition.
 *
 * Scroll handler:
 *   Stores the previous boolean in a ref to avoid calling setIsScrolled on
 *   every scroll event — only fires when the value actually changes.
 *
 * Accessibility:
 *   Skip link is the first focusable element; it is absolute inside the fixed
 *   header so it is always in the viewport top-left when focused.
 *   Logo link has aria-label; image has alt="" (link label carries the name).
 *   prefers-reduced-motion: transition-none collapses to instant state change.
 */

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

// Raise threshold so the morph fires after a deliberate scroll, not a micro-jitter.
const SCROLL_THRESHOLD = 40;

export function SiteHeader() {
  const { primaryCta } = homeContent;
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > SCROLL_THRESHOLD;
      if (next === isScrolledRef.current) return;
      isScrolledRef.current = next;
      setIsScrolled(next);
    };

    // Sync on mount in case the page is loaded mid-scroll (e.g. browser refresh)
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Skip link — visually hidden until focused by keyboard */}
      <a
        href="#main-content"
        className="focus-ring bg-primary text-primary-foreground absolute top-4 left-4 z-50 -translate-y-16 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      <div
        data-glass-surface
        className={cn(
          "mx-auto flex h-14 items-center justify-between",
          // Solid fallback; translucency + blur only when backdrop-filter is supported.
          "bg-background",
          "supports-[backdrop-filter]:bg-background/55",
          "supports-[backdrop-filter]:backdrop-blur-md",
          "supports-[backdrop-filter]:backdrop-saturate-150",
          "md:supports-[backdrop-filter]:backdrop-blur-xl",
          // Border carries definition — no shadow.
          "border-border/50",
          "transition-[max-width,width,margin-top,border-radius,padding,background-color] duration-500 ease-in-out motion-reduce:transition-none",
          isScrolled
            ? // Pill: slightly more opaque to separate from content behind.
              "supports-[backdrop-filter]:bg-background/65 mt-2 w-[calc(100%-16px)] max-w-[72rem] rounded-full border px-5 sm:px-6"
            : // Top: borderless and more translucent to blend with the hero.
              "supports-[backdrop-filter]:bg-background/45 mt-0 w-full max-w-7xl rounded-none border-transparent px-4 sm:px-6 lg:px-8",
        )}
      >
        {/* Wordmark — logo.png, accessible name on the link wrapper */}
        <Link
          href="/"
          className="focus-ring rounded-sm transition-opacity hover:opacity-70"
          aria-label="Avinro — home"
        >
          <Image src="/logo.png" alt="" width={144} height={28} priority className="h-5 w-auto" />
        </Link>

        {/* Desktop nav + CTA — hidden below md */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring text-muted-foreground hover:text-foreground rounded-sm text-sm transition-all duration-150 hover:-translate-y-px"
            >
              {link.label}
            </Link>
          ))}

          <Button asChild size="default">
            <Link
              href={primaryCta.href}
              data-cta-label={primaryCta.label}
              data-cta-href={primaryCta.href}
              data-cta-position="header"
            >
              {primaryCta.label}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
