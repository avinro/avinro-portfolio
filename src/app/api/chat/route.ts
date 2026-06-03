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

const MODEL_ID = "gemini-3.1-flash-lite-preview";

// Cards are resolved straight from the content layer, so any published project
// (including new MDX files) is automatically a valid tool target. Unknown slugs
// simply resolve to nothing, so the model can never inject an arbitrary route.
const MAX_CARDS = 6;

// The full frontmatter is returned so the chat can render the exact same cards
// used on the /work and /case-studies listings (WorkGalleryCard / CaseStudyGridCard).
type ProjectCard =
  | { type: "work"; frontmatter: WorkFrontmatter }
  | { type: "case-study"; frontmatter: CaseStudyFrontmatter };

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

// Fallback for when the model names a project in prose (e.g. "BlockBind") but
// forgets to call showProjects — we still surface its card so a referenced
// project never appears without one.
function detectMentionedSlugs(text: string, locale: string): string[] {
  const projects = [...getPublishedCaseStudies(locale), ...getPublishedWorks(locale)];
  return projects
    .filter((p) =>
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

  const safeMessages: ChatMessage[] = rawMessages
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

  if (safeMessages.length === 0) {
    return new Response("Bad request: last message must be from user", {
      status: 400,
    });
  }

  const lastUserMessage = safeMessages[safeMessages.length - 1]?.content ?? "";
  if (isPromptExfiltrationAttempt(lastUserMessage)) {
    return jsonReply(safeRefusalFor(lastUserMessage), []);
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const conversationState =
      shownSlugs.length > 0
        ? `\n\n--- CONVERSATION STATE ---\nProjects already shown to this visitor as cards: ${shownSlugs.join(", ")}. Do NOT show these again. When the visitor asks for "more", "other", "what else", or another angle on Ary's work, introduce a DIFFERENT project they have not seen yet (with a showProjects card) rather than re-describing one already shown. Only re-mention an already-shown project in prose, never with a card. If genuinely none fit, answer in prose without a card.`
        : "";

    const result = await generateText({
      model: google(MODEL_ID),
      system: buildSystemPrompt() + conversationState,
      messages: safeMessages,
      tools: { showProjects: buildShowProjectsTool(locale) },
      toolChoice: "auto",
      // Allow a follow-up step so the model writes prose after seeing the cards
      // it requested via the tool call.
      stopWhen: stepCountIs(2),
    });

    if (leaksInternalInstructions(result.text)) {
      return jsonReply(safeRefusalFor(lastUserMessage), []);
    }

    // Tool calls can occur in any step; collect requested slugs across all steps.
    const requestedSlugs = result.steps.flatMap((step) =>
      step.toolCalls.flatMap((call) =>
        call.toolName === "showProjects" ? (call.input as { slugs: string[] }).slugs : [],
      ),
    );
    // Surface a card for any project the model called via the tool OR named in
    // its prose (fallback), then drop ones already shown earlier in the chat.
    const mentionedSlugs = detectMentionedSlugs(result.text, locale);
    const shownSet = new Set(shownSlugs);
    const cards = resolveProjectCards([...requestedSlugs, ...mentionedSlugs], locale).filter(
      (card) => !shownSet.has(card.frontmatter.slug),
    );

    // The model occasionally returns only a tool call with no prose. A card-only
    // reply is still valid; the client renders the cards without a text bubble.
    return jsonReply(result.text, cards);
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

function jsonReply(html: string, cards: ProjectCard[]): Response {
  return new Response(JSON.stringify({ html, cards }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
