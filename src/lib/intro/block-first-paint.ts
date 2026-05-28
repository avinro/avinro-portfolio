import { INTRO_PENDING_HTML_CLASS, INTRO_SEEN_SESSION_KEY } from "@/lib/intro/constants";

export const INTRO_BLOCK_FIRST_PAINT_SCRIPT = `(function(){try{if(!sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_SESSION_KEY)})){document.documentElement.classList.add(${JSON.stringify(INTRO_PENDING_HTML_CLASS)});}}catch(e){}})();`;

export function clearIntroPendingMark(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(INTRO_PENDING_HTML_CLASS);
}
