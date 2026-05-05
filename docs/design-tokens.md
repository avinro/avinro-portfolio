# Design Token Architecture

## Overview

All design tokens live in `src/app/globals.css`. This document explains the three-layer model, why we deviate from the Linear AC, and how to consume tokens in Phase 1 pages.

---

## Three-Layer Token Model

```
Layer 1 — Primitive
  Raw OKLCH values defined in :root (light) and .dark (dark mode).
  Never referenced directly in JSX — always via semantic tokens.

Layer 2 — Semantic
  CSS custom properties with purpose-driven names:
  --background, --primary, --success, --ring, etc.
  These are the single source of truth for all colour decisions.

Layer 3 — Utility
  Tailwind @theme inline resolves Layer 2 vars into Tailwind tokens
  (--color-background, --color-primary, …) which generate utility
  classes: bg-background, text-primary, border-ring, etc.
```

---

## Tailwind v4 CSS-First (deviation from Linear AC)

The Linear AC for PRO-7 specifies colour tokens in `tailwind.config.ts`.
This repo uses **Tailwind v4 CSS-first architecture**: there is no
`tailwind.config.ts`, and tokens are defined in `globals.css` via
`@theme inline`.

Why this is correct for this project:

- Tailwind v4 recommends the CSS-first approach and deprecates `tailwind.config.ts` for most use cases.
- All shadcn/ui components installed via the CLI rely on `@theme inline` CSS variables.
- CSS-first tokens work naturally with server components and avoid a build-time config import.

---

## Fonts

| Role               | Family           | Source             | License |
| ------------------ | ---------------- | ------------------ | ------- |
| Display / headings | Google Sans Flex | `next/font/google` | OFL-1.1 |
| Body / UI copy     | Manrope          | `next/font/google` | OFL-1.1 |
| Code / mono        | Geist Mono       | `next/font/google` | OFL-1.1 |

### How fonts are wired

`next/font/google` injects a `<link>` into `<head>` and sets a CSS variable on `<html>`.
Tailwind `@theme inline` must use **literal font names** (not `var(--font-*)`) because
`@theme inline` resolves at CSS parse time, not runtime.

```css
/* In globals.css @theme inline */
--font-display: "Google Sans Flex", ui-sans-serif, system-ui, sans-serif;
--font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace;
```

```tsx
/* In layout.tsx */
<html className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable}`}>
```

The `.variable` class sets `--font-display`, `--font-sans`, `--font-mono` on the element
for use by vanilla CSS (`font-family: var(--font-display)`). Tailwind utilities use the
literal strings from `@theme inline`.

---

## Colour Palette

Palette strategy: zinc monochrome base + blue-600 accent (OKLCH hue 265°).

| Token           | Light                    | Dark                     | Notes                    |
| --------------- | ------------------------ | ------------------------ | ------------------------ |
| `--background`  | `oklch(0.985 0 0)`       | `oklch(0.109 0 0)`       | Near-white / near-black  |
| `--foreground`  | `oklch(0.109 0 0)`       | `oklch(0.985 0 0)`       | ≈17:1 on background      |
| `--primary`     | `oklch(0.141 0 0)`       | `oklch(0.985 0 0)`       | Black → white (inverted) |
| `--accent`      | `oklch(0.508 0.235 265)` | `oklch(0.623 0.236 265)` | Blue-600 / Blue-400      |
| `--ring`        | `oklch(0.508 0.235 265)` | `oklch(0.623 0.236 265)` | Blue focus ring ≥5:1     |
| `--destructive` | `oklch(0.577 0.245 27)`  | `oklch(0.704 0.191 22)`  | Red-600 / Red-400        |
| `--success`     | `oklch(0.571 0.172 155)` | `oklch(0.661 0.155 145)` | Green-600 / Green-400    |
| `--warning`     | `oklch(0.687 0.194 62)`  | `oklch(0.831 0.163 78)`  | Amber-600 / Amber-300    |
| `--info`        | same as `--accent`       | same as `--accent`       | Blue                     |

### Contrast compliance (WCAG 2.1)

| Pair                          | Ratio | Standard                 |
| ----------------------------- | ----- | ------------------------ |
| foreground / background       | ≈17:1 | AAA ✓                    |
| muted-foreground / background | ≈6:1  | AA ✓                     |
| accent / background           | ≈5:1  | AA ✓ (also used as ring) |
| primary / background          | ≈16:1 | AAA ✓                    |

---

## Radius Scale

All radii derive from `--radius: 0.5rem` (8 px):

| Token          | Formula | Value       |
| -------------- | ------- | ----------- |
| `--radius-xs`  | `× 0.5` | 4 px        |
| `--radius-sm`  | `× 0.6` | 4.8 px      |
| `--radius-md`  | `× 0.8` | 6.4 px      |
| `--radius-lg`  | `× 1`   | 8 px (base) |
| `--radius-xl`  | `× 1.5` | 12 px       |
| `--radius-2xl` | `× 2`   | 16 px       |
| `--radius-3xl` | `× 2.5` | 20 px       |
| `--radius-4xl` | `× 3`   | 24 px       |

---

## Consuming Tokens in Phase 1

### In TSX / Tailwind classes

```tsx
// Use semantic utility classes — never raw hex
<div className="bg-background text-foreground border border-border" />
<button className="bg-primary text-primary-foreground" />
<p className="text-muted-foreground" />
```

### In MDX case studies

```mdx
<div className="bg-success text-success-foreground rounded-lg px-3 py-1">Outcome met</div>
```

### In vanilla CSS (if needed)

```css
.my-element {
  color: var(--foreground);
  background: var(--card);
  border-color: var(--border);
}
```

### Adding new semantic tokens

1. Define a raw OKLCH value in `:root` and `.dark` in `globals.css`.
2. Add a `--color-*` reference in the `@theme inline` block.
3. Document the token and its contrast in this file.
