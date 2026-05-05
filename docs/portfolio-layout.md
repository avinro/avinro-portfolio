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

## Validation checklist (ui-ux-pro-max §5)

Apply on every portfolio page before merging:

- mobile-first — base classes target mobile, responsive prefixes are additive.
- breakpoint-consistency — only `sm`, `md`, `lg`, `xl`, `2xl` are used.
- container-width — pages use `Container` (or document why they don't).
- spacing-scale — vertical rhythm comes from `Section.spacing`, not ad-hoc `py-*`.
- viewport-units — `min-h-dvh` instead of `100vh` (already applied in [`src/app/layout.tsx`](../src/app/layout.tsx)).
- horizontal-scroll — verified at 375 px that nothing overflows.
- safe-area — `Container` gutters keep content away from screen edges.
