# Intro And Page Transitions

The public site intro and route transitions must follow the architecture documented in [`docs/intro-page-transitions.md`](../../docs/intro-page-transitions.md).

## Required Contract

- The intro is a homepage-only entry moment. It may play only on `/` and `/es`, only when `avinro:intro-seen` is not present in `sessionStorage`.
- The website must never visually flash before the intro on first homepage entry.
- The locale layout must render `.avinro-intro-checking` on `<html>` from SSR. This CSS cover is the first-paint guard.
- `SiteIntroGate` must remove `.avinro-intro-checking` in a layout effect after it has decided whether to show the intro or reveal the site.
- Do not add a raw `<script>` or `next/script` to the locale layout for this intro flow. This caused a Next.js 16 console error during locale changes.
- Client-side locale changes must not replay the intro after it has been seen in the current tab session.
- Non-home entry routes must mark `avinro:intro-seen` so users who land on `/work`, `/about`, `/case-studies`, or localized equivalents do not later see the intro when navigating home.
- After the intro completes, `SiteTemplate` must still run the route-enter reveal animation, using the `avinro:intro-just-completed` flag to delay the reveal by 0.3 seconds.
- If `sessionStorage` throws or is blocked, the gate must fail open to the site instead of crashing or trapping the user.
- Respect `prefers-reduced-motion` for intro and page-transition animations.

## Files That Define The Flow

- `src/app/[locale]/layout.tsx` — owns the SSR `.avinro-intro-checking` class on `<html>`.
- `src/app/globals.css` — owns the fixed first-paint cover for `.avinro-intro-checking`.
- `src/components/site/site-intro-gate.tsx` — owns client gate state and session flags.
- `src/components/site/intro-opener.tsx` — owns the full-screen intro overlay.
- `src/app/[locale]/(site)/template.tsx` — owns page-enter reveal transitions.
- `src/lib/intro/block-first-paint.ts` — owns shared home-route detection and checking-cover cleanup.
- `src/lib/intro/constants.ts` — owns session keys and CSS class constants.

## Regression Checks

After changing this flow, run:

```bash
npm run test -- src/lib/intro/block-first-paint.test.ts
npm run typecheck
npm run lint
npm run build
```

Manually verify:

- Fresh `/` or `/es`: first visible surface is the intro, not the website.
- Intro completes: the website reveals after a 0.3 second delay with the page-enter animation.
- Fresh `/work` or `/es/work`: no intro plays.
- Switching language after the intro has been seen does not replay the intro and does not log the React script-tag warning.
