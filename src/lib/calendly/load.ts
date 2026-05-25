declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
      initPopupWidget: (opts: {
        url: string;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
    };
  }
}

// Singleton promise — ensures widget.js is only ever injected once per page load.
let scriptPromise: Promise<void> | null = null;

const SCRIPT_URL = "https://assets.calendly.com/assets/external/widget.js";
const TIMEOUT_MS = 12_000;

export function loadCalendlyScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      // No-op in SSR; components calling this are client-only.
      reject(new Error("SSR"));
      return;
    }

    if (window.Calendly) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      scriptPromise = null; // allow a future retry
      reject(new Error("Calendly script load timeout"));
    }, TIMEOUT_MS);

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      clearTimeout(timeoutId);
      // Calendly registers window.Calendly synchronously on load.
      // One extra tick as a safety net for edge-case late registration.
      if (window.Calendly) {
        resolve();
      } else {
        setTimeout(() => {
          if (window.Calendly) resolve();
          else {
            scriptPromise = null;
            reject(new Error("window.Calendly not found after script load"));
          }
        }, 100);
      }
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      scriptPromise = null; // allow retry after network error
      reject(new Error("Calendly script failed to load"));
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
}

let cssPromise: Promise<void> | null = null;

const CSS_URL = "https://assets.calendly.com/assets/external/widget.css";

function loadCalendlyCss(): Promise<void> {
  if (cssPromise) return cssPromise;
  cssPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (document.querySelector(`link[href="${CSS_URL}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    link.onload = () => {
      resolve();
    };
    link.onerror = () => {
      resolve();
    }; // non-fatal — popup still works without it
    document.head.appendChild(link);
  });
  return cssPromise;
}

export function loadCalendlyPopupAssets(): Promise<void> {
  return Promise.all([loadCalendlyScript(), loadCalendlyCss()]).then(() => undefined);
}
