import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Grid — 12-column responsive grid for portfolio pages.
 *
 * Mobile (< lg): single column. Tablet portrait stays single column
 * because 12 columns at 768 px produce columns that are too narrow for
 * editorial content.
 * Desktop (lg, ≥ 1024 px): full 12-column grid.
 *
 * Gap variants map to the semantic spacing scale:
 *   tight    → gap-3   (12 px)
 *   default  → gap-6   (24 px) — matches --space-card
 *   loose    → gap-8   (32 px)
 *
 * The grid is intentionally not configurable per-row; if a layout
 * needs custom column tracks, use plain Tailwind grid utilities.
 */
const gridVariants = cva("grid grid-cols-1 lg:grid-cols-12", {
  variants: {
    gap: {
      tight: "gap-3",
      default: "gap-6",
      loose: "gap-8",
    },
  },
  defaultVariants: {
    gap: "default",
  },
});

type GridProps = React.ComponentProps<"div"> & VariantProps<typeof gridVariants>;

function Grid({ className, gap = "default", ...props }: GridProps) {
  return (
    <div
      data-slot="grid"
      data-gap={gap}
      className={cn(gridVariants({ gap }), className)}
      {...props}
    />
  );
}

/*
 * GridItem — child of Grid that controls column spans per breakpoint.
 *
 * Tailwind v4 cannot generate utility classes from runtime values, so
 * we map allowed spans to fully-spelled class names. This is verbose
 * but ensures every span Tailwind sees in source is a literal class.
 *
 * Props:
 *   span  → mobile span (1, applies always; provided for symmetry)
 *   lg    → desktop span (1–12), applied at the lg: breakpoint
 *
 * If lg is omitted, the item spans the full row on desktop.
 */
const lgSpanClasses = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
} as const;

type GridItemSpan = keyof typeof lgSpanClasses;

type GridItemProps = React.ComponentProps<"div"> & {
  lg?: GridItemSpan;
};

function GridItem({ className, lg, ...props }: GridItemProps) {
  return (
    <div
      data-slot="grid-item"
      data-lg-span={lg}
      className={cn(lg ? lgSpanClasses[lg] : undefined, className)}
      {...props}
    />
  );
}

export { Grid, GridItem, gridVariants };
export type { GridProps, GridItemProps, GridItemSpan };
