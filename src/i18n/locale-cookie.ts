import type { Locale } from "@/i18n/routing";

/**
 * Cookie the next-intl routing proxy reads for locale detection.
 * Keep in sync with the default cookie name used by `next-intl/middleware`.
 */
const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persist the chosen locale so the routing proxy keeps it across navigations.
 *
 * The default (unprefixed) locale never updates this cookie on its own, so
 * without writing it explicitly, locale detection would redirect subsequent
 * requests back to the Accept-Language locale. Writing it makes the language
 * selection global.
 */
export function persistLocaleChoice(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${String(ONE_YEAR_SECONDS)};samesite=lax`;
}
