import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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
