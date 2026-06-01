"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

/** Curtain close/open tween durations (seconds). */
const CLOSE_DURATION = 0.3;
const OPEN_DURATION = 0.32;
/** Minimum time (ms) the curtains stay fully closed so the loader is always seen. */
const MIN_CLOSED_MS = 700;

/**
 * Full-screen bars transition for in-site, page-to-page navigation.
 *
 * Lives in the persistent site chrome (not in the per-route template), so its
 * refs survive across client navigations. The homepage intro is a separate
 * moment and is never triggered here: this only runs on intercepted internal
 * link clicks, never on first paint.
 *
 * Flow: intercept an internal link → close curtains to center over the loader →
 * router.push → on pathname change, hold briefly, then open the curtains. The
 * per-route template runs its own fade reveal underneath as the curtains open.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const transitioningRef = useRef(false);
  const closeStartRef = useRef(0);
  const isFirstPathnameRef = useRef(true);
  const [active, setActive] = useState(false);

  // Initial off-screen positions for both curtains and the hidden loader.
  useEffect(() => {
    gsap.set(topRef.current, { yPercent: -100 });
    gsap.set(bottomRef.current, { yPercent: 100 });
    gsap.set(loaderRef.current, { autoAlpha: 0 });
  }, []);

  // Intercept internal navigations and play the close half of the transition.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (/^(mailto:|tel:)/i.test(href)) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      // Same page (or in-page hash) — let the browser handle it, no transition.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      startTransition(url.pathname + url.search + url.hash);
    }

    function startTransition(destination: string) {
      if (transitioningRef.current) return;
      transitioningRef.current = true;
      closeStartRef.current = performance.now();
      setActive(true);

      gsap
        .timeline()
        .to([topRef.current, bottomRef.current], {
          yPercent: 0,
          duration: CLOSE_DURATION,
          ease: "power2.out",
        })
        .to(loaderRef.current, { autoAlpha: 1, duration: 0.2 }, "-=0.25")
        .add(() => {
          router.push(destination);
        });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [router]);

  // When the route has actually changed, open the curtains to reveal the page.
  useEffect(() => {
    if (isFirstPathnameRef.current) {
      isFirstPathnameRef.current = false;
      return;
    }
    if (!transitioningRef.current) return;

    const elapsed = performance.now() - closeStartRef.current;
    const waitSeconds = Math.max(0, MIN_CLOSED_MS - elapsed) / 1000;

    gsap
      .timeline({ delay: waitSeconds })
      .to(loaderRef.current, { autoAlpha: 0, duration: 0.2 })
      .to(
        topRef.current,
        { yPercent: -100, duration: OPEN_DURATION, ease: "power2.inOut" },
        "-=0.1",
      )
      .to(bottomRef.current, { yPercent: 100, duration: OPEN_DURATION, ease: "power2.inOut" }, "<")
      .add(() => {
        transitioningRef.current = false;
        setActive(false);
      });
  }, [pathname]);

  return (
    // Hidden until a transition is active to avoid a first-paint black flash.
    // GSAP owns the curtains' `transform` and the loader's opacity/visibility —
    // none of those are set inline here, so a re-render (setActive) never fights
    // GSAP by overwriting the inline style it just animated.
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[90] overflow-hidden"
      style={{
        visibility: active ? "visible" : "hidden",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <div ref={topRef} className="bg-foreground absolute inset-x-0 top-0 h-[calc(50vh+1px)]" />
      <div
        ref={bottomRef}
        className="bg-foreground absolute inset-x-0 bottom-0 h-[calc(50vh+1px)]"
      />
      <div
        ref={loaderRef}
        className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="avinro-transition-loader">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
