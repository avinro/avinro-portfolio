"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback, memo, forwardRef } from "react";
import DOMPurify from "dompurify";
import { useLocale, useTranslations } from "next-intl";
import { BotMessageSquare, ArrowUp, Square, AlertCircle, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/site/lenis-provider";
import { useChatPanel } from "@/components/site/chat-panel-context";
import { WorkGalleryCard } from "@/components/work/work-gallery-card";
import { CaseStudyGridCard } from "@/components/case-study/case-study-grid-card";
import { ChatContactActions } from "@/components/site/chat-contact-actions";
import { localizeWorkCategory } from "@/lib/content/work-category";
import type { WorkFrontmatter } from "@/lib/content/works";
import type { CaseStudyFrontmatter } from "@/lib/content/case-studies";
import { track } from "@/lib/analytics/events";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";
import { ViviThinkingIndicator } from "@/components/site/vivi-thinking-indicator";
import { useStickToBottom } from "@/hooks/use-stick-to-bottom";
import { useVisualViewportInset } from "@/hooks/use-visual-viewport-inset";

const ALLOWED_TAGS = ["p", "ul", "li", "strong", "a"];
const ALLOWED_ATTRS = ["href", "target", "rel"];

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
  });
}

type ChatCard =
  | { type: "work"; frontmatter: WorkFrontmatter }
  | { type: "case-study"; frontmatter: CaseStudyFrontmatter };

interface ChatApiResponse {
  html: string;
  cards: ChatCard[];
  contact?: boolean;
  contactKind?: "pricing" | "reach" | "generic";
}

// The listing cards (WorkGalleryCard / CaseStudyGridCard) only read `.frontmatter`,
// so a placeholder reading time keeps the Work / CaseStudy prop shape satisfied.
const EMPTY_READING_TIME = { text: "", minutes: 0, words: 0 };

type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      content: string;
      assistantHtml: string;
      cards: ChatCard[];
      contact: boolean;
      contactKind: "pricing" | "reach" | "generic";
    };

const UserBubble = memo(function UserBubble({
  message,
}: {
  message: Extract<ChatMessage, { role: "user" }>;
}) {
  return (
    <div className="ml-auto flex max-w-[85%] gap-2">
      <div className="bg-primary text-primary-foreground flex-1 rounded-2xl rounded-br-none px-4 py-2.5">
        <p className="font-sans text-sm">{message.content}</p>
      </div>
    </div>
  );
});

const ProjectCardList = memo(function ProjectCardList({
  cards,
  onNavigate,
}: {
  cards: ChatCard[];
  onNavigate?: () => void;
}) {
  const tWork = useTranslations("work");
  if (cards.length === 0) return null;
  return (
    // onNavigate (mobile only) closes the full-screen sheet once a card is tapped.
    <div
      className="mt-3 grid gap-3"
      onClick={onNavigate}
      role={onNavigate ? "presentation" : undefined}
    >
      {cards.map((card) =>
        card.type === "work" ? (
          <WorkGalleryCard
            key={`work-${card.frontmatter.slug}`}
            work={{ frontmatter: card.frontmatter, content: "", readingTime: EMPTY_READING_TIME }}
            categoryLabel={localizeWorkCategory(card.frontmatter.category, tWork)}
            eager
          />
        ) : (
          <CaseStudyGridCard
            key={`cs-${card.frontmatter.slug}`}
            cs={{ frontmatter: card.frontmatter, content: "", readingTime: EMPTY_READING_TIME }}
            eager
          />
        ),
      )}
    </div>
  );
});

const AssistantBubble = memo(function AssistantBubble({
  message,
  onCardNavigate,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
  onCardNavigate?: () => void;
}) {
  return (
    <div className="mr-auto max-w-[95%]">
      {!message.contact && message.assistantHtml.trim() && (
        <div className="prose-chat" dangerouslySetInnerHTML={{ __html: message.assistantHtml }} />
      )}
      <ProjectCardList cards={message.cards} onNavigate={onCardNavigate} />
      {/* Contact replies always use the curated, argumentative intro for consistent
          quality, regardless of whatever prose the model produced. */}
      {message.contact && (
        <ChatContactActions onAct={onCardNavigate} showIntro kind={message.contactKind} />
      )}
    </div>
  );
});

const MessageList = memo(function MessageList({
  messages,
  onCardNavigate,
}: {
  messages: ChatMessage[];
  onCardNavigate?: () => void;
}) {
  return (
    <>
      {messages.map((message) =>
        message.role === "user" ? (
          <UserBubble key={message.id} message={message} />
        ) : (
          <AssistantBubble key={message.id} message={message} onCardNavigate={onCardNavigate} />
        ),
      )}
    </>
  );
});

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("aiChat");
  return (
    <div className="border-destructive/50 bg-destructive/10 mr-auto flex max-w-[95%] items-start gap-2 rounded-lg border p-3">
      <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-foreground/80 text-sm">{t("errorMessage")}</p>
        <button
          onClick={onRetry}
          className="text-accent mt-2 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-2 hover:opacity-80"
          type="button"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onSelect }: { onSelect: (text: string) => void }) {
  const t = useTranslations("aiChat");
  const chips = t.raw("suggestions") as string[];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <div className="text-center">
        <BotMessageSquare className="text-muted-foreground mx-auto mb-3 size-8" aria-hidden />
        <h3 className="font-display mb-2 text-xl font-semibold tracking-tight">
          {t("greetingTitle")}
        </h3>
        <p className="text-muted-foreground text-sm">{t("greetingSubtitle")}</p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              onSelect(chip);
            }}
            type="button"
            className={cn(
              "border-border bg-background/50 hover:bg-muted block w-full touch-manipulation rounded-lg border",
              "min-h-11 px-3 py-2 text-left text-sm transition-colors",
            )}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  disabled: boolean;
  isLoading: boolean;
  onStop: () => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
  { value, onChange, onSubmit, disabled, isLoading, onStop },
  ref,
) {
  const t = useTranslations("aiChat");
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  useEffect(() => {
    const textarea = innerRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${String(Math.min(textarea.scrollHeight, 120))}px`;
  }, [value]);

  return (
    <form onSubmit={onSubmit} className="flex touch-manipulation items-end gap-2">
      <textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const syntheticEvent = {
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              preventDefault: () => {},
            } as React.SyntheticEvent;
            onSubmit(syntheticEvent);
          }
        }}
        placeholder={t("inputPlaceholder")}
        rows={1}
        className={cn(
          "border-border bg-muted min-h-11 flex-1 resize-none rounded-xl border",
          // text-base (16px) on mobile prevents iOS auto-zoom on focus; 14px on desktop.
          "px-3.5 py-2.5 font-sans text-base md:text-sm",
          "placeholder:text-muted-foreground",
          "focus:ring-ring focus:ring-2 focus:outline-none",
          "max-h-[120px] overflow-y-auto",
        )}
        disabled={disabled}
        aria-label={t("inputAria")}
      />
      {isLoading ? (
        <button
          type="button"
          onClick={() => {
            onStop();
          }}
          className={cn(
            "bg-destructive/20 text-destructive flex size-11 shrink-0 items-center justify-center rounded-full",
            "transition-opacity duration-150 hover:opacity-80",
          )}
          aria-label={t("stopAria")}
        >
          <Square className="size-3.5" aria-hidden />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className={cn(
            "bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-full",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "transition-opacity duration-150",
          )}
          aria-label={t("sendAria")}
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
});

const MOBILE_MAX_BREAKPOINT = 767.5;

interface ChatBodyProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingActive: boolean;
  error: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onStop: () => void;
  onRetry: () => void;
  onSelectSuggestion: (text: string) => void;
  onCardNavigate?: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  footerPaddingBottom: string;
}

/** Shared conversation log + input. Each shell (sheet / panel) supplies its own header. */
function ChatBody({
  messages,
  isLoading,
  streamingActive,
  error,
  input,
  onInputChange,
  onSubmit,
  onStop,
  onRetry,
  onSelectSuggestion,
  onCardNavigate,
  scrollRef,
  onScroll,
  textareaRef,
  footerPaddingBottom,
}: ChatBodyProps) {
  const t = useTranslations("aiChat");

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label={t("conversationAria")}
        aria-busy={isLoading}
        // Lenis hijacks wheel/touch globally on desktop; this opts the chat scroll
        // region out so it scrolls natively instead of moving the page behind it.
        data-lenis-prevent
        className="bg-muted/70 min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 py-4 dark:bg-black/40"
      >
        {messages.length === 0 && !streamingActive && !isLoading && (
          <EmptyState onSelect={onSelectSuggestion} />
        )}

        <MessageList messages={messages} onCardNavigate={onCardNavigate} />

        {isLoading && <ViviThinkingIndicator />}

        {error && <ErrorState onRetry={onRetry} />}
      </div>

      <div
        className="bg-muted/70 shrink-0 px-4 pt-4 dark:bg-black/40"
        style={{ paddingBottom: footerPaddingBottom }}
      >
        <ChatInput
          ref={textareaRef}
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          disabled={isLoading}
          isLoading={isLoading}
          onStop={onStop}
        />
      </div>
    </>
  );
}

export function AiChat() {
  const t = useTranslations("aiChat");
  const locale = useLocale();
  const { open, setOpen, toggle } = useChatPanel();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingActive, setStreamingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastFailedMessagesRef = useRef<ChatMessage[] | null>(null);
  // Project slugs already shown as cards this conversation — sent to the API so
  // the model favors new projects, and never re-rendered as a duplicate card.
  const shownCardSlugsRef = useRef<Set<string>>(new Set());
  const lenis = useLenis();
  const { scrollRef, onScroll, markForceStick, scrollToBottomIfNeeded } = useStickToBottom();
  const { viewportHeight, offsetTop } = useVisualViewportInset(open && isMobileViewport);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${String(MOBILE_MAX_BREAKPOINT)}px)`);
    const update = () => {
      setIsMobileViewport(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, []);

  const sendWithMessages = useCallback(
    async (nextMessages: ChatMessage[]): Promise<void> => {
      if (nextMessages.length === 0) return;
      if (nextMessages[nextMessages.length - 1]?.role !== "user") return;

      setStreamingActive(true);
      setError(null);
      setIsLoading(true);
      lastFailedMessagesRef.current = null;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            locale,
            shownSlugs: Array.from(shownCardSlugsRef.current),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "AI is disabled"
              : response.status === 500
                ? "Server error"
                : "Failed to get response",
          );
        }

        const data = (await response.json()) as ChatApiResponse;
        const html = typeof data.html === "string" ? data.html : "";
        const cards = Array.isArray(data.cards) ? data.cards : [];
        const contact = data.contact === true;
        const contactKind =
          data.contactKind === "pricing" || data.contactKind === "reach"
            ? data.contactKind
            : "generic";

        // A reply with no prose is still valid if it carries cards or contact CTAs.
        if (!html.trim() && cards.length === 0 && !contact) {
          throw new Error(
            "Received an empty reply. If this persists, verify Gemini API credentials for production deployments.",
          );
        }

        const assistant: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: html,
          assistantHtml: sanitizeHtml(html),
          cards,
          contact,
          contactKind,
        };
        cards.forEach((card) => shownCardSlugsRef.current.add(card.frontmatter.slug));
        setMessages([...nextMessages, assistant]);
        track({ name: "ai_chat_message_sent", props: { messageCount: nextMessages.length + 1 } });
      } catch (err) {
        const e = err as Error;
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to get response");
          lastFailedMessagesRef.current = nextMessages;
        }
      } finally {
        setStreamingActive(false);
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [locale],
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      markForceStick();
      void sendWithMessages(nextMessages);
    },
    [isLoading, messages, markForceStick, sendWithMessages],
  );

  const handleStop = (): void => {
    abortRef.current?.abort();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const instant = isLoading;
    scrollToBottomIfNeeded({ instant });
  }, [open, messages, isLoading, scrollToBottomIfNeeded]);

  // On mobile the sheet locks the page; on the desktop push-panel the shrunk
  // site content stays scrollable, so Lenis must keep running.
  useEffect(() => {
    if (!open || !lenis || !isMobileViewport) return;
    lenis.stop();
    return () => {
      lenis.start();
      scheduleRefreshLenisBounds(lenis);
    };
  }, [open, lenis, isMobileViewport]);

  // Escape closes the desktop panel (the mobile sheet handles Escape itself).
  useEffect(() => {
    if (!open || isMobileViewport) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isMobileViewport, setOpen]);

  // Focus the input when the desktop panel opens; restore focus to the FAB on close.
  const prevOpenRef = useRef(open);
  useEffect(() => {
    if (isMobileViewport) return;
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (open && !wasOpen) {
      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
    } else if (!open && wasOpen) {
      fabRef.current?.focus();
    }
  }, [open, isMobileViewport]);

  const handleSheetOpenChange = (newOpen: boolean): void => {
    if (!newOpen) {
      document.body.style.removeProperty("pointer-events");
    } else {
      markForceStick();
      track({ name: "ai_chat_open", props: {} });
    }
    setOpen(newOpen);
  };

  const handleToggle = (): void => {
    const next = !open;
    if (next) {
      markForceStick();
      track({ name: "ai_chat_open", props: {} });
    } else {
      document.body.style.removeProperty("pointer-events");
    }
    toggle();
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetry = (): void => {
    const failed = lastFailedMessagesRef.current;
    setError(null);
    if (failed) {
      markForceStick();
      void sendWithMessages(failed);
    }
  };

  // Pin the sheet to the visual viewport: size it to the visible height and
  // push its top down by `offsetTop`. Without the offset, iOS keeps the fixed
  // sheet glued to the layout-viewport top while the keyboard scrolls the page,
  // detaching the sheet and exposing the blurred page behind it. `top` is used
  // (not `transform`) so it never clobbers the slide-in entrance animation.
  const sheetMobileStyle =
    isMobileViewport && open
      ? {
          height: `${String(viewportHeight)}px`,
          maxHeight: `${String(viewportHeight)}px`,
          top: `${String(offsetTop)}px`,
        }
      : undefined;

  // The sheet bottom already lands just above the keyboard (height tracks the
  // visual viewport), so the footer only needs the home-indicator safe area.
  const footerPaddingBottom = "max(env(safe-area-inset-bottom), 1rem)";
  const desktopFooterPaddingBottom = "max(env(safe-area-inset-bottom), 1.5rem)";

  const closeCard = isMobileViewport
    ? () => {
        setOpen(false);
      }
    : undefined;

  const chatBody = (paddingBottom: string) => (
    <ChatBody
      messages={messages}
      isLoading={isLoading}
      streamingActive={streamingActive}
      error={error}
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      onStop={handleStop}
      onRetry={handleRetry}
      onSelectSuggestion={sendMessage}
      onCardNavigate={closeCard}
      scrollRef={scrollRef}
      onScroll={onScroll}
      textareaRef={textareaRef}
      footerPaddingBottom={paddingBottom}
    />
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={fabRef}
            onClick={handleToggle}
            className={cn(
              // Below the mobile sheet (z-50) so it hides behind it; above the
              // desktop push-panel (z-50) so the close affordance stays clickable.
              "fixed z-40 md:z-[60]",
              "right-4 bottom-8",
              "md:right-6",
              open && "md:right-[calc(var(--chat-panel-w)+1.5rem)]",
              "bg-primary text-primary-foreground",
              "flex size-14 items-center justify-center rounded-full",
              "transition-all duration-300",
              "hover:scale-110 hover:shadow-lg motion-reduce:hover:scale-100 motion-reduce:hover:shadow-md",
              "active:scale-95 motion-reduce:active:scale-100",
              "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "touch-manipulation select-none",
            )}
            aria-haspopup={isMobileViewport ? "dialog" : undefined}
            aria-expanded={open}
            aria-label={open ? t("closeAria") : t("triggerAria")}
            type="button"
          >
            {!open && (
              <span
                className="bg-primary/40 pulse-short absolute inset-0 rounded-full motion-reduce:hidden"
                aria-hidden
              />
            )}
            {open ? (
              <X className="relative size-6" aria-hidden />
            ) : (
              <BotMessageSquare className="relative size-6" aria-hidden />
            )}
          </button>
        </TooltipTrigger>
        {!open && (
          <TooltipContent side="top" sideOffset={4} align="end" className="max-w-xs">
            {t("tooltip")}
          </TooltipContent>
        )}
      </Tooltip>

      {isMobileViewport ? (
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
          <SheetContent
            variant="chat"
            className="flex flex-col"
            style={sheetMobileStyle}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              window.setTimeout(() => {
                textareaRef.current?.focus();
              }, 300);
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              fabRef.current?.focus();
            }}
          >
            {/* On mobile the visible "Chat with Vivi" header is dropped to reclaim
                vertical space. Radix still requires an accessible title +
                description, so they stay as sr-only; the floating close button
                (rendered by SheetContent) becomes the only visible chrome. */}
            <SheetHeader className="sr-only">
              <SheetTitle>{t("sheetTitle")}</SheetTitle>
              <SheetDescription>{t("sheetDescription")}</SheetDescription>
            </SheetHeader>

            {/* Safe-area spacer: clears the notch and reserves room for the
                floating close button so the conversation never sits under it. */}
            <div
              aria-hidden
              className="shrink-0"
              style={{ height: "calc(max(env(safe-area-inset-top), 1rem) + 3rem)" }}
            />

            {chatBody(footerPaddingBottom)}
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          aria-label={t("panelAria")}
          inert={!open}
          className={cn(
            "bg-background fixed top-0 right-0 z-50 flex h-dvh w-[var(--chat-panel-width)] flex-col",
            "border-border border-l",
            "transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            open ? "translate-x-0" : "pointer-events-none translate-x-full",
          )}
        >
          {chatBody(desktopFooterPaddingBottom)}
        </aside>
      )}
    </>
  );
}
