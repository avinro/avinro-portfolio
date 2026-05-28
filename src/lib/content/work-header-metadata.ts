import type { WorkFrontmatter } from "@/lib/content/works";

/**
 * Header metadata field keys. Extends body card kinds with frontmatter-only fields.
 * Order in WORK_HEADER_METADATA_ORDER controls editorial scan priority.
 */
export type WorkHeaderMetadataKind =
  | "type"
  | "client"
  | "category"
  | "industry"
  | "year"
  | "platform"
  | "status"
  | "role"
  | "live";

export interface WorkHeaderMetadataItem {
  kind: WorkHeaderMetadataKind;
  value: string;
  href?: string;
}

/** Stable display order — editorial priority, not alphabetical. */
export const WORK_HEADER_METADATA_ORDER: WorkHeaderMetadataKind[] = [
  "type",
  "client",
  "category",
  "industry",
  "year",
  "platform",
  "status",
  "role",
  "live",
];

function normalizeValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

/**
 * Builds the header metadata strip from frontmatter.
 * Skips empty values; no per-project branching.
 */
export function buildWorkHeaderMetadata(
  frontmatter: WorkFrontmatter,
  viewLiveLabel = "View live",
): WorkHeaderMetadataItem[] {
  const { meta, year, category, client, externalLink } = frontmatter;

  const candidates: Partial<Record<WorkHeaderMetadataKind, WorkHeaderMetadataItem>> = {
    type: meta.type ? { kind: "type", value: meta.type } : undefined,
    client: client ? { kind: "client", value: client } : undefined,
    category: { kind: "category", value: category },
    industry: meta.industry ? { kind: "industry", value: meta.industry } : undefined,
    year: {
      kind: "year",
      value: normalizeValue(meta.yearLabel) ?? String(year),
    },
    platform: meta.platform ? { kind: "platform", value: meta.platform } : undefined,
    status: meta.status ? { kind: "status", value: meta.status } : undefined,
    role: meta.role ? { kind: "role", value: meta.role } : undefined,
    live: externalLink ? { kind: "live", value: viewLiveLabel, href: externalLink } : undefined,
  };

  return WORK_HEADER_METADATA_ORDER.flatMap((kind) => {
    const item = candidates[kind];
    if (!item?.value) return [];
    return [item];
  });
}

/**
 * Merges tags and tools into a deduplicated pill list for the hero header.
 * Case-insensitive dedup preserves the first occurrence's casing.
 */
export function buildWorkHeaderTags(tags: string[], tools: string[]): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const raw of [...tags, ...tools]) {
    const label = raw.trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }

  return labels;
}
