import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Hexagon,
  LayoutGrid,
  Layers,
  Tag,
  Target,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type {
  WorkHeaderMetadataItem,
  WorkHeaderMetadataKind,
} from "@/lib/content/work-header-metadata";

export type WorkMetadataKind =
  | "type"
  | "industry"
  | "year"
  | "timeline"
  | "platform"
  | "status"
  | "role"
  | "client"
  | "team"
  | "scope";

export type WorkMetadataVisualKind = WorkMetadataKind | "category" | "live";

const METADATA_ICON: Record<WorkMetadataVisualKind, LucideIcon> = {
  type: LayoutGrid,
  industry: Building2,
  year: Calendar,
  timeline: Clock,
  platform: Hexagon,
  status: Zap,
  role: Layers,
  client: UserRound,
  team: Users,
  scope: Target,
  category: Tag,
  live: ExternalLink,
};

const METADATA_ICON_TONE: Record<WorkMetadataVisualKind, string> = {
  type: "text-sky-600 dark:text-sky-400/95",
  industry: "text-violet-600 dark:text-violet-400/95",
  year: "text-amber-700 dark:text-amber-500/95",
  timeline: "text-amber-700 dark:text-amber-500/95",
  platform: "text-emerald-700 dark:text-emerald-400/95",
  status: "text-orange-600 dark:text-orange-400/95",
  role: "text-rose-600 dark:text-rose-400/95",
  client: "text-fuchsia-700 dark:text-fuchsia-400/95",
  team: "text-cyan-700 dark:text-cyan-400/95",
  scope: "text-indigo-700 dark:text-indigo-400/95",
  category: "text-muted-foreground",
  live: "text-accent",
};

const METADATA_VALUE_CLASS = "font-display text-foreground text-base leading-[1.1] font-semibold";

const METADATA_VALUE_MDX_CHILD =
  "[&>p]:text-foreground [&>p]:mb-0 [&>p]:text-base [&>p]:leading-[1.1] [&>p]:font-semibold [&>p]:sm:text-base [&>p]:lg:leading-[1.1]";

export function WorkMetadataGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export interface WorkMetadataCardProps {
  kind: WorkMetadataKind;
  children: ReactNode;
  className?: string;
}

export async function WorkMetadataCard({ kind, children, className }: WorkMetadataCardProps) {
  const t = await getTranslations("work");
  const Icon = METADATA_ICON[kind];
  const label = t(`metadata.${kind}`);
  const iconTone = METADATA_ICON_TONE[kind];

  return (
    <div
      className={cn(
        "metadata-card border-border/40 bg-muted/20 flex flex-col gap-2 rounded-lg border p-4",
        className,
      )}
    >
      <div className="metadata-header flex min-h-[1.125rem] items-center gap-2">
        <Icon
          aria-hidden
          className={cn("metadata-icon size-4 shrink-0", iconTone)}
          strokeWidth={1.75}
        />
        <span className="metadata-label text-muted-foreground font-mono text-xs leading-none tracking-widest uppercase">
          {label}
        </span>
      </div>
      <div className={cn("metadata-value", METADATA_VALUE_CLASS, METADATA_VALUE_MDX_CHILD)}>
        {children}
      </div>
    </div>
  );
}

interface WorkHeaderMetaItemProps {
  kind: WorkHeaderMetadataKind;
  value: string;
  href?: string;
  label: string;
}

function WorkHeaderMetaItem({ kind, value, href, label }: WorkHeaderMetaItemProps) {
  const Icon = METADATA_ICON[kind];
  const iconTone = METADATA_ICON_TONE[kind];
  const isLink = kind === "live" && href;

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex min-h-[1.125rem] items-center gap-2">
        <Icon aria-hidden className={cn("size-4 shrink-0", iconTone)} strokeWidth={1.75} />
        <span className="text-muted-foreground font-mono text-xs leading-none tracking-widest uppercase">
          {label}
        </span>
      </div>
      {isLink ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "text-accent hover:text-accent/80 inline-flex min-h-[44px] items-center gap-1.5 break-words transition-colors",
            METADATA_VALUE_CLASS,
          )}
        >
          {value}
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <p className={cn("break-words", METADATA_VALUE_CLASS)}>{value}</p>
      )}
    </div>
  );
}

export interface WorkHeaderMetaProps {
  items: WorkHeaderMetadataItem[];
  labelMap: Record<WorkHeaderMetadataKind, string>;
  className?: string;
}

export interface WorkHeaderTagsProps {
  labels: string[];
  ariaLabel?: string;
  className?: string;
}

export function WorkHeaderTags({ labels, ariaLabel, className }: WorkHeaderTagsProps) {
  if (labels.length === 0) return null;

  return (
    <ul className={cn("flex min-w-0 flex-wrap gap-2", className)} aria-label={ariaLabel}>
      {labels.map((label) => (
        <li key={label}>
          <span className="bg-muted text-muted-foreground inline-block max-w-full rounded-full px-3 py-1 font-mono text-xs tracking-wide break-words uppercase">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WorkHeaderMeta({ items, labelMap, className }: WorkHeaderMetaProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("border-border/40 border-t pt-6", className)}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <WorkHeaderMetaItem
            key={item.kind}
            kind={item.kind}
            value={item.value}
            href={item.href}
            label={labelMap[item.kind]}
          />
        ))}
      </div>
    </div>
  );
}
