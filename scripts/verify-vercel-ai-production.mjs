#!/usr/bin/env node
/**
 * Guardrail for production builds on Vercel only.
 *
 * When VERCEL_ENV=production, AiChat fails closed if NEXT_PUBLIC_AI_ENABLED !== "true"
 * or GEMINI_API_KEY is missing—the same conditions that hide the FAB and reject /api/chat.
 * Local npm run build and Preview CI builds skip this (VERCEL_ENV is unset).
 */

const env = process.env;

if (env.VERCEL_ENV !== "production") {
  process.exit(0);
}

let failed = false;

if (env.NEXT_PUBLIC_AI_ENABLED !== "true") {
  console.error(
    '[verify-vercel-ai-production] Production build aborted: NEXT_PUBLIC_AI_ENABLED must be exactly "true" (client bundle and /api/chat both require it). Add it under Vercel → Environment Variables → Production, then redeploy.',
  );
  failed = true;
}

if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === "") {
  console.error(
    "[verify-vercel-ai-production] Production build aborted: GEMINI_API_KEY is missing. Without it POST /api/chat returns 500 in production.",
  );
  failed = true;
}

if (failed) {
  process.exit(1);
}
