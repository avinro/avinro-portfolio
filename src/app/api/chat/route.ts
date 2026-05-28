import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/ai/portfolio-context";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user";
  content: string;
}

const MODEL_ID = "gemini-3.1-flash-lite-preview";

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
    return new Response(safeRefusalFor(lastUserMessage), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const result = await generateText({
      model: google(MODEL_ID),
      system: buildSystemPrompt(),
      messages: safeMessages,
    });

    const guardedText = leaksInternalInstructions(result.text)
      ? safeRefusalFor(lastUserMessage)
      : result.text;

    return new Response(guardedText, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
