"use client";

import { useEffect } from "react";

export function MediaGuard() {
  useEffect(() => {
    function block(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLImageElement || t instanceof HTMLVideoElement) {
        e.preventDefault();
      }
    }
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("contextmenu", block);
    };
  }, []);
  return null;
}
