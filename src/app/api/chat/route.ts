import { generateText, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/ai/portfolio-context";
import { getWorkBySlug, getPublishedWorks, type WorkFrontmatter } from "@/lib/content/works";
import {
  getCaseStudyBySlug,
  getPublishedCaseStudies,
  type CaseStudyFrontmatter,
} from "@/lib/content/case-studies";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user";
  content: string;
}

const MODEL_ID = "gemini-3.1-flash-lite";

// Cards are resolved straight from the content layer, so any published project
// (including new MDX files) is automatically a valid tool target. Unknown slugs
// simply resolve to nothing, so the model can never inject an arbitrary route.
const MAX_CARDS = 6;

// The full frontmatter is returned so the chat can render the exact same cards
// used on the /work and /case-studies listings (WorkGalleryCard / CaseStudyGridCard).
type ProjectCard =
  | { type: "work"; frontmatter: WorkFrontmatter }
  | { type: "case-study"; frontmatter: CaseStudyFrontmatter };

type ContactKind = "pricing" | "reach" | "generic";

// Built per-request so `execute` can resolve cards in the visitor's locale and
// feed the resolved data back to the model, which then writes prose around it.
function buildShowProjectsTool(locale: string) {
  return tool({
    description:
      "Display rich, clickable project cards for the given portfolio project slugs instead of inline text links. Call this whenever you reference one or more of Ary's projects so the visitor sees the cards. Valid slugs are listed in the PROJECTS section. After calling it, write 1-2 sentences of prose introducing the work, wrapped in a <p> tag (follow the OUTPUT FORMAT — HTML only, no project links).",
    inputSchema: z.object({
      slugs: z.array(z.string()).min(1).max(MAX_CARDS),
    }),
    execute: ({ slugs }) => resolveProjectCards(slugs, locale),
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Name aliases the model is likely to write for a project: full title,
// the part before an em dash, and the leading brand word.
function projectNameAliases(title: string): string[] {
  const beforeDash = title.split("—")[0]?.trim() ?? title;
  const firstWord = beforeDash.split(/\s+/)[0] ?? beforeDash;
  return Array.from(new Set([title, beforeDash, firstWord].filter((s) => s.length >= 3)));
}

// Match the slug written directly in prose (e.g. "hello-dojo"), tolerating a
// hyphen OR a space between segments so "hello dojo" is caught too. This makes
// every project the model names in prose render a card — including when it
// writes the slug form instead of the brand name (so two named projects always
// surface two cards, not one).
function slugMatchesText(slug: string, text: string): boolean {
  if (slug.length < 3) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(slug).replace(/-/g, "[-\\s]")}\\b`, "i");
  return pattern.test(text);
}

// Fallback for when the model names a project in prose (e.g. "BlockBind" or the
// "block-bind" slug) but forgets to call showProjects — we still surface its
// card so every project referenced in the answer appears with one.
function detectMentionedSlugs(text: string, locale: string): string[] {
  const projects = [...getPublishedCaseStudies(locale), ...getPublishedWorks(locale)];
  return projects
    .filter(
      (p) =>
        slugMatchesText(p.frontmatter.slug, text) ||
        projectNameAliases(p.frontmatter.title).some((alias) =>
          new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i").test(text),
        ),
    )
    .map((p) => p.frontmatter.slug);
}

function resolveProjectCards(slugs: string[], locale: string): ProjectCard[] {
  const seen = new Set<string>();
  const cards: ProjectCard[] = [];

  for (const slug of slugs) {
    if (cards.length >= MAX_CARDS) break;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const cs = getCaseStudyBySlug(slug, locale);
    if (cs && !cs.frontmatter.draft) {
      cards.push({ type: "case-study", frontmatter: cs.frontmatter });
      continue;
    }

    const work = getWorkBySlug(slug, locale);
    if (work && !work.frontmatter.draft) {
      cards.push({ type: "work", frontmatter: work.frontmatter });
    }
  }

  return cards;
}

// Contact intent is detected deterministically from the visitor's current
// message (no model tool), so a contact question always renders the same
// curated CTA buttons and prior messages can never contaminate the decision.
const CONTACT_INTENT =
  /\b(rates?|pricing|price|quote|budget|cost\s+estimate|hire|hiring|availability|available|collaborat\w*|work\s+(with|together)|get\s+in\s+touch|contact|reach\s+out|book\s+a\s+call|talk\s+(to|with)\s+(ary|him)|speak\s+(to|with)\s+(ary|him)|(message|email)\s+(ary|him)|tarifa|precio|presupuesto|coste|costo|cu[aá]nto\s+(cobra|cuesta|vale)|contratar|disponibilidad|disponible|colaborar|trabajar\s+(con|juntos)|agendar|reservar|hablar\s+con|hblar\s+con|quiero\s+(?:h?a?blar|hblar)|contactar\w*|en\s+contacto|escribirle)\b/i;

const PRICING_CONTACT_INTENT =
  /\b(rates?|pricing|price|quote|budget|cost\s+estimate|hire|hiring|availability|available|tarifa|precio|presupuesto|coste|costo|cu[aá]nto\s+(cobra|cuesta|vale)|rate|contratar|disponibilidad|disponible)\b/i;

const REACH_CONTACT_INTENT =
  /\b(get\s+in\s+touch|contact|reach\s+out|book\s+a\s+call|talk\s+(to|with)\s+(ary|him)|speak\s+(to|with)\s+(ary|him)|(message|email)\s+(ary|him)|agendar|reservar|hablar\s+con|hblar\s+con|quiero\s+(?:h?a?blar|hblar)|contactar\w*|en\s+contacto|escribirle)\b/i;

function isContactIntent(text: string): boolean {
  return CONTACT_INTENT.test(text);
}

function contactKindFor(text: string): ContactKind {
  if (PRICING_CONTACT_INTENT.test(text)) return "pricing";
  if (REACH_CONTACT_INTENT.test(text)) return "reach";
  return "generic";
}

// Remove mailto / Calendly anchors (keeping inner text) so the buttons are the
// only contact affordance and the chat never shows a duplicate text link.
function stripContactLinks(html: string): string {
  return html.replace(
    /<a\b[^>]*href=["'](?:mailto:|https?:\/\/[^"']*calendly[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    "$1",
  );
}

const SAFE_REFUSAL_ES =
  "<p>No puedo compartir instrucciones internas, configuración del sistema ni contexto oculto. Sí puedo ayudarte a entender la experiencia, proyectos y metodología de Ary.</p>";

const SAFE_REFUSAL_EN =
  "<p>I can't share internal instructions, system configuration, or hidden context. I can help you understand Ary's experience, projects, and working method.</p>";

const HIDDEN_TARGET_PATTERNS = [
  /\b(master\s+prompt|system\s+prompt|developer\s+(message|prompt|instructions?)|internal\s+(instructions?|rules?|context|configuration|config|prompt|routing|table)|hidden\s+(instructions?|context|prompt)|base\s+prompt|initial\s+prompt|your\s+prompt)\b/i,
  /\b(prompt\s+(maestro|del\s+sistema|de\s+sistema|interno|oculto|base|inicial)|tu\s+prompt|instrucciones?\s+(internas?|ocultas?|del\s+sistema|de\s+sistema|de\s+desarrollador)|configuraci[oó]n\s+(interna|del\s+sistema|de\s+sistema)|contexto\s+(interno|oculto)|tabla\s+de\s+routing\s+interna|routing\s+intern[oa])\b/i,
  /\b(previous\s+instructions?|above\s+instructions?|rules\s+you\s+follow|how\s+you\s+are\s+configured|your\s+configuration|your\s+rules)\b/i,
  /\b(instrucciones?\s+anteriores?|reglas\s+que\s+sigues|c[oó]mo\s+est[aá]s\s+configurad[oa]|tu\s+configuraci[oó]n|tus\s+reglas)\b/i,
];

const EXFILTRATION_ACTION_PATTERNS = [
  /\b(what\s+is|what's|show|print|repeat|reveal|expose|disclose|share|dump|output|write|display|return|summari[sz]e|translate|encode|decode|list|audit|extract|quote|paraphrase)\b/i,
  /\b(cu[aá]l\s+es|qu[eé]\s+es|dame|muestra|imprime|repite|revela|exp[oó]n|comparte|vuelca|devuelve|escribe|ense[ñn]a|resume|res[uú]meme|traduce|codifica|decodifica|lista|audita|extrae|cita|parafrasea)\b/i,
];

const DIRECT_ATTACK_PATTERNS = [
  /\b(ignore|forget|bypass|override|disregard)\b.{0,80}\b(previous|above|system|developer|instruction|rule|safety)\b/i,
  /\b(ignora|olvida|omite|salt[aá]te|sobrescribe)\b.{0,80}\b(instrucciones?|reglas?|sistema|desarrollador|seguridad|anterior(?:es)?)\b/i,
  /\b(jailbreak|dan mode|developer mode|do anything now|act as system|you are now)\b/i,
  /\b(modo\s+dan|modo\s+desarrollador|haz\s+de\s+sistema|act[uú]a\s+como\s+sistema|ahora\s+eres)\b/i,
  /<\s*\/?\s*system\s*>|\[\/?\s*inst\s*\]|<<\s*sys\s*>>|<\/\s*sys\s*>>/i,
  // Persona hijack: trying to make Vivi become / speak as Ary.
  /\b(stop being|no longer be|forget (that )?you are)\b[^.]{0,20}\bvivi\b/i,
  /\byou\s+are\s+(now\s+)?ary\b(?!['’]s)/i,
  /\b(act|speak|respond|reply|pretend)\s+(as|to\s+be|like)\s+ary\b/i,
  /\banswer\s+(in\s+(the\s+)?first\s+person|as\s+ary)\b/i,
  /\b(deja\s+de\s+ser|ya\s+no\s+eres|finge\s+ser|act[uú]a\s+como|habla\s+como|responde\s+como)\s+(vivi|ary)\b/i,
  /\b(eres|ahora\s+eres|t[uú]\s+eres)\s+ary\b/i,
  // PII fishing for Ary's private details.
  /\b(home|personal|private|residential)\s+address\b/i,
  /\b(d[oó]nde\s+vive|direcci[oó]n\s+(de\s+(su\s+)?(casa|domicilio)|personal|particular))\b/i,
];

const RESPONSE_LEAK_PATTERNS = [
  /\bYou are Vivi\b/i,
  /\bInternal reference only\b/i,
  /\bOUTPUT FORMAT\b.{0,40}\bCRITICAL\b/i,
  /\bSKILLS\s*(?:→|->|-|to)\s*PROJECTS ROUTING\b/i,
  /\bABOUT ARY VINCENCH\b/i,
  /\bCV\s*\/\s*EXPERIENCE\b/i,
  /\bReturn ONLY valid, semantic HTML\b/i,
  /\bAllowed HTML tags ONLY\b/i,
  /\bSystem prompt\b/i,
  /\bDeveloper instructions?\b/i,
  /\binstrucciones?\s+internas?\b/i,
  /\bprompt\s+(maestro|del\s+sistema|de\s+sistema|interno)\b/i,
];

function sanitizeMessage(text: string): string {
  return text
    .replace(/<\/?system>/gi, "")
    .replace(/\[INST\]|\[\/INST\]/gi, "")
    .replace(/<<SYS>>|<\/SYS>>/gi, "");
}

function isSpanish(text: string): boolean {
  return /\b(dame|muestra|imprime|repite|revela|comparte|instrucciones?|reglas?|configuraci[oó]n|sistema|internas?|ocultas?|experiencia|proyectos?)\b/i.test(
    text,
  );
}

function safeRefusalFor(text: string): string {
  return isSpanish(text) ? SAFE_REFUSAL_ES : SAFE_REFUSAL_EN;
}

function isPromptExfiltrationAttempt(text: string): boolean {
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return false;
  if (DIRECT_ATTACK_PATTERNS.some((pattern) => pattern.test(compact))) return true;

  const targetsHiddenInstructions = HIDDEN_TARGET_PATTERNS.some((pattern) => pattern.test(compact));
  const asksToExpose = EXFILTRATION_ACTION_PATTERNS.some((pattern) => pattern.test(compact));

  return targetsHiddenInstructions && asksToExpose;
}

function leaksInternalInstructions(text: string): boolean {
  return RESPONSE_LEAK_PATTERNS.some((pattern) => pattern.test(text));
}

const FOLLOW_UP_INTENT =
  /\b(more|another|other|what else|tell me more|go deeper|among\s+(them|those)|between\s+(them|those)|which\s+(one|of\s+them)|stands?\s+out|product\s+thinking|otro|otra|otros|otras|alg[uú]n\s+otro|qu[eé]\s+m[aá]s|m[aá]s|profundiza|detalle|ampl[ií]a|entre\s+(ellos|ellas|estos|estas|esos|esas)|de\s+(ellos|ellas|estos|estas|esos|esas)|cu[aá]l\s+es\s+el\s+que|cu[aá]l\s+destaca|destaca|product\s+thinking)\b/i;

const UNSCOPED_BEST_PROJECT_INTENT =
  /\b(best|strongest|flagship|most\s+representative|mejor|m[aá]s\s+(representativo|fuerte|completo|ambicioso))\b.{0,80}\b(project|work|case study|proyecto|trabajo|portfolio)\b|\b(project|work|case study|proyecto|trabajo|portfolio)\b.{0,80}\b(best|strongest|flagship|most\s+representative|mejor|m[aá]s\s+(representativo|fuerte|completo|ambicioso))\b/i;

const TOPIC_PATTERNS: [string, RegExp][] = [
  ["Web3", /\b(web3|crypto|wallet|ens|solana|defi|blockchain|cripto|dominios?\.?eth)\b/i],
  ["design process", /\b(design process|proceso de dise[ñn]o|metodolog[ií]a|methodology)\b/i],
  ["projects", /\b(projects?|work|case studies|proyectos?|trabajos?|portfolio)\b/i],
  ["helloDojo", /\b(hellodojo|hello[-\s]?dojo|dojo)\b/i],
  ["UMA", /\buma\b/i],
  ["BlockBind", /\bblockbind|block[-\s]?bind\b/i],
  ["DomainPlug", /\bdomainplug|domain[-\s]?plug\b/i],
  ["Deks", /\bdeks\b/i],
];

function detectTopics(text: string): string[] {
  return TOPIC_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([topic]) => topic);
}

function buildSessionMemory(userMessages: ChatMessage[], shownSlugs: string[]): string {
  const current = userMessages[userMessages.length - 1]?.content ?? "";
  const priorMessages = userMessages.slice(0, -1);
  const priorTopics = Array.from(
    new Set(priorMessages.flatMap((message) => detectTopics(message.content))),
  );
  const latestPriorTopic = [...priorMessages]
    .reverse()
    .flatMap((message) => detectTopics(message.content))[0];
  const currentTopics = detectTopics(current);
  const isFollowUp = FOLLOW_UP_INTENT.test(current);

  const lines: string[] = [];

  if (priorTopics.length > 0) {
    lines.push(
      `Prior user topics in this visit, for memory only (do NOT answer or recap them again unless the current message asks for them): ${priorTopics.join(", ")}.`,
    );
  }

  if (currentTopics.length > 0) {
    lines.push(
      `Current explicit topic: ${currentTopics.join(", ")}. Answer only this current topic; do not blend in prior topics.`,
    );
  } else if (isFollowUp && latestPriorTopic) {
    lines.push(
      `The current message appears to be a follow-up to: ${latestPriorTopic}. Answer within ${latestPriorTopic} only; do not introduce projects or topics outside that scope.`,
    );
  }

  if (
    UNSCOPED_BEST_PROJECT_INTENT.test(current) &&
    !/\b(web3|crypto|wallet|ens|solana|defi|blockchain|cripto)\b/i.test(current)
  ) {
    lines.push(
      `Current question is an unscoped best-project comparative. Treat it as a global portfolio question, not as best within a prior sector or topic.`,
    );
  }

  if (shownSlugs.length > 0) {
    lines.push(
      `Projects already shown or discussed as cards in this visit: ${shownSlugs.join(", ")}. Do NOT show these cards again. When the visitor asks for "more", "other", "what else", or another angle on Ary's work, introduce a DIFFERENT project they have not seen yet rather than re-describing one already shown. Only re-mention an already-shown project in prose, never with a card. If genuinely none fit, answer in prose without a card.`,
    );
  }

  if (lines.length === 0) return "";

  return `\n\n--- CONVERSATION MEMORY ---\n${lines.join("\n")}`;
}

function effectiveTopicsForCurrentTurn(userMessages: ChatMessage[]): string[] {
  const current = userMessages[userMessages.length - 1]?.content ?? "";
  const currentTopics = detectTopics(current);
  if (currentTopics.length > 0) return currentTopics;
  if (!FOLLOW_UP_INTENT.test(current)) return [];

  return [...userMessages]
    .slice(0, -1)
    .reverse()
    .flatMap((message) => detectTopics(message.content))
    .slice(0, 1);
}

function cardMatchesWeb3(card: ProjectCard): boolean {
  const haystack =
    card.type === "work"
      ? [
          card.frontmatter.title,
          card.frontmatter.category,
          card.frontmatter.summary,
          card.frontmatter.meta.industry,
          card.frontmatter.meta.platform,
          ...card.frontmatter.tags,
          ...card.frontmatter.tools,
        ]
      : [
          card.frontmatter.title,
          card.frontmatter.sector,
          card.frontmatter.softwareType,
          card.frontmatter.summary,
          ...card.frontmatter.tags,
        ];

  return haystack.filter(Boolean).join(" ").toLowerCase().includes("web3");
}

function filterCardsForCurrentTopic(cards: ProjectCard[], topics: string[]): ProjectCard[] {
  if (!topics.includes("Web3")) return cards;
  return cards.filter(cardMatchesWeb3);
}

export async function POST(req: Request): Promise<Response> {
  if (process.env.NEXT_PUBLIC_AI_ENABLED !== "true") {
    return new Response("AI is disabled", { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response("Server misconfiguration: missing GEMINI_API_KEY", {
      status: 500,
    });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = (await req.json()) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const locale = body.locale === "es" ? "es" : "en";

  // Slugs already shown as cards earlier in this conversation, so the model can
  // favor different projects when the visitor asks for "more" / a new angle.
  const shownSlugs = Array.isArray(body.shownSlugs)
    ? (body.shownSlugs as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 20)
    : [];

  const rawMessages = Array.isArray(body.messages) ? (body.messages as unknown[]) : [];

  const userMessages: ChatMessage[] = rawMessages
    .slice(-10)
    .filter((m): m is ChatMessage => {
      if (!m || typeof m !== "object") return false;
      const msg = m as Record<string, unknown>;
      if (!("role" in msg) || !("content" in msg)) return false;
      if (typeof msg.role !== "string" || typeof msg.content !== "string") return false;
      return msg.role === "user";
    })
    .map((m) => ({
      role: "user",
      content: sanitizeMessage(m.content.slice(0, 1000)),
    }));

  if (userMessages.length === 0) {
    return new Response("Bad request: last message must be from user", {
      status: 400,
    });
  }

  const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";

  // 1. Refuse if the CURRENT message is an attack/exfiltration attempt.
  if (isPromptExfiltrationAttempt(lastUserMessage)) {
    return jsonReply(safeRefusalFor(lastUserMessage), []);
  }

  // 2. Contact/hiring questions are answered deterministically with the curated
  //    CTA buttons (no model call) — immune to history contamination/flakiness.
  if (isContactIntent(lastUserMessage)) {
    return jsonReply("", [], true, contactKindFor(lastUserMessage));
  }

  // 3. Drop any PRIOR attack messages, then summarize the session separately.
  //    The model receives only the current user turn as a message; earlier user
  //    turns are memory, not fresh questions to answer again.
  const safeMessages = userMessages.filter((m) => !isPromptExfiltrationAttempt(m.content));
  const currentMessage: ChatMessage = { role: "user", content: lastUserMessage };

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const conversationState = buildSessionMemory(safeMessages, shownSlugs);
    const effectiveTopics = effectiveTopicsForCurrentTurn(safeMessages);

    const result = await generateText({
      model: google(MODEL_ID),
      system: buildSystemPrompt() + conversationState,
      messages: [currentMessage],
      tools: { showProjects: buildShowProjectsTool(locale) },
      toolChoice: "auto",
      // Allow a follow-up step so the model writes prose after seeing the cards
      // it requested via the tool call.
      stopWhen: stepCountIs(2),
    });

    // With multi-step, prose can land in the tool-call step OR the follow-up step;
    // aggregate across steps so a complete answer is never lost to `result.text`.
    const replyText =
      result.steps
        .map((step) => step.text)
        .filter((t) => t.trim().length > 0)
        .join("\n\n")
        .trim() || result.text;

    if (leaksInternalInstructions(replyText)) {
      return jsonReply(safeRefusalFor(lastUserMessage), []);
    }

    // Tool calls can occur in any step; collect requested slugs across all steps.
    const requestedSlugs = result.steps.flatMap((step) =>
      step.toolCalls.flatMap((call) =>
        call.toolName === "showProjects" ? (call.input as { slugs: string[] }).slugs : [],
      ),
    );
    // The prose is the source of truth for which projects the answer actually
    // discusses, so we show exactly the projects named in it — one card per
    // project, never padded by extra tool-call slugs the model over-requested.
    // (Two projects discussed → two cards; one → one.) Only when the reply names
    // no project at all — a rare card-only reply — do we fall back to the raw
    // tool-call slugs so a referenced project never appears without a card.
    const mentionedSlugs = detectMentionedSlugs(replyText, locale);
    const sourceSlugs = mentionedSlugs.length > 0 ? mentionedSlugs : requestedSlugs;
    const shownSet = new Set(shownSlugs);
    const cards = filterCardsForCurrentTopic(
      resolveProjectCards(sourceSlugs, locale).filter(
        (card) => !shownSet.has(card.frontmatter.slug),
      ),
      effectiveTopics,
    );

    // Fallback: if a contact link slipped into the prose despite the short-circuit,
    // surface the buttons (and strip the inline link so there's no duplicate).
    const contact = /calendly\.com|avinroart@gmail\.com/i.test(replyText);

    // The model occasionally returns only a tool call with no prose. A card-only
    // reply is still valid; the client renders the cards without a text bubble.
    return jsonReply(stripContactLinks(replyText), cards, contact);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

function jsonReply(
  html: string,
  cards: ProjectCard[],
  contact = false,
  contactKind: ContactKind = "generic",
): Response {
  return new Response(JSON.stringify({ html, cards, contact, contactKind }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
