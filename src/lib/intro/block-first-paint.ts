import { routing } from "@/i18n/routing";
import { INTRO_CHECKING_HTML_CLASS } from "@/lib/intro/constants";

/**
 * Pathnames that count as the home page (the domain root). The intro is an entry
 * experience: it only plays when the session's initial landing page is one of these.
 * With `localePrefix: "as-needed"` the default locale is unprefixed (`/`); other
 * locales are prefixed (e.g. `/es`).
 */
export const INTRO_HOME_PATHS = [
  "/",
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => `/${locale}`),
];

export function normalizeIntroPath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isIntroHomePath(pathname: string): boolean {
  return INTRO_HOME_PATHS.includes(normalizeIntroPath(pathname));
}

export function clearIntroCheckingMark(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(INTRO_CHECKING_HTML_CLASS);
}
