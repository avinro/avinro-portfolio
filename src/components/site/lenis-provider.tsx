"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { refreshLenisBounds, scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

gsap.registerPlugin(ScrollTrigger);

const LENIS_RESIZE_DEBOUNCE_MS = 100;

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767.5px)").matches;

    if (prefersReducedMotion || isMobile) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });

    lenisRef.current = lenis;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenisInstance(lenis);

    const onScroll = () => {
      ScrollTrigger.update();
    };
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    scheduleRefreshLenisBounds(lenis);
    const onLoad = () => {
      refreshLenisBounds(lenis);
    };
    window.addEventListener("load", onLoad, { once: true });

    let resizeDebounceId: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeDebounceId) clearTimeout(resizeDebounceId);
      resizeDebounceId = setTimeout(() => {
        refreshLenisBounds(lenis);
      }, LENIS_RESIZE_DEBOUNCE_MS);
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      if (resizeDebounceId) clearTimeout(resizeDebounceId);
      resizeObserver.disconnect();
      window.removeEventListener("load", onLoad);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;

      setLenisInstance(null);
    };
  }, []);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
