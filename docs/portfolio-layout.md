# Portfolio Layout System

The portfolio layout is a thin, mobile-first composition system built on top of the design tokens delivered by PRO-7. It provides three primitives — `Container`, `Section`, `Grid/GridItem` — and a semantic spacing scale, so portfolio pages stay consistent without re-deciding rhythm and width on every page.

## Breakpoints

The site follows Tailwind v4 default breakpoints, applied mobile-first. Base styles target a 375 px viewport; responsive prefixes only expand or adjust upward.

| Prefix | Min-width | Typical device                   |
| ------ | --------- | -------------------------------- |
| (base) | 375 px    | small phone portrait             |
| `sm:`  | 640 px    | large phone landscape            |
| `md:`  | 768 px    | tablet portrait                  |
| `lg:`  | 1024 px   | tablet landscape / small desktop |
| `xl:`  | 1280 px   | desktop                          |
| `2xl:` | 1536 px   | wide desktop                     |

Rules (enforced by [`/.cursor/rules/mobile-first.mdc`](../.cursor/rules/mobile-first.mdc)):

- Base classes target mobile, never desktop.
- Responsive prefixes are additive only.
- `max-sm:` / `max-md:` and similar max-width prefixes are not allowed.

## Spacing scale

Defined in [`src/app/globals.css`](../src/app/globals.css) under `@theme inline`. Hero and section tokens use `clamp()` so they scale fluidly with the viewport — no media queries are needed in components.

| Token             | Value                    | Use                                             |
| ----------------- | ------------------------ | ----------------------------------------------- |
| `--space-inline`  | `0.75rem` (12 px)        | gap between adjacent inline elements            |
| `--space-card`    | `1.5rem` (24 px)         | internal padding of cards / compact blocks      |
| `--space-section` | `clamp(3rem, 6vw, 5rem)` | vertical gap between page sections (48 → 80 px) |
| `--space-hero`    | `clamp(4rem, 8vw, 6rem)` | vertical padding for hero blocks (64 → 96 px)   |

Static values (`inline`, `card`) stay constant on purpose: component-level density is predictable. Fluid values (`section`, `hero`) breathe with the viewport because they govern page-level rhythm.

## Layout primitives

All three primitives follow the project component pattern (`cva` + `cn` + `data-slot`/`data-variant`). They are server-component compatible and never render `"use client"`.

`className` always wins over variant styles via `cn()`, so consumers can override defaults without copying the variant logic.

### Container

Centers its children, applies a responsive max-width, and applies adaptive horizontal gutters (`px-4 sm:px-6 lg:px-8`).

| Prop    | Values                                    | Default   |
| ------- | ----------------------------------------- | --------- |
| `width` | `narrow` \| `default` \| `wide` \| `full` | `default` |

Width semantics:

- `narrow` (`max-w-prose`) — long-form prose, case study body copy.
- `default` (`max-w-6xl`) — standard portfolio sections.
- `wide` (`max-w-7xl`) — hero blocks, gallery grids.
- `full` (`max-w-none`) — edge-to-edge sections.

```tsx
<Container width="default">
  <h1 className="text-4xl">Selected work</h1>
</Container>
```

### Section

Applies vertical padding from the spacing scale and renders a semantic landmark (`section` by default). Use the `as` prop to render `header`, `main`, `article` or `div` when the page hierarchy requires it.

| Prop      | Values                                                | Default   |
| --------- | ----------------------------------------------------- | --------- |
| `spacing` | `hero` \| `section` \| `card` \| `none`               | `section` |
| `as`      | `section` \| `header` \| `main` \| `article` \| `div` | `section` |

```tsx
<Section as="header" spacing="hero">
  <Container width="wide">…</Container>
</Section>
```

### Grid / GridItem

A single-column grid below the `lg` breakpoint, full 12-column grid from `lg` (1024 px) up. Tablet portrait stays single-column on purpose: 12 columns at 768 px produce columns that are too narrow for editorial content.

`Grid` props:

| Prop  | Values                          | Default   |
| ----- | ------------------------------- | --------- |
| `gap` | `tight` \| `default` \| `loose` | `default` |

Gap semantics:

- `tight` (`gap-3`, 12 px) — dense card lists.
- `default` (`gap-6`, 24 px) — standard portfolio grid.
- `loose` (`gap-8`, 32 px) — gallery-style spacing.

`GridItem` props:

| Prop | Values   | Default             |
| ---- | -------- | ------------------- |
| `lg` | `1`–`12` | full row on desktop |

```tsx
<Grid gap="default">
  <GridItem lg={8}>main content</GridItem>
  <GridItem lg={4}>aside</GridItem>
</Grid>
```

> Note: `GridItem` only exposes the `lg` span. Mobile is always single-column. If a layout needs different column tracks at other breakpoints, drop down to plain Tailwind grid utilities — the `Grid/GridItem` API is intentionally narrow.

## Home page composition (PRO-13)

The public home (`/`) is assembled from section components that live in `src/components/site/`. All copy is centralised in `src/lib/content/home.ts` so a future content issue can swap placeholder text without touching component files.

### Section tree

```
RootLayout
└── <main id="main-content">
    ├── <HomeHero>       Section spacing="hero", Container width="wide"
    ├── <SelectedWork>   Section, Grid 12-col → 2 cards lg:6/6
    ├── <SocialProof>    Section spacing="card"
    ├── <AboutTeaser>    Section, Container width="narrow"
    └── <FinalCta>       Section spacing="hero" — secondary link only
```

Global chrome in `RootLayout`:

- `<SiteHeader>` — sticky top, skip link, primary CTA at `md+`
- `<SiteFooter>` — minimal links, `pb-[var(--space-cta-bar)] md:pb-0`
- `<MobileCtaBar>` — fixed bottom, `md:hidden`, `pb-[env(safe-area-inset-bottom)]`

### CTA strategy — one and only one primary CTA

`ui-ux-pro-max §4 primary-action` requires exactly one primary CTA visible at any scroll depth:

- **`md+`**: `SiteHeader` renders the primary `Button` ("Book a call") in a sticky bar at the top.
- **`<md`**: `MobileCtaBar` renders the same CTA in a fixed bar at the bottom.
- **In-page sections** (`HomeHero`, `FinalCta`) use `variant="outline"` or `variant="link"` only — never `variant="default"`.

### Accessibility additions (ui-ux-pro-max §1)

- Skip link (`href="#main-content"`) is the first focusable element in `SiteHeader`; it becomes visible on keyboard focus.
- `<main id="main-content">` is the skip link target.
- `scroll-padding-top: 4rem` in `globals.css` prevents the sticky header from covering anchor targets or keyboard-focused elements.
- Decorative thumbnails and logo placeholder blocks carry `aria-hidden="true"`.
- Touch targets meet ≥44px via `min-h-[44px]` on interactive card rows and the sticky CTA button.

### Spacing tokens added in PRO-13

| Token             | Value    | Use                                                             |
| ----------------- | -------- | --------------------------------------------------------------- |
| `--space-cta-bar` | `4.5rem` | Bottom padding on `SiteFooter` on `<md` to clear `MobileCtaBar` |

## Validation checklist (ui-ux-pro-max §5)

Apply on every portfolio page before merging:

- mobile-first — base classes target mobile, responsive prefixes are additive.
- breakpoint-consistency — only `sm`, `md`, `lg`, `xl`, `2xl` are used.
- container-width — pages use `Container` (or document why they don't).
- spacing-scale — vertical rhythm comes from `Section.spacing`, not ad-hoc `py-*`.
- viewport-units — `min-h-dvh` instead of `100vh` (already applied in [`src/app/layout.tsx`](../src/app/layout.tsx)).
- horizontal-scroll — verified at 375 px that nothing overflows.
- safe-area — `Container` gutters keep content away from screen edges.
- skip-link — `SiteHeader` includes a visible-on-focus skip link targeting `#main-content`.
- single-primary-cta — only `SiteHeader` (md+) and `MobileCtaBar` (<md) use `variant="default"`.
- touch-targets — interactive elements have a minimum 44px touch area.
