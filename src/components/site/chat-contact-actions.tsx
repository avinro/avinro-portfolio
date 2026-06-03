"use client";

import { useTranslations } from "next-intl";
import { CalendarDays, Mail, ArrowRight, ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/events";

const CALENDLY_URL = "https://calendly.com/avinroart/30min";
const EMAIL = "avinroart@gmail.com";
const MAILTO = `mailto:${EMAIL}?subject=Project%20inquiry`;

/** Contact CTAs rendered inside the chat — same actions as the "Let's talk" sheet. */
export function ChatContactActions({
  onAct,
  showIntro,
  kind = "generic",
}: {
  onAct?: () => void;
  showIntro?: boolean;
  kind?: "pricing" | "reach" | "generic";
}) {
  const t = useTranslations("contactSheet");
  const tChat = useTranslations("aiChat");
  const introKey = kind === "reach" ? "contactReachIntro" : "contactIntro";

  const handleSchedule = () => {
    track({ name: "calendly_modal_open", props: { position: "ai_chat" } });
    onAct?.();
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    track({ name: "contact_email_click", props: { position: "ai_chat" } });
    onAct?.();
    window.location.href = MAILTO;
  };

  return (
    <div className="mt-3 grid gap-2">
      {showIntro && (
        <div className="prose-chat">
          <p>{tChat(introKey)}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleSchedule}
        className={cn(
          "focus-ring flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-colors duration-150 motion-reduce:transition-none",
        )}
      >
        <CalendarDays className="size-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 flex-col text-left">
          <span className="text-sm leading-tight font-semibold">{t("scheduleCta")}</span>
          <span className="text-primary-foreground/70 mt-0.5 text-xs">{t("scheduleSubtext")}</span>
        </div>
        <ArrowRight className="size-4 shrink-0 opacity-70" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={handleEmail}
        className={cn(
          "focus-ring flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3",
          "bg-background hover:bg-muted",
          "transition-colors duration-150 motion-reduce:transition-none",
        )}
      >
        <Mail className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
        <div className="flex flex-1 flex-col text-left">
          <span className="text-sm leading-tight font-semibold">{t("emailCta")}</span>
          <span className="text-muted-foreground mt-0.5 text-xs">{EMAIL}</span>
        </div>
        <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      </button>
    </div>
  );
}
