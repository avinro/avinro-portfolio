"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface PixelTransitionProps {
  defaultImageSrc: string;
  hoverImageSrc: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  gridSize?: number;
  animationStepDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function PixelTransition({
  defaultImageSrc,
  hoverImageSrc,
  alt = "",
  sizes,
  priority = false,
  gridSize = 6,
  animationStepDuration = 0.35,
  className,
  style,
  children,
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const isActiveRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const grid = pixelGridRef.current;
    const container = containerRef.current;
    if (!grid || !container) return;

    let cancelled = false;
    grid.innerHTML = "";

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement("div");
        cell.style.cssText = [
          "position:absolute",
          `width:${(100 / gridSize).toFixed(2)}%`,
          `height:${(100 / gridSize).toFixed(2)}%`,
          `left:${((col * 100) / gridSize).toFixed(2)}%`,
          `top:${((row * 100) / gridSize).toFixed(2)}%`,
          `background-image:url(${defaultImageSrc})`,
          "background-repeat:no-repeat",
        ].join(";");
        grid.appendChild(cell);
      }
    }

    const applyCover = () => {
      if (cancelled || !img.naturalWidth || !img.naturalHeight) return;
      const { width: cW, height: cH } = container.getBoundingClientRect();
      if (!cW || !cH) return;

      const scale = Math.max(cW / img.naturalWidth, cH / img.naturalHeight);
      const rW = img.naturalWidth * scale;
      const rH = img.naturalHeight * scale;
      const oX = (cW - rW) / 2;
      const oY = (cH - rH) / 2;
      const cellW = cW / gridSize;
      const cellH = cH / gridSize;
      const cells = Array.from(grid.children) as HTMLElement[];

      cells.forEach((cell, idx) => {
        const col = idx % gridSize;
        const row = Math.floor(idx / gridSize);
        cell.style.backgroundSize = `${rW.toFixed(2)}px ${rH.toFixed(2)}px`;
        cell.style.backgroundPosition = `${(oX - col * cellW).toFixed(2)}px ${(oY - row * cellH).toFixed(2)}px`;
      });
    };

    const img = new window.Image();
    img.onload = applyCover;
    img.src = defaultImageSrc;
    if (img.complete && img.naturalWidth) applyCover();

    const ro = new ResizeObserver(applyCover);
    ro.observe(container);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [gridSize, defaultImageSrc]);

  const animate = useCallback(
    (reveal: boolean) => {
      const grid = pixelGridRef.current;
      if (!grid) return;

      const cells = Array.from(grid.children) as HTMLElement[];
      if (!cells.length) return;

      tlRef.current?.kill();

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(cells, { opacity: reveal ? 0 : 1 });
        isActiveRef.current = reveal;
        return;
      }

      const staggerEach = animationStepDuration / cells.length;

      tlRef.current = gsap.timeline({
        onComplete: () => {
          isActiveRef.current = reveal;
        },
      });

      tlRef.current.to(cells, {
        opacity: reveal ? 0 : 1,
        duration: 0,
        stagger: { each: staggerEach, from: "random" },
      });
    },
    [animationStepDuration],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const handleEnter = () => {
      if (!isActiveRef.current) animate(true);
    };
    const handleLeave = () => {
      if (isActiveRef.current) animate(false);
    };
    const handleFocus = () => {
      if (!isActiveRef.current) animate(true);
    };
    const handleBlur = () => {
      if (isActiveRef.current) animate(false);
    };

    container.addEventListener("mouseenter", handleEnter);
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("focusin", handleFocus);
    container.addEventListener("focusout", handleBlur);

    return () => {
      container.removeEventListener("mouseenter", handleEnter);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("focusin", handleFocus);
      container.removeEventListener("focusout", handleBlur);
      tlRef.current?.kill();
    };
  }, [animate]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)} style={style}>
      <Image
        src={hoverImageSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        aria-hidden
      />

      <div ref={pixelGridRef} aria-hidden className="pointer-events-none absolute inset-0 z-10" />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        {children}
      </div>
    </div>
  );
}
