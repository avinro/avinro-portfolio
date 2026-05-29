/** Session flag — intro completed for this tab session. */
export const INTRO_SEEN_SESSION_KEY = "avinro:intro-seen";

/** One-shot flag consumed by (site)/template.tsx to delay page-enter after intro. */
export const INTRO_JUST_COMPLETED_SESSION_KEY = "avinro:intro-just-completed";

/** Applied to <html> from SSR until the client intro gate has hydrated. */
export const INTRO_CHECKING_HTML_CLASS = "avinro-intro-checking";
