import posthog, { type PostHog } from "posthog-js";

let _posthog: PostHog | null = null;
let _initialised = false;

export function getPosthog(): PostHog | null {
  if (typeof window === "undefined") return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (_initialised) return _posthog;
  _initialised = true;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

  posthog.init(key, {
    api_host: host,
    ui_host: "https://eu.posthog.com",
    persistence: "memory",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });

  _posthog = posthog;
  return _posthog;
}
