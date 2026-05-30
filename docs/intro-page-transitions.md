# Intro And Page Transitions

## Goal

The intro is a homepage-only entry moment. Page-to-page movement after that is handled by the route template animation, not by replaying the intro.

Project rule: [`.cursor/rules/intro-page-transitions.mdc`](../.cursor/rules/intro-page-transitions.mdc).

## Files

| File                                      | Responsibility                                                     |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/intro/block-first-paint.ts`      | Shared route detection and hydration cover cleanup                 |
| `src/app/[locale]/layout.tsx`             | Adds the SSR hydration cover class to `<html>`                     |
| `src/components/site/site-intro-gate.tsx` | Decides whether the client should show the intro or mount the site |
| `src/components/site/intro-opener.tsx`    | Full-screen intro overlay and exit animation                       |
| `src/app/[locale]/(site)/template.tsx`    | Per-route enter animation for client navigations                   |
| `src/app/globals.css`                     | First-paint blocking surface while the intro gate is checking      |

## Contract

The intro may play only when all of these are true:

1. The current tab session does not have `avinro:intro-seen`.
2. The entry route is a localized home route: `/` or `/es`.
3. Browser storage is available.

Any non-home entry route marks the intro as seen for that tab session. This prevents a visitor who lands on `/work` or `/es/about` from seeing the intro later after navigating home.

If `sessionStorage` is blocked or throws, the gate falls back to `ready`. The site should remain usable even when the intro cannot persist state.

## Why There Is No Layout Script

Next.js 16 warns when a raw `<script>` tag is rendered from a React component because scripts inserted during client rendering do not execute reliably. It can also surface during client-side locale changes when a locale layout is remounted.

The intro guard does not depend on a layout script. The locale layout renders `<html>` with `.avinro-intro-checking` from SSR, and CSS paints a fixed foreground-colored surface before the app hydrates. `SiteIntroGate` removes that class in a layout effect after it has decided whether to show the intro or reveal the site.

Do not add a literal `<script>` or `next/script` back to the locale layout for this flow.

## Transition Flow

Full document load on `/` or `/es`:

1. SSR includes `.avinro-intro-checking` on `<html>`.
2. CSS paints a fixed foreground-colored surface and disables body scroll before the site can flash.
3. `SiteIntroGate` hydrates, sees the home route with no session flag, removes the checking class, and renders `IntroOpener`.
4. The site tree is not mounted by the hydrated client while the intro is active.
5. On completion, the gate sets `avinro:intro-seen` and `avinro:intro-just-completed`, then mounts the site.
6. `template.tsx` consumes `avinro:intro-just-completed` and runs the page-enter tween with a `0.3s` delay.

Full document load on any other site route:

1. SSR includes `.avinro-intro-checking` on `<html>` so the site cannot flash before hydration.
2. `SiteIntroGate` hydrates, removes the checking class, marks `avinro:intro-seen`, and mounts the site immediately.
3. `template.tsx` runs the normal page-enter animation unless reduced motion is enabled.

Client-side navigation:

1. The first-paint script does not rerun.
2. The intro does not replay.
3. `(site)/template.tsx` remounts per route and applies the page-enter animation.

## Maintenance Checklist

- Add any future home aliases to `INTRO_HOME_PATHS` by changing routing or the shared helper in `block-first-paint.ts`.
- Keep the client gate using `isIntroHomePath`; route logic should not be duplicated in components.
- Keep `.avinro-intro-checking` on the locale `<html>` element unless this flow is replaced with an equivalent no-flash first-paint guard.
- Keep storage reads and writes wrapped in `try/catch`.
- Respect `prefers-reduced-motion` in any new intro or page transition animation.
- Run `npm run test -- src/lib/intro/block-first-paint.test.ts` after changing intro route detection.
