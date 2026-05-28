# Integrations

## PostHog (`src/lib/analytics/posthog.ts`)

Cookieless analytics singleton, lazy-initialised on the client.

| Config                      | Value               | Why                                                                                                                                                                                                                          |
| --------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `persistence`               | `"memory"`          | No localStorage, no cookies. Satisfies "no cookies required for basic tracking" without a consent flow. Trade-off: `distinct_id` resets on each page load — cross-session funnels unavailable until a consent flow is added. |
| `autocapture`               | `false`             | Only explicit typed events from `src/lib/analytics/events.ts` are sent. Prevents accidental PII capture from DOM selectors.                                                                                                  |
| `capture_pageview`          | `false`             | App Router client transitions don't fire native browser navigations. Pageviews are captured manually in `PostHogProvider`.                                                                                                   |
| `disable_session_recording` | `true`              | No session replay.                                                                                                                                                                                                           |
| `loaded` callback           | `ph.debug()` in dev | Logs events to the console for manual verification during development.                                                                                                                                                       |

If `NEXT_PUBLIC_POSTHOG_KEY` is absent, `getPosthog()` returns `null` and all `track()` calls no-op silently. The site must function identically without analytics.

The `AnalyticsClickDelegator` in `src/components/analytics/click-delegator.tsx` installs a single `document`-level click listener. Server components can fire analytics events by adding `data-cta-*` or `data-work-card-*` attributes — no client component conversion needed.

CTA events take priority over work-card events when attributes are nested. Case-study scroll depth uses four invisible sentinels at 25/50/75/100 percent and a module-level fired-threshold map, so each threshold fires once per slug per SPA session.

## Calendly (`src/lib/calendly/load.ts`)

Singleton promise pattern ensures `widget.js` is injected only once per page load regardless of how many components request it.

**Loading sequence:**

1. `loadCalendlyScript()` is called; if a promise already exists it is returned immediately
2. The script is appended to `<head>` with `async`
3. On `script.onload`: Calendly registers `window.Calendly` synchronously. A 100 ms safety net handles edge-case late registration.
4. A 12-second timeout clears `scriptPromise` to allow a future retry
5. `loadCalendlyPopupAssets()` loads both script and CSS in parallel

`CalendlyPrefetch` (mounted in `(site)/layout.tsx`) preloads the script on pointer intent to reduce perceived latency when the contact sheet opens.

The `SheetContent` must remain `flex flex-col h-dvh` for the Calendly region to `flex-1` fill correctly.

## AI / Gemini (`src/lib/ai/gemini.ts`)

Server-only module. Never import from client components.

`GEMINI_API_KEY` and `NEXT_PUBLIC_AI_ENABLED` are read at call time (not module load) so tests can override `process.env` before calling.

**Triple feature flag:**

1. Client component (`ai-chat-loader.tsx`): `NEXT_PUBLIC_AI_ENABLED !== "true"` → renders nothing
2. Route handler (`/api/chat`): same check → returns 403
3. Server module (`gemini.ts`): same check → logs and returns `null`

**Retry strategy:** single retry on HTTP 429 (rate limit) or 503 (service unavailable), with `500ms + random(0–500ms)` backoff+jitter. No retry on any other error.

**Prompt injection prevention:**

- System prompt is built statically from repo-owned MDX files at call time; no user input enters the system prompt
- `sanitizeMessage()` strips `<system>`, `[INST]`, `<<SYS>>` tags from all user messages
- Message history is capped at the last 10 messages; each message truncated to 1,000 characters
- AI response HTML is sanitised via DOMPurify with a strict allowlist before `dangerouslySetInnerHTML`

Every call (including disabled ones) is logged with token counts, latency, and cost estimate.

## SEO constants (`src/lib/seo/site.ts`)

`SITE_URL` is always the stable production canonical base (`https://avinro.com`). Never derive canonical URLs or sitemap entries from preview deployment env vars — that would pollute search-engine indexes with ephemeral URLs.

Social profile URLs in `SOCIAL_LINKS` are intentionally not emitted into JSON-LD `sameAs` until verified. Placeholder strings would be invalid schema.org data and could harm search ranking.

JSON-LD output in `src/lib/seo/json-ld.tsx` escapes `</` as `<` to prevent `</script>` injection attacks.
