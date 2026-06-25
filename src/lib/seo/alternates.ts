import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

/** Absolute or root-relative URL for `path` in `locale` (en has no prefix). */
function localizedPath(locale: Locale, path: string): string {
  return locale === routing.defaultLocale ? path : `/${locale}${path}`;
}

/**
 * Builds locale-aware `alternates` for a localized page.
 *
 * The canonical self-references the current locale (so the `/es` variant no
 * longer points at the English URL and mark itself a duplicate), and `languages`
 * emits the hreflang cluster — kept in sync with the sitemap's alternates.
 */
export function buildLocaleAlternates(locale: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      en: path,
      es: `/es${path}`,
      "x-default": path,
    },
  };
}
