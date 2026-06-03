"use client";

import { useEffect, useState } from "react";

export interface VisualViewportState {
  keyboardInset: number;
  viewportHeight: number;
  /**
   * Distance the visual viewport top is offset from the layout viewport top.
   * On iOS Safari this grows when the keyboard opens and the page scrolls the
   * focused field into view; a `position: fixed` overlay must compensate for it
   * or it detaches from the visible area and exposes the page behind it.
   */
  offsetTop: number;
}

/**
 * Tracks Visual Viewport API metrics for mobile keyboard and browser chrome.
 * Falls back gracefully when `visualViewport` is missing.
 */
export function useVisualViewportInset(enabled: boolean): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    keyboardInset: 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    offsetTop: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    const vv = window.visualViewport;
    if (!vv) {
      const onResize = () => {
        setState({ keyboardInset: 0, viewportHeight: window.innerHeight, offsetTop: 0 });
      };
      onResize();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    const update = () => {
      const insetBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setState({
        keyboardInset: insetBottom,
        viewportHeight: vv.height,
        offsetTop: Math.max(0, vv.offsetTop),
      });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [enabled]);

  return state;
}
