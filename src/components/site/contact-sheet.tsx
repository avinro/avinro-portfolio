"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Mail, ArrowRight, ExternalLink } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/site/lenis-provider";
import { track } from "@/lib/analytics/events";
import { scheduleRefreshLenisBounds } from "@/lib/scroll/refresh-lenis-bounds";

const CALENDLY_URL = "https://calendly.com/avinroart/30min";
const EMAIL = "avinroart@gmail.com";
const MAILTO = `mailto:${EMAIL}?subject=Project%20inquiry`;

interface ContactSheetProps {
  children: React.ReactNode;
  ctaPosition?: string;
}

export function ContactSheet({ children, ctaPosition = "unknown" }: ContactSheetProps) {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      document.body.style.removeProperty("pointer-events");
    }
    setOpen(next);
  };

  useEffect(() => {
    if (!open || !lenis) return;
    lenis.stop();
    return () => {
      lenis.start();
      scheduleRefreshLenisBounds(lenis);
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    track({ name: "contact_menu_open", props: { position: ctaPosition } });
  }, [open, ctaPosition]);

  const handleSchedule = () => {
    track({ name: "calendly_modal_open", props: { position: ctaPosition } });
    setOpen(false);
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
  };

  const handleEmail = () => {
    track({ name: "contact_email_click", props: { position: ctaPosition } });
    setOpen(false);
    setTimeout(() => {
      window.location.href = MAILTO;
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent>
        <div
          className="flex h-full flex-col"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
        >
          <div className="shrink-0 px-6 pb-8">
            <SheetHeader className="mt-8 gap-1">
              <SheetTitle>Have a project in mind?</SheetTitle>
              <p className="font-display text-muted-foreground/70 text-3xl font-semibold tracking-tight">
                Let&apos;s build it.
              </p>
            </SheetHeader>
            <SheetDescription className="mt-3">
              Choose how you&apos;d like to reach out.
            </SheetDescription>
          </div>
          <div className="flex flex-col gap-3 px-6 pb-6">
            <button
              type="button"
              onClick={handleSchedule}
              className={cn(
                "focus-ring flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-xl px-5 py-4",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-colors duration-150 motion-reduce:transition-none",
              )}
            >
              <CalendarDays className="size-5 shrink-0" aria-hidden="true" />
              <div className="flex flex-1 flex-col text-left">
                <span className="text-sm leading-tight font-semibold">Schedule a 30 min call</span>
                <span className="text-primary-foreground/70 mt-0.5 text-xs">
                  Free · no commitment
                </span>
              </div>
              <ArrowRight className="size-4 shrink-0 opacity-70" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleEmail}
              className={cn(
                "focus-ring flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-xl border px-5 py-4",
                "bg-background hover:bg-muted",
                "transition-colors duration-150 motion-reduce:transition-none",
              )}
            >
              <Mail className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
              <div className="flex flex-1 flex-col text-left">
                <span className="text-sm leading-tight font-semibold">Send me an email</span>
                <span className="text-muted-foreground mt-0.5 text-xs">{EMAIL}</span>
              </div>
              <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
