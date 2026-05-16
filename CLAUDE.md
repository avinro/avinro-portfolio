# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## Commands

```bash
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (type-aware strict rules on src/)
npm run lint:fix     # ESLint with --fix
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
npm run format       # Prettier write
npm run lighthouse:preview  # Lighthouse audit — requires a running preview URL
```

Run a single test file:

```bash
npx vitest run src/app/(site)/about/page.test.tsx
```

---

## Architecture

### Stack

Next.js 16 App Router · TypeScript strict · Tailwind v4 · shadcn/ui (radix-nova) · Vitest · PostHog · GSAP + Lenis · Gemini 2.0 Flash Lite (Vercel AI SDK)

### Route structure

All public pages live in `src/app/(site)/`. The root `layout.tsx` sets up fonts and global providers only; `(site)/layout.tsx` adds the full marketing chrome (SiteHeader, SiteFooter, MobileCtaBar, LenisProvider, CalendlyPrefetch). There is no `middleware.ts`.

Redirects are declared in `next.config.ts` (not middleware): `/contact → /`, old `/work/*` slugs → `/case-studies/*`.

### Content layer (MDX file-system CMS)

- Source files: `content/case-studies/*.mdx` and `content/works/*.mdx`
- Readers: `src/lib/content/case-studies.ts` and `src/lib/content/works.ts`
- Both validate frontmatter with Zod at build time — invalid frontmatter is a hard build failure
- Both use module-level `_cache` so MDX is only compiled once per server process
- Static generation: each `[slug]/page.tsx` exports `generateStaticParams()` that calls the content layer

**MDX publication contract** (enforced by `src/lib/content/case-studies.ts` Zod schema):

- Required frontmatter fields: `title`, `slug`, `client`, `role`, `year`, `coverImage`, `summary`
- Required sections: `## Problem statement`, `## Process`, `## Results and impact`
- Minimum 5 `<Figure />` blocks per case study
- MDX components registered globally: `<Figure />`, `<Stats />`, `<BeforeAfter />`, `<Bar />`

MDX compile pipeline (`src/lib/mdx/options.ts`): `remark-gfm` → custom `remark-mermaid-to-component` (rewrites fenced ` ```mermaid ` blocks to a `<MermaidDiagram>` JSX component) → `rehype-pretty-code` (dual github-light/dark themes) → `rehype-slug` → `rehype-autolink-headings`.

### Tailwind v4 — no `tailwind.config`

All theme configuration lives in `src/app/globals.css`:

- Entry: `@import "tailwindcss"` (v4 syntax — no `@tailwind` directives)
- Tokens defined via `@theme inline { ... }` — generates Tailwind utility classes
- Colors use OKLCH throughout; light mode in `:root`, dark mode in `.dark`
- Custom variants: `@custom-variant dark (&:is(.dark *))`
- Custom utilities: `@utility focus-ring`, `@utility focus-ring-invert`

**Three-layer token model:**

1. Primitive — OKLCH values in `:root`/`.dark` (e.g. `--color-zinc-950`)
2. Semantic — CSS vars that reference primitives (e.g. `--background`, `--primary`)
3. Utility — `@theme inline` exposes semantics as Tailwind classes (e.g. `bg-background`)

Do not add `tailwind.config.ts` — v4 is CSS-first by design.

### Component layers

| Path                         | Contents                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `src/components/ui/`         | shadcn/ui primitives — owned source, modify directly                                    |
| `src/components/layout/`     | `Container` / `Section` / `Grid` structural primitives, barrel-exported from `index.ts` |
| `src/components/motion/`     | GSAP/rAF animation components — all SSR-safe, all respect `prefers-reduced-motion`      |
| `src/components/site/`       | Marketing chrome and page sections                                                      |
| `src/components/work/`       | Work detail and gallery components                                                      |
| `src/components/case-study/` | Case study layout: TOC sidebar, body, related rail                                      |
| `src/components/mdx/`        | MDX component map and flow helpers                                                      |
| `src/components/analytics/`  | PostHog provider, click delegator, scroll depth tracker                                 |

### Animation stack

- **GSAP** — page transitions in `(site)/template.tsx` (fade+slide enter on every route change), ScrollTrigger synced via `src/components/site/lenis-provider.tsx`
- **Lenis** — smooth scroll; LenisProvider must wrap all GSAP ScrollTrigger usage
- **Motion components** (`components/motion/`) are `"use client"` and loaded via `next/dynamic({ ssr: false })` to avoid hydration mismatches

### Analytics pattern

PostHog is configured cookieless (`persistence: "memory"`) to avoid GDPR consent requirements. Two patterns for firing events:

1. **Click delegator** (`components/analytics/click-delegator.tsx`) — single `document`-level listener that reads `data-cta-*` and `data-work-card-*` attributes. Lets server components emit events without converting to client.
2. **Typed event contract** in `src/lib/analytics/events.ts` — all event names are a discriminated union; use the typed helpers, never raw `posthog.capture()`.

### Calendly embed

`CalendlyModal` uses `window.Calendly.initInlineWidget()` loaded via a singleton promise in `src/lib/calendly/load.ts`. `CalendlyPrefetch` (mounted in `(site)/layout.tsx`) preloads the script on pointer intent. The `SheetContent` must remain `flex flex-col h-dvh` for the Calendly region to flex-fill correctly.

### OG images

Each route colocates an `opengraph-image.tsx` (Next.js ImageResponse) alongside `page.tsx`. Do not use a shared OG image route.

### Single-CTA contract

`SiteHeader` (md+) and `MobileCtaBar` (<md) are the **only** elements allowed to use `variant="default"` (filled) buttons. All in-page CTAs must use `variant="outline"` or plain text links.

### AI module

`src/lib/ai/gemini.ts` wraps Vercel AI SDK targeting Gemini 2.0 Flash Lite. Gated by `NEXT_PUBLIC_AI_ENABLED=true` — all callers must check this flag before invoking. Any changes to this file require backend authorization (see AGENTS.md).

### Environment variables

Copy `.env.local.example` to `.env.local`. Required keys:

| Variable                   | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog analytics                                                 |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest URL (default: EU region)                           |
| `GEMINI_API_KEY`           | Gemini AI calls (server-only)                                     |
| `NEXT_PUBLIC_AI_ENABLED`   | Set to `"true"` to enable AI; any other value disables gracefully |
