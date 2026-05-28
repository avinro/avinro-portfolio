# Animation System

## Stack

| Library               | Role                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| GSAP                  | Page transitions, scroll-driven animations, pixel reveal, circular text |
| Lenis                 | Smooth scroll; required wrapper for all GSAP ScrollTrigger usage        |
| Motion (motion/react) | Circular text spin/hover, scroll velocity marquee                       |

All animation components live in `src/components/motion/` and are `"use client"`. They respect `prefers-reduced-motion` internally — callers do not need to check.

## Lenis (`src/components/site/lenis-provider.tsx`)

`LenisProvider` initialises Lenis smooth scroll with GSAP ScrollTrigger sync. It exposes the Lenis instance via `useLenis()` for programmatic `scrollTo` calls.

**Disabled conditions** (falls back to native scroll):

- Mobile viewports (< 768 px) — iOS/Android native inertia is sufficient
- `prefers-reduced-motion: reduce` — respect accessibility preference

**ScrollTrigger integration:**

- `lenis.on("scroll", ScrollTrigger.update)` — keeps ScrollTrigger positions in sync each tick
- `gsap.ticker.add(lenis.raf)` — drives Lenis from the GSAP ticker
- `gsap.ticker.lagSmoothing(0)` — disables GSAP lag smoothing to prevent ScrollTrigger jitter under Lenis

**Scroll bounds refresh:**
Lenis reads `scrollHeight` on mount. On pages with deferred content (e.g. the 300dvh `AboutCursorImages` section + lazy-loaded thumbnails), it may read a shorter scrollHeight and stop scrolling before the curtain footer fully reveals. Three mechanisms recompute bounds:

1. `scheduleRefreshLenisBounds` — deferred refresh after mount
2. `window.load` — refresh once all assets are ready
3. `ResizeObserver` on `document.documentElement` with 100 ms debounce — stays in sync as `SiteIntroGate` mounts the full site tree after the intro

## PixelTransition (`src/components/ui/pixel-transition.tsx`)

Two-image card reveal using a pixel-grid mask.

**Layer stack (bottom → top):**

| z-index | Layer          | Description                                                   |
| ------- | -------------- | ------------------------------------------------------------- |
| z-0     | Hover image    | Always rendered below; revealed by the mask fading out        |
| z-10    | Pixel grid     | N×N cells, each a background-image slice of `defaultImageSrc` |
| z-20    | Gradient scrim | Overlay; desktop: triggered by hover/focus                    |
| z-30    | Children       | Text content; same visibility rules as gradient               |

**Pixel mask technique:**
Each grid cell renders its portion of the default image using `background-image: url(src)`, `background-size: N*100% N*100%`, and `background-position` offset per cell. GSAP fades cells to `opacity: 0` in a randomized stagger — the default image disappears pixel-by-pixel, revealing the hover image below without colored blocks or white flash.

**Interaction model:**

- Desktop (fine pointer): hover or `focus-visible` triggers GSAP stagger animation
- Mobile (coarse/no pointer): no animation; gradient and text always visible
- `prefers-reduced-motion`: GSAP animation skipped; instant opacity toggle

## TextType (`src/components/motion/text-type.tsx`)

TypeScript port of React Bits `TextType` (typewriter effect).

Key changes from the original:

- Full TypeScript props
- No separate CSS file — Tailwind utilities only
- Internal `prefers-reduced-motion` gate: renders all phrases immediately as static text and skips every GSAP tween and `setTimeout` typing loop
- `gsap.killTweensOf(cursorEl)` cleanup on unmount (original leaks the cursor blink tween)

## CircularText (`src/components/motion/circular-text.tsx`)

TypeScript port of React Bits `CircularText`. Key changes:

- TypeScript strict props, no separate CSS file
- `useReducedMotion()` skips spin and shuffle animations
- Optional `textChangeTransition="shuffle"`: GSAP-timed stagger when `text` prop changes (scramble + settle per letter; no SplitText / Club plugins)

**Shuffle animation correctness:**
Parent `text` is the single source of truth. Each shuffle run animates from the current on-screen string (ref snapshot) toward the new `text` prop — never from a stale "committed" snapshot. This matters for rapid hover toggles: a `B→A` interrupt must animate toward `A`, not snap to `B` and then run a `B→A` tween.

## ScrollVelocity (`src/components/motion/scroll-velocity.tsx`)

Horizontally scrolling marquee that accelerates/decelerates with page scroll velocity. Adapted from React Bits (MIT).

Key differences:

- `prefers-reduced-motion`: velocity multiplier clamped to `[0, 0]` so text moves at a constant base speed with no scroll-driven acceleration
- `aria-hidden` is applied by the consumer wrapping element, not inside the component
- No hardcoded typography — consumers pass `className` for font tokens

## TestimonialsCarousel (`src/components/site/testimonials-carousel.tsx`)

Infinite marquee driven by a `requestAnimationFrame` transform loop. The track renders two identical copies of the testimonials; when the offset reaches one copy width, it resets by that width so the jump is invisible. Reduced motion disables the loop, and the duplicate track is `aria-hidden` so assistive technology sees each testimonial once.

## WorkDivider (`src/components/site/work-divider.tsx`)

Decorative chapter-rule marquee around the selected work section. It lazy-loads `ScrollVelocity` with `ssr: false` because the motion hooks depend on browser APIs.

## ProcessStack (`src/components/site/process-stack.tsx`)

Scroll-driven stacking cards mechanic:

- Cards stack vertically with `17rem` base height + `3vh` per card
- As the user scrolls the section, older cards slide behind newer ones via `position: sticky`
- The section header fades out as the stack builds

## AboutCursorImages (`src/components/site/about-cursor-images.tsx`)

10 lifestyle images in a scroll-panning effect over a 300dvh section.

**Scroll timeline (normalized 0–1):**

- `0.00–0.25` — pre-sticky: section enters viewport, images begin their parallax offsets
- `0.25–0.75` — sticky: section is pinned; images pan across the viewport driven by scroll progress
- `0.75–1.00` — release: section unpins, images return to resting positions

**Z-index alternation:** odd-indexed images `z-20` (in front of text), even-indexed `z-0` (behind text).

**Reduced-motion fallback:** static collage with grid-based positions — no scroll-linked transforms.
