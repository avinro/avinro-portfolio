import { Link } from "@/i18n/navigation";

import { cn } from "@/lib/utils";
import type { WorkCase } from "@/lib/content/home";

interface WorkCardProps {
  case_: WorkCase;
  index: number;
  className?: string;
}

export function WorkCard({ case_, index, className }: WorkCardProps) {
  const num = String(index).padStart(2, "0");
  const tagLine = case_.tags.join(" · ");

  return (
    <Link
      href={`/work/${case_.slug}`}
      data-slot="work-card"
      data-work-card-slug={case_.slug}
      data-work-card-title={case_.title}
      data-work-card-source="home_selected_work"
      className={cn(
        "group border-border/40 first:border-border/40 hover:border-border/80 focus-visible:ring-ring flex flex-col gap-4 border-b py-8 transition-colors duration-200 first:border-t focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-start gap-5 sm:gap-8">
        <span className="text-muted-foreground shrink-0 font-mono text-base tabular-nums sm:text-lg">
          {num}
        </span>
        <div className="flex min-h-[44px] flex-1 flex-col justify-center gap-1 transition-transform duration-200 group-hover:translate-x-1 sm:flex-row sm:items-center sm:gap-0">
          <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {case_.title}
          </h3>
          <span className="text-muted-foreground text-sm sm:mr-6 sm:ml-auto">{tagLine}</span>
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground mt-1 shrink-0 transition-transform duration-200 group-hover:translate-x-2"
        >
          →
        </span>
      </div>
      <p className="text-muted-foreground pl-0 text-sm leading-relaxed sm:pl-[calc(1rem+2rem)]">
        {case_.summary}
      </p>
      <div
        aria-hidden="true"
        className={cn(
          "h-[3px] w-full rounded-full bg-gradient-to-r opacity-70 transition-opacity duration-200 group-hover:opacity-100",
          case_.gradient,
        )}
      />
    </Link>
  );
}
