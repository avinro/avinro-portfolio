"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const DESKTOP_MIN_WIDTH = 768;

interface ChatPanelContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  isDesktop: boolean;
  /** True only when the desktop side panel should push/shrink the site content. */
  pushContent: boolean;
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${String(DESKTOP_MIN_WIDTH)}px)`);
    const update = () => {
      setIsDesktop(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
    };
  }, []);

  const value = useMemo<ChatPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => {
        setOpen((prev) => !prev);
      },
      isDesktop,
      pushContent: open && isDesktop,
    }),
    [open, isDesktop],
  );

  return <ChatPanelContext.Provider value={value}>{children}</ChatPanelContext.Provider>;
}

export function useChatPanel(): ChatPanelContextValue {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) {
    throw new Error("useChatPanel must be used within a ChatPanelProvider");
  }
  return ctx;
}
