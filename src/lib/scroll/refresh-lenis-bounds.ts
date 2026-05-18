import type Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Recompute Lenis scroll limits and sync GSAP ScrollTrigger after layout changes. */
export function refreshLenisBounds(lenis: Lenis): void {
  lenis.resize();
  ScrollTrigger.refresh();
}

/**
 * Run a bounds refresh on the next frame and again after lazy content settles.
 * Used after intro exit, route changes, and modal close.
 */
export function scheduleRefreshLenisBounds(lenis: Lenis): void {
  const run = () => {
    refreshLenisBounds(lenis);
  };
  requestAnimationFrame(run);
  window.setTimeout(run, 300);
}
