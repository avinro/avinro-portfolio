"use client";

import {
  createContext,
  useContext,
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

export function SiteChromeShell({
  children,
  initialMinimalChrome,
}: {
  children: ReactNode;
  initialMinimalChrome: boolean;
}) {
  const [minimalChrome, setMinimalChrome] = useState(initialMinimalChrome);

  return (
    <SiteChromeMinimalSetterContext.Provider value={setMinimalChrome}>
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
  );
}
