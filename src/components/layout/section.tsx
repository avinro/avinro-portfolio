import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sectionVariants = cva("", {
  variants: {
    spacing: {
      hero: "py-(--space-hero)",
      heroInternal: "pt-[7rem] pb-(--space-hero)",
      heroInternalCompact: "pt-[7rem] pb-(--space-hero)",
      section: "py-(--space-section)",
      card: "py-(--space-card)",
      none: "",
    },
  },
  defaultVariants: {
    spacing: "section",
  },
});

type SectionElement = "section" | "header" | "main" | "article" | "div";

type SectionProps = Omit<React.HTMLAttributes<HTMLElement>, "as"> &
  VariantProps<typeof sectionVariants> & {
    as?: SectionElement;
  };

function Section({ className, spacing = "section", as: Tag = "section", ...props }: SectionProps) {
  const Component = Tag as React.ElementType;
  return (
    <Component
      data-slot="section"
      data-spacing={spacing}
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export { Section, sectionVariants };
export type { SectionProps, SectionElement };
