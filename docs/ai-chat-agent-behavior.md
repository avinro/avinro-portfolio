# AI Chat Agent (Vivi) — Behavior Contract

Record of how the portfolio chat agent must behave, so the rules shaped in development don't regress. Vivi is an assistant **about** Ary (third person), not Ary.

Defining files:

- `src/app/api/chat/route.ts` — request handling, security guards, tool wiring, contact short-circuit, card resolution.
- `src/lib/ai/portfolio-context.ts` — system prompt (dynamic project index + behavior rules).
- `src/components/site/ai-chat.tsx` — chat UI, panel/sheet, message rendering, shown-slug tracking.
- `src/components/site/chat-contact-actions.tsx` — contact CTA buttons.
- Cards reuse `WorkGalleryCard` / `CaseStudyGridCard` (with `eager`).

## Answer quality (the #1 rule — do not regress)

- **DO** answer first with complete, warm, flowing prose — the way the portfolio reads. Honor LENGTH (2-4 sentences, up to 5-6 for rich topics). The prose IS the answer.
- **DON'T** cap project/contact answers to "1-2 sentences", and **don't** force tool-only replies. Cards/buttons are **additive**, never a substitute for a substantive answer.
- **Why this matters:** integrating tool calls originally broke answers — "you MUST call the tool / naming a project without a card is forbidden" + "1-2 sentences" caps pushed the model to terse or empty (tool-only) replies. Fixed by making prose primary and relying on the mention-fallback for cards.
- Server aggregates prose across all steps (`result.steps[].text`), so multi-step never loses the answer.

## Showing project cards

- **DO** show cards when the visitor asks to see work, asks about a specific project, or asks about a topic/sector/platform/tool/capability that maps to concrete projects; and one FLAGSHIP card on the first overview/greeting.
- **DON'T** show cards for process, methodology, philosophy, background, education, skills-in-the-abstract — answer in prose only.
- Two ways a card renders: the model names the project in prose and the server detects it (`detectMentionedSlugs`, which matches brand-name aliases AND the slug form like `hello-dojo`), OR — only when the reply names no project at all (a rare card-only reply) — the raw `showProjects(slugs)` tool call. Never write a project `<a>` link or URL.
- **One card per project the answer discusses.** The prose is the source of truth: the server shows exactly the projects named in it, never padded by extra tool-call slugs the model over-requested. One project discussed → one card; two compared (e.g. "which project is best?" contrasting helloDojo and UMA) → two cards. **Why:** the model sometimes tool-calls 5 slugs while its prose only contrasts 2; unioning tool-call + mention slugs surfaced all 5. Driving cards off the prose (`mentionedSlugs.length > 0 ? mentionedSlugs : requestedSlugs` in `route.ts`) makes the card count match what the answer actually talks about. Covered by route tests ("shows only the projects the prose discusses", "falls back to tool-call slugs when the prose names no project").
- Slugs/types resolve dynamically from the content layer — any new published MDX is automatically routable. Drafts and unknown slugs never render.
- **No duplicate cards:** a project already shown earlier in the conversation is never shown again (client sends `shownSlugs`; server filters). New projects still show. For "more/other", surface ones not yet shown.
- **Global "best project" questions:** "best project", "mejor proyecto", "strongest project", "flagship", or "most representative" without a sector qualifier means Ary's best project overall, not "best within the previous topic". After a Web3 turn, "cuál es el mejor proyecto de Ary?" should say the strongest overall project is **not Web3** and guide toward **helloDojo** as Ary's most complete/ambitious work. Only answer within Web3 if the current message explicitly says "best Web3 project" / "mejor proyecto Web3".
- **Scoped follow-ups stay scoped:** "otro proyecto de Web3?" should show another Web3 project only. Do not add helloDojo as a flagship aside, and never render a non-Web3 card for a Web3-scoped turn.
- **Comparisons over the prior set stay scoped:** after "qué trabajos ha hecho en Web3?", a follow-up like "cuál destaca más por product thinking entre ellos?" means "among those Web3 projects", not "among all projects". Answer within Web3 only and do not introduce helloDojo or UMA unless the user explicitly broadens the scope.

## Discovery → recommend

- Vague "which project fits my problem?" → **ONE** short question about what they're building / their challenge (no Ary recap, no cards).
- As soon as they name a domain/type/challenge → **stop asking** and recommend with a real answer + card. Never loop with a second question.
- Match by **sector OR complexity**: if no project in their exact sector, pick the closest by complexity/platform/problem-type and name the parallel.

## Topic scoping

- Answer the **current** question. If it's a new, unrelated topic (e.g. switching from a project to "who is Ary?"), drop the previous project's context — never open with a recap of the last project. Keep context only for genuine follow-ups about the same project.
- Keep session context only where it helps avoid repetition or understand the visitor's path. Do not let the previous sector silently constrain a new global comparative: "best project" is global unless the current message explicitly scopes it.
- The server sends only the current user message to the model, plus a compact `CONVERSATION MEMORY` system note derived from prior safe user turns and `shownSlugs`. Prior questions are memory, not fresh turns to answer again; this prevents responses to "Web3?" from recapping a previous "design process" answer.

## Contact / hiring (buttons, not links)

- Contact intent (rates, pricing, budget, availability, hiring, collaboration, "work with", **and wanting to reach Ary directly** — "talk to / speak with / message Ary", "hablar con Ary", typo-tolerant "hblar con Ary", "quiero hablar", "contactar", "ponerme en contacto", "escribirle") is detected **deterministically from the current message** (`isContactIntent`) and short-circuits: the server returns no model prose and the client renders the curated, argumentative intro + the two CTA buttons (**Schedule a call** / **Send email**) — same actions as the "Let's talk" sheet.
- **Why "talk to Ary" must short-circuit:** phrasings like "quiero hablar con Ary" originally missed the `CONTACT_INTENT` regex, so the model answered with a long monologue (projects, rates, recap) instead of the CTA. Reaching/talking to Ary **is** contact intent — keep these phrases in the regex so they always return the buttons, never model prose. Covered by the contact-intent cases in `route.test.ts`.
- **Keep the buttons.** **Never** render contact as a text link or print the email/Calendly URL (`stripContactLinks` removes any that slip through). The intro explains the minimum (rate/availability depend on scope/stage, scoped directly) and is rendered at 14px like normal replies.

## Security (validated 14/14 — keep passing)

- **Input guard** (`isPromptExfiltrationAttempt`) refuses, before any model call: instruction overrides, system-prompt exfiltration, jailbreak/DAN, delimiter injection (`</system>`, `[INST]`), **persona hijack** ("stop being Vivi", "you are Ary", "answer as Ary"), and **PII fishing** (home/personal address).
- **History sanitization:** prior attack messages are stripped from the history sent to the model, so a hostile earlier turn can't contaminate a later benign answer (e.g. "who is Ary?" after an attack must still give a clean bio).
- **Output guard** (`leaksInternalInstructions`) replaces any model output that leaks internal text with the safe refusal.
- `sanitizeMessage` strips delimiters; `showProjects` slugs are validated against real content (no arbitrary routes); client sanitizes HTML with DOMPurify (allowed tags only).

## Regression checks

```bash
npm run test -- src/app/api/chat/route.test.ts
npm run typecheck && npm run lint
```

Manual battery (dev server, `NEXT_PUBLIC_AI_ENABLED=true`):

- "Tell me about helloDojo" → full warm prose **+** its card.
- "What is Ary's design process?" → full prose, **no** card.
- "qué proyectos de web3 tiene?" → prose + multiple cards.
- "qué proyecto es el mejor?" → prose contrasting two projects + exactly **two** cards (one per project discussed); a single-project answer shows exactly one.
- Ask for a project, then "otro proyecto?" → a **different** project (no repeat).
- "which project fits my problem?" → one short question; then "a DeFi analytics tool" → recommendation + card (sector/complexity match).
- "who is Ary?" right after a project → bio, doesn't lead with the old project.
- "what are Ary's rates?" / availability / hiring → contact buttons (no text link).
- "quiero hablar con Ary" / "I want to talk to Ary" → contact buttons (no monologue, no model call).
- Prompt-injection battery (`docs`/session): all refuse or deflect, no system-prompt leak.
