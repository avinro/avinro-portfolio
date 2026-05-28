"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { ContactSheet } from "@/components/site/contact-sheet";
import { cn } from "@/lib/utils";

export function MobileCtaBar() {
  const { primaryCta } = homeContent;
  const t = useTranslations("home");
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-curtain-footer]");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(entry.intersectionRatio >= 0.5);
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-label={t("primaryCta.barAria")}
      className={cn(
        "border-border/40 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 pb-[env(safe-area-inset-bottom)] backdrop-blur transition-transform duration-300 md:hidden",
        footerVisible && "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <ContactSheet ctaPosition="mobile_bar">
        <Button
          className="min-h-[44px] w-full"
          data-cta-label={t("primaryCta.label")}
          data-cta-href={primaryCta.href}
          data-cta-position="mobile_bar"
        >
          {t("primaryCta.label")}
        </Button>
      </ContactSheet>
      <div className="h-3" aria-hidden="true" />
    </div>
  );
}
