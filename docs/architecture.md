# Site Architecture

## Layout hierarchy

```
RootLayout (src/app/layout.tsx)
  └─ (site)/layout.tsx → SiteChrome
       └─ LenisProvider
            ├─ MediaGuard
            ├─ RouteScrollRestore
            └─ SiteIntroGate
                 └─ SiteChromeShell
                      ├─ SiteHeader (z-40, sticky top)
                      ├─ main (z-10, bg-background)
                      │    └─ SiteTemplate (template.tsx — per-route animation wrapper)
                      │         └─ {children}
                      ├─ SiteFooter (z-0, fixed bottom — curtain effect)
                      └─ MobileCtaBar (z-40, fixed bottom, mobile only)
```

`SiteChrome` is also used by the root `not-found` page so unknown URLs get the same shell.

## Z-index scale

| Value | Element                                      |
| ----- | -------------------------------------------- |
| z-0   | SiteFooter curtain (behind all content)      |
| z-10  | Content wrapper (`main`)                     |
| z-40  | SiteHeader, MobileCtaBar                     |
| z-50  | Temporary interaction layers (max)           |
| z-70  | SiteIntroGate checking surface / IntroOpener |

## First-visit intro gate

`SiteIntroGate` runs a state machine: `checking → intro → ready`.

- On **first visit**: `sessionStorage` has no `avinro-intro-seen` key. `INTRO_BLOCK_FIRST_PAINT_SCRIPT` runs synchronously before body paint and adds `.avinro-intro-pending` to `<html>` to prevent flash. The intro overlay is shown; the site tree is not mounted until the intro completes.
- On **return visits**: key present → site tree mounts immediately with no intro.
- When intro completes, `SiteIntroGate` sets `avinro:intro-just-completed` in `sessionStorage` before mounting the site tree.

## Per-route enter animation (`template.tsx`)

`template.tsx` uses Next.js App Router's template pattern (unmounts/remounts on every navigation, unlike `layout.tsx` which persists). This is the correct location for soft page-enter animations.

Animation: `opacity 0→1, translateY 14px→0`, 350 ms `power2.out`.

Two guards skip the animation:

1. `prefers-reduced-motion: reduce` — instant mount, no tween.
2. First mount after intro completes — `SiteIntroGate` sets the `avinro:intro-just-completed` session flag before mounting the tree. `SiteTemplate` consumes and removes it on first read. Without this guard the page would animate in immediately after the intro exits, producing a jarring double-animation.

## Fonts (root layout)

Three fonts loaded via `next/font/google`, all with `display: 'optional'` to avoid CLS from font swap:

- **Google Sans Flex** — display/headings. Variable axes `ROND` and `opsz`.
- **Manrope** — body/UI copy. Variable weight 200–800. `display: 'optional'` prevents CLS; Next.js auto-generates `size-adjust` metrics for high fallback fidelity.
- **Geist Mono** — code blocks, data IDs, timestamps only. Avoids a redundant font download for body copy since Manrope covers it.

Font CSS variables live on `<html>` so Tailwind's `@theme inline` and any component using `var(--font-*)` inherit them. `min-h-dvh` on `<body>` avoids the iOS 100vh toolbar overlap.

## Analytics wiring (root layout)

- **PostHogProvider** — captures App Router pageviews via `usePathname` + `useSearchParams`, wrapped in `Suspense` to prevent layout blocking.
- **AnalyticsClickDelegator** — single `document`-level click listener that translates `data-cta-*` and `data-work-card-*` attributes into typed analytics events without converting server components to client. Both are async with no render-blocking impact on LCP.

Marketing chrome (SiteHeader, SiteFooter, MobileCtaBar) is scoped to the `(site)` route group so future authenticated/portal areas can render their own chrome.

## Route redirects

Declared in `next.config.ts` (not middleware):

| Source             | Destination                | Reason                                                  |
| ------------------ | -------------------------- | ------------------------------------------------------- |
| `/contact`         | `/`                        | Contact page removed; CTA modal now lives on every page |
| `/work/hello-dojo` | `/case-studies/hello-dojo` | Case studies moved from `/work/*` to `/case-studies/*`  |
| `/work/uma`        | `/case-studies/uma`        | Same migration                                          |

Per-slug redirects (not a wildcard) prevent the new `/work/[slug]` route (visual explorations) from being caught by the redirect.

## Route conventions

- `(site)/dev/components` is a development-only component catalogue. It uses `dynamic = "force-dynamic"` and calls `notFound()` inside the page component in production so Next.js can still import the module during build-time configuration collection.
- Case studies and works use generated `opengraph-image.tsx` files under their dynamic route segments. These run on Node.js and use system fonts so generated social previews stay consistent with the global image handler.
- The public site keeps a single visible primary CTA: `SiteHeader` on `md+`, `MobileCtaBar` below `md`, and secondary in-page links where needed.
- `SiteFooter` uses the curtain pattern: the footer is fixed behind the content wrapper and revealed only at the bottom of the page. `MobileCtaBar` hides when `[data-curtain-footer]` is at least 50% visible.

## Security headers

Configured in two places:

- **`vercel.json`** — production headers served by Vercel's edge network
- **`next.config.ts`** — local dev parity (same headers minus HSTS, which requires HTTPS)

| Header                       | Value                                                  | Why                                                                                                                    |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `Strict-Transport-Security`  | `max-age=31536000; includeSubDomains`                  | Force HTTPS for 1 year. Omitted in `next.config.ts` (dev runs on http).                                                |
| `X-Frame-Options`            | `DENY`                                                 | Prevent clickjacking.                                                                                                  |
| `X-Content-Type-Options`     | `nosniff`                                              | Block MIME-type sniffing.                                                                                              |
| `Referrer-Policy`            | `strict-origin-when-cross-origin`                      | Minimal referrer leakage to external domains.                                                                          |
| `Permissions-Policy`         | `camera=(), microphone=(), geolocation=(), payment=()` | Disable hardware/payment APIs.                                                                                         |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups`                             | Lets Calendly's `window.open()` work while blocking cross-origin opener access.                                        |
| `Content-Security-Policy`    | (see `vercel.json`)                                    | Enforced CSP covering PostHog, Calendly, Gemini API, and Vercel Insights. `frame-ancestors 'none'` prevents embedding. |
