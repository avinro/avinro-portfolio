import type { WorkFrontmatter } from "@/lib/content/works";

export type WorkCategory = WorkFrontmatter["category"];

/**
 * Minimal translator surface needed to localize a category — satisfied by the
 * object returned from next-intl's `getTranslations("work")` / `useTranslations("work")`.
 */
export interface CategoryTranslator {
  (key: string): string;
  has: (key: string) => boolean;
}

/**
 * Localizes the closed `category` enum through the `work.categories.*` catalog.
 *
 * The English enum value is itself the catalog key (it is the stable identifier
 * enforced by the Zod schema and cannot be localized in MDX), so a missing
 * translation falls back to the raw value — the badge never renders blank.
 */
export function localizeWorkCategory(category: WorkCategory, t: CategoryTranslator): string {
  const key = `categories.${category}`;
  return t.has(key) ? t(key) : category;
}
