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

/** Minimal shell: hide header, mobile CTA bar, and AI chat (floating trigger). */
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
      {/*
       * SiteFooter is rendered first in DOM order but sits at z-0 fixed bottom.
       * The main wrapper (z-10) slides up over it as the user scrolls through
       * page content, then "lifts" away at the bottom to reveal the footer.
       */}
      <SiteFooter />
      {/*
       * <main> with id="main-content" + tabIndex={-1}:
       *   - Semantic landmark for page content.
       *   - Skip-link target in SiteHeader.
       *   - focus:outline-none because focus is always programmatic.
       */}
      <main
        id="main-content"
        tabIndex={-1}
        className="bg-background relative z-10 flex min-h-dvh flex-1 flex-col focus:outline-none"
      >
        {children}
      </main>
      {/*
       * Runway sentinel — reserves the scroll distance the fixed footer
       * needs to become fully visible. shrink-0 prevents compression on short
       * viewports; transparent background lets the footer show through.
       */}
      <div aria-hidden="true" className="h-[calc(100dvh-72px)] shrink-0" />
      {!minimalChrome ? <MobileCtaBar /> : null}
      <CalendlyPrefetch />
      {!minimalChrome ? <AiChatLoader /> : null}
    </SiteChromeMinimalSetterContext.Provider>
  );
}
