"use client";

import {
  forwardRef,
  useMemo,
  useRef,
  useEffect,
  type RefObject,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { motion } from "motion/react";

function useAnimationFrame(callback: () => void) {
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      callback();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [callback]);
}

function useMousePositionRef(containerRef: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY);
    };
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

export interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  containerRef: RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: "linear" | "exponential" | "gaussian";
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
  /**
   * On devices without hover (touch / coarse pointer) there is no cursor to
   * drive the proximity effect, so it would stay static. When set, those
   * devices apply the effect from a fixed origin instead of the live pointer,
   * keeping the same radius. Currently only `"top-left"` is supported.
   */
  staticAnchor?: "top-left";
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = "linear",
    className = "",
    onClick,
    style,
    staticAnchor,
    ...restProps
  } = props;

  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Static-origin mode for hover-less devices (see `staticAnchor`).
  const noHoverRef = useRef(false);
  const staticDirtyRef = useRef(true);
  const settleUntilRef = useRef(0);

  useEffect(() => {
    if (!staticAnchor) return;
    const mq = window.matchMedia("(hover: none)");
    const applyHover = () => {
      noHoverRef.current = mq.matches;
      // Recompute through the entrance animation / font swap once we know the mode.
      staticDirtyRef.current = true;
      settleUntilRef.current = performance.now() + 1200;
    };
    applyHover();
    mq.addEventListener("change", applyHover);

    // Letter metrics shift on these; flag a recompute of the fixed gradient.
    const markDirty = () => {
      staticDirtyRef.current = true;
      settleUntilRef.current = performance.now() + 600;
    };
    window.addEventListener("resize", markDirty);
    window.addEventListener("orientationchange", markDirty);
    void document.fonts.ready.then(markDirty);

    return () => {
      mq.removeEventListener("change", applyHover);
      window.removeEventListener("resize", markDirty);
      window.removeEventListener("orientationchange", markDirty);
    };
  }, [staticAnchor]);

  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const interpolatedSettingsRef = useRef<string[]>([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(",")
          .map((s) => s.trim())
          .map((s) => {
            const [name, value] = s.split(" ");
            return [name.replace(/['"]/g, ""), parseFloat(value)] as [string, number];
          }),
      );

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  const calculateFalloff = (distance: number) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (falloff) {
      case "exponential":
        return norm ** 2;
      case "gaussian":
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case "linear":
      default:
        return norm;
    }
  };

  useAnimationFrame(() => {
    if (reducedMotionRef.current) return;
    if (!containerRef.current) return;

    const useStatic = Boolean(staticAnchor) && noHoverRef.current;

    let originX: number;
    let originY: number;
    if (useStatic) {
      // Fixed origin at the container's top-left corner.
      originX = 0;
      originY = 0;
      const now = performance.now();
      // While settling (entrance / font swap) recompute every frame; once stable
      // compute one last time and idle until something flags it dirty again.
      if (!staticDirtyRef.current && now > settleUntilRef.current) return;
      if (now > settleUntilRef.current) staticDirtyRef.current = false;
    } else {
      originX = mousePositionRef.current.x;
      originY = mousePositionRef.current.y;
      if (lastPositionRef.current.x === originX && lastPositionRef.current.y === originY) return;
      lastPositionRef.current = { x: originX, y: originY };
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;

      const rect = letterRef.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
      const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

      const distance = calculateDistance(originX, originY, letterCenterX, letterCenterY);

      if (distance >= radius) {
        letterRef.style.fontVariationSettings = fromFontVariationSettings;
        return;
      }

      const falloffValue = calculateFalloff(distance);
      const newSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
          return `'${axis}' ${String(interpolatedValue)}`;
        })
        .join(", ");

      interpolatedSettingsRef.current[index] = newSettings;
      letterRef.style.fontVariationSettings = newSettings;
    });
  });

  const words = label.split(" ");
  let letterIndex = 0;

  return (
    <span ref={ref} onClick={onClick} style={style} className={className} {...restProps}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap">
          {word.split("").map((letter) => {
            const currentLetterIndex = letterIndex++;
            return (
              <motion.span
                key={currentLetterIndex}
                ref={(el) => {
                  letterRefs.current[currentLetterIndex] = el;
                }}
                style={{
                  display: "inline-block",
                  fontVariationSettings: fromFontVariationSettings,
                }}
                aria-hidden="true"
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = "VariableProximity";

export default VariableProximity;
