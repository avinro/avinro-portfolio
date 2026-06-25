"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

export interface LetterGlitchProps {
  /**
   * Letter colors. Defaults to a grayscale ramp (zinc-600/500/400) that reads
   * against both the light and dark background tokens, keeping the effect a
   * quiet backdrop so foreground content stays legible.
   */
  glitchColors?: string[];
  /** Milliseconds between scramble passes. Higher = calmer. */
  glitchSpeed?: number;
  /** Fade letters toward the page background at the edges. */
  outerVignette?: boolean;
  /** Fade letters toward the page background in the center (clears a calm zone). */
  centerVignette?: boolean;
  /** Smoothly interpolate color changes for a subtler feel. */
  smooth?: boolean;
  characters?: string;
  className?: string;
}

interface Letter {
  char: string;
  color: string;
  targetColor: string;
  colorProgress: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const DEFAULT_COLORS = ["#52525b", "#71717a", "#a1a1aa"];
const DEFAULT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";

const FONT_SIZE = 16;
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
  };
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hexToRgb(hex: string): Rgb | null {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const full = hex.replace(
    shorthand,
    (_m, r: string, g: string, b: string) => r + r + g + g + b + b,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function interpolateColor(start: Rgb, end: Rgb, factor: number): string {
  const r = Math.round(start.r + (end.r - start.r) * factor);
  const g = Math.round(start.g + (end.g - start.g) * factor);
  const b = Math.round(start.b + (end.b - start.b) * factor);
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

/**
 * Canvas "matrix" of scrambling characters used as a decorative backdrop.
 * SSR-safe ("use client" + canvas refs touched only in effects) and
 * motion-aware: when the user prefers reduced motion it paints a single static
 * field instead of animating. The container is transparent so the page
 * background token shows through; vignettes fade to `var(--background)`.
 */
export default function LetterGlitch({
  glitchColors = DEFAULT_COLORS,
  glitchSpeed = 60,
  outerVignette = false,
  centerVignette = true,
  smooth = true,
  characters = DEFAULT_CHARACTERS,
  className = "",
}: LetterGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const symbols = Array.from(characters);
    const letters: Letter[] = [];
    const grid = { columns: 0, rows: 0 };
    let animationFrameId = 0;
    let lastGlitchTime = performance.now();

    const randomChar = () => symbols[Math.floor(Math.random() * symbols.length)];
    const randomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

    const initializeLetters = (columns: number, rows: number) => {
      grid.columns = columns;
      grid.rows = rows;
      const total = columns * rows;
      letters.length = 0;
      for (let i = 0; i < total; i++) {
        letters.push({
          char: randomChar(),
          color: randomColor(),
          targetColor: randomColor(),
          colorProgress: 1,
        });
      }
    };

    const drawLetters = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${String(FONT_SIZE)}px monospace`;
      ctx.textBaseline = "top";
      letters.forEach((letter, index) => {
        const x = (index % grid.columns) * CHAR_WIDTH;
        const y = Math.floor(index / grid.columns) * CHAR_HEIGHT;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${String(rect.width)}px`;
      canvas.style.height = `${String(rect.height)}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initializeLetters(Math.ceil(rect.width / CHAR_WIDTH), Math.ceil(rect.height / CHAR_HEIGHT));
      drawLetters();
    };

    const updateLetters = () => {
      if (letters.length === 0) return;
      const updateCount = Math.max(1, Math.floor(letters.length * 0.05));
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length);
        const letter = letters[index];
        letter.char = randomChar();
        letter.targetColor = randomColor();
        if (smooth) {
          letter.colorProgress = 0;
        } else {
          letter.color = letter.targetColor;
          letter.colorProgress = 1;
        }
      }
    };

    const handleSmoothTransitions = () => {
      const needsRedraw = letters.reduce<boolean>((acc, letter) => {
        if (letter.colorProgress >= 1) return acc;
        letter.colorProgress = Math.min(letter.colorProgress + 0.05, 1);
        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (!startRgb || !endRgb) return acc;
        letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
        return true;
      }, false);
      if (needsRedraw) drawLetters();
    };

    const animate = () => {
      const now = performance.now();
      if (now - lastGlitchTime >= glitchSpeed) {
        updateLetters();
        drawLetters();
        lastGlitchTime = now;
      }
      if (smooth) handleSmoothTransitions();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    resizeCanvas();

    // Reduced motion: keep the static field already painted by resizeCanvas,
    // but still re-fit on resize. No animation loop.
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.cancelAnimationFrame(animationFrameId);
        resizeCanvas();
        if (!reducedMotion) animate();
      }, 100);
    };

    if (!reducedMotion) animate();
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [glitchColors, glitchSpeed, smooth, characters, reducedMotion]);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {outerVignette && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle, transparent 60%, var(--background) 100%)",
          }}
        />
      )}
      {centerVignette && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle, var(--background) 0%, transparent 60%)",
          }}
        />
      )}
    </div>
  );
}
