import { routing } from "@/i18n/routing";
import { INTRO_PENDING_HTML_CLASS, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";

/**
 * Pathnames that count as the home page (the domain root). The intro is an entry
 * experience: it only plays when the session's initial landing page is one of these.
 * With `localePrefix: "as-needed"` the default locale is unprefixed (`/`); other
 * locales are prefixed (e.g. `/es`).
 */
const INTRO_HOME_PATHS = [
  "/",
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => `/${locale}`),
];

/**
 * Runs in <head> on every full document load (before hydration), so it captures the
 * genuine session entry — client-side navigations never re-run it. If the intro has not
 * been seen and the entry path is the home page, block first paint so the intro can play.
 * If the entry path is any other page, mark the intro as seen so it stays suppressed for
 * the whole session, even if the visitor later navigates to the home page.
 */
export const INTRO_BLOCK_FIRST_PAINT_SCRIPT = `(function(){try{var k=${JSON.stringify(INTRO_SEEN_SESSION_KEY)};if(sessionStorage.getItem(k))return;var p=window.location.pathname.replace(/\\/+$/,"")||"/";if(${JSON.stringify(INTRO_HOME_PATHS)}.indexOf(p)!==-1){document.documentElement.classList.add(${JSON.stringify(INTRO_PENDING_HTML_CLASS)});}else{sessionStorage.setItem(k,"1");}}catch(e){}})();`;

export function clearIntroPendingMark(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(INTRO_PENDING_HTML_CLASS);
}
