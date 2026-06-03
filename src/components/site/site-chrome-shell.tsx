"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { CalendlyPrefetch } from "@/components/site/calendly-prefetch";
import { AiChatLoader } from "@/components/site/ai-chat-loader";
import { ChatPanelProvider, useChatPanel } from "@/components/site/chat-panel-context";
import { useLenis } from "@/components/site/lenis-provider";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

export const SiteChromeMinimalSetterContext = createContext<Dispatch<
  SetStateAction<boolean>
> | null>(null);

export function useActivateMinimalSiteChrome() {
  const setMinimal = useContext(SiteChromeMinimalSetterContext);

  useLayoutEffect(() => {
    if (!setMinimal) return;
    setMinimal(true);
    return () => {
      setMinimal(false);
    };
  }, [setMinimal]);
}

/** Toggles the `chat-panel-pushed` class on <html> so the site content shrinks
 * for the desktop chat panel, and refreshes Lenis once the transition settles. */
function ChatPushController() {
  const { pushContent } = useChatPanel();
  const lenis = useLenis();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("chat-panel-pushed", pushContent);
    const id = window.setTimeout(() => {
      if (lenis) scheduleRefreshLenisBounds(lenis);
    }, 450);
    return () => {
      window.clearTimeout(id);
    };
  }, [pushContent, lenis]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("chat-panel-pushed");
    };
  }, []);

  return null;
}

export function SiteChromeShell({
  children,
  initialMinimalChrome,
}: {
  children: ReactNode;
  initialMinimalChrome: boolean;
}) {
  const [minimalChrome, setMinimalChrome] = useState(initialMinimalChrome);

  return (
    <ChatPanelProvider>
      <SiteChromeMinimalSetterContext.Provider value={setMinimalChrome}>
        <ChatPushController />
        {!minimalChrome ? <SiteHeader /> : null}
        <SiteFooter />
        <main
          id="main-content"
          tabIndex={-1}
          className="bg-background relative z-10 flex min-h-dvh flex-1 flex-col focus:outline-none"
        >
          {children}
        </main>
        <div aria-hidden="true" className="h-[calc(100dvh-72px)] shrink-0" />
        {!minimalChrome ? <MobileCtaBar /> : null}
        <CalendlyPrefetch />
        {!minimalChrome ? <AiChatLoader /> : null}
      </SiteChromeMinimalSetterContext.Provider>
    </ChatPanelProvider>
  );
}
