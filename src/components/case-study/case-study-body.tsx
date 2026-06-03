import type { ReactNode } from "react";
import type { TocHeading } from "@/lib/content/toc";
import { TocSidebar } from "./toc-sidebar";
import { cn } from "@/lib/utils";

interface CaseStudyBodyProps {
  headings: TocHeading[];
  children: ReactNode;
  rail?: ReactNode;
  className?: string;
}

export function CaseStudyBody({ headings, children, rail, className }: CaseStudyBodyProps) {
  const hasToc = headings.length >= 2;

  if (!hasToc) {
    return (
      <div
        className={cn(
          "flex flex-col",
          rail && "xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-8",
          className,
        )}
      >
        <div className="min-w-0">{children}</div>
        {rail}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        "lg:grid lg:gap-12",
        rail
          ? "lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[12rem_minmax(0,1fr)_13rem] xl:gap-8"
          : "lg:grid-cols-[14rem_minmax(0,1fr)]",
        className,
      )}
    >
      <TocSidebar headings={headings} />
      <div className="min-w-0">{children}</div>
      {rail}
    </div>
  );
}
