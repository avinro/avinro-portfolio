import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    width: {
      narrow: "max-w-prose",
      default: "max-w-[1440px]",
      wide: "max-w-[1440px]",
      caseStudy: "max-w-[1440px]",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    width: "default",
  },
});

type ContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  };

function Container({ className, width = "default", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      data-width={width}
      className={cn(containerVariants({ width }), className)}
      {...props}
    />
  );
}

export { Container, containerVariants };
export type { ContainerProps };
