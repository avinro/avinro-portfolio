# MDX Components

## Component map (`src/components/mdx/components.tsx`)

Maps HTML element names and named primitives to styled React components. All components are server-compatible except `MermaidDiagram`.

**Heading contract:** `h1` is owned by the page template (never appears in MDX body). MDX headings start at `h2`/`h3`. Both get `scroll-mt-24` to offset the sticky nav so in-page anchor links land in view.

**Links:** internal links use `next/link`; external links get `rel="noreferrer"`.

**Images proxied through `next/image`:** Only plain string paths are supported as `src`. Blob URLs are not.

**Inline code vs code blocks:** `rehype-pretty-code` adds `data-language` to `<code>` inside `<pre>`. Inline `<code>` (no parent `<pre>`) gets the muted pill style.

Work MDX uses `src/components/work/work-mdx-components.tsx`, a restricted map for visual exploration pages. It intentionally omits case-study primitives such as Stats, FlowChain, FlowSplit, StateGrid, PrincipleGrid, BranchTree, MermaidDiagram, BeforeAfter, and Bar. Allowed content stays prose-first: headings, body text, blockquotes, dividers, links, inline code, simple images, and contextual figures.

## MDX pipeline (`src/lib/mdx/options.ts`)

````
remark-gfm               tables, strikethrough, task lists, autolinks
remark-mermaid           rewrites ```mermaid fences to <MermaidDiagram> JSX
rehype-pretty-code       syntax highlighting, dual github-light/dark theme
rehype-slug              id="" on headings
rehype-autolink-headings anchor link appended after each heading
````

**Code theme contrast:** `github-light` and `github-dark` are validated for ≥4.5:1 contrast against the project's background tokens (`oklch(0.985 0 0)` light, `oklch(0.109 0 0)` dark).

**Anchor links:** behavior `"append"` — a visually hidden `#` anchor is added after heading text. Revealed on `:focus-visible` via CSS. The anchor also satisfies the ≥44px touch target rule (`min-h-[44px] min-w-[44px]`).

**`blockJS: false`:** next-mdx-remote defaults to stripping JavaScript attribute expressions (`removeJavaScriptExpressions`). This would silently strip `width={1920}` on `<Figure>`, causing images to lose intrinsic dimensions and fall back to `fill` + default 16/9 aspect. Content is trusted (repo-owned MDX only), so `blockJS: false` is safe.

## Editorial primitives

### `<Figure>`

Full-width image with optional caption. When `src` is absent, renders a designed placeholder (maintains aspect ratio to prevent layout collapse).

```mdx
<Figure
  src="/case-studies/hello-dojo/images/oneline-impact.jpg"
  alt="helloDojo Customer App"
  width={1600}
  height={900}
  caption="Optional caption"
/>
```

### `<TextImageSplit>`

Side-by-side text content and image (4:3 aspect). `imagePosition` can be `"left"` or `"right"`.

```mdx
<TextImageSplit
  title="Section title"
  imagePosition="right"
  src="/path/to/image.jpg"
  alt="Description"
>
  Paragraph content here.
</TextImageSplit>
```

### `<Stats>`

Responsive grid of KPI blocks. Each stat requires `value` and `label`.

```mdx
<Stats
  items={[
    { value: "4.8★", label: "App Store rating" },
    { value: "2×", label: "Session length" },
    { value: "−34%", label: "Support tickets" },
  ]}
/>
```

### `<BeforeAfter>`

Two-column comparison card. Props are named `before` and `after` (not `from`/`to` — those are ES module keywords that cause MDX compile errors).

```mdx
<BeforeAfter
  before="Users couldn't find the checkout button"
  after="Checkout completion up 28% after repositioning"
/>
```

### `<Bar>`

Horizontal proportion bar with label. Use for showing relative magnitudes.

```mdx
<Bar label="Task completion" value={78} max={100} />
```

## Flow primitives (`src/components/mdx/flow-primitives.tsx`)

Visual diagram system built on a child-based API (works reliably with next-mdx-remote/rsc).

**Wrapper components (layout containers):**

| Component       | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `FlowChain`     | Linear chain with connector chips between steps     |
| `FlowSplit`     | N columns side by side                              |
| `StateGrid`     | Responsive grid of state cards                      |
| `PrincipleGrid` | Larger editorial cards with numbered pills          |
| `BranchTree`    | Root node branching into N parallel vertical chains |

**Leaf components (content nodes):**

| Component       | Used inside                         |
| --------------- | ----------------------------------- |
| `FlowItem`      | `FlowChain`, `Branch`, `FlowColumn` |
| `FlowColumn`    | `FlowSplit`                         |
| `StateItem`     | `StateGrid`                         |
| `PrincipleItem` | `PrincipleGrid`                     |
| `Branch`        | `BranchTree`                        |

`FlowChain` with `direction="auto"` is vertical on mobile, horizontal on md+. When horizontal, items are chunked into rows — each row still collapses to vertical on mobile.

## MermaidDiagram (`src/components/mdx/mermaid-diagram.tsx`)

Renders Mermaid diagrams as inline SVGs. Loaded via `next/dynamic({ ssr: false })` to avoid SSR hydration mismatches (Mermaid requires `window`).

- `securityLevel: "strict"` — disables code evaluation and dangerous SVG features. The resulting SVG is safe to inject via `dangerouslySetInnerHTML`.
- `prefers-reduced-motion`: built-in Mermaid animation is disabled when reduced motion is requested.
- First comment in the Mermaid source is used as `aria-label` for the diagram.
- A skeleton with reserved aspect ratio is shown during render to prevent CLS.
