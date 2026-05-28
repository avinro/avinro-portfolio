"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { ContactSheet } from "@/components/site/contact-sheet";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { useLenis } from "@/components/site/lenis-provider";
import { SiteTextLink } from "@/components/site/site-text-link";
import { isNavSectionActive } from "@/lib/navigation/nav-active";

import { cn } from "@/lib/utils";

const navLinks = [
  { labelKey: "work", href: "/work" },
  { labelKey: "caseStudies", href: "/case-studies" },
  { labelKey: "about", href: "/about" },
] as const;

const SCROLL_THRESHOLD = 40;

export function SiteHeader() {
  const { primaryCta } = homeContent;
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const glassRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const closeMenuInstantly = useCallback(() => {
    const glass = glassRef.current;
    if (glass) {
      glass.style.transition = "none";
    }
    setIsMenuOpen(false);
    requestAnimationFrame(() => {
      if (glass) {
        glass.style.transition = "";
      }
    });
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMenuOpen) setIsMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(0, { programmatic: true });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const scrollY = lenis ? lenis.scroll : window.scrollY;
      const next = scrollY > SCROLL_THRESHOLD;
      if (next === isScrolledRef.current) return;
      isScrolledRef.current = next;
      setIsScrolled(next);
    };
    onScroll();
    if (lenis) {
      lenis.on("scroll", onScroll);
      return () => {
        lenis.off("scroll", onScroll);
      };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [lenis]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onResize);
    return () => {
      mq.removeEventListener("change", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className={cn("fixed inset-x-0 top-0", isMenuOpen ? "z-50" : "z-40")}>
      <a
        href="#main-content"
        className="focus-ring bg-primary text-primary-foreground absolute top-4 left-4 z-50 -translate-y-16 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
      >
        {tNav("skipToContent")}
      </a>
      <div
        aria-hidden="true"
        className={cn(
          "bg-foreground/40 fixed inset-0 backdrop-blur-sm",
          "transition-opacity duration-300 ease-in-out motion-reduce:transition-none md:hidden",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={glassRef}
        data-glass-surface={isScrolled || isMenuOpen ? "" : undefined}
        className={cn(
          "flex min-h-0 flex-col overflow-hidden",
          "border-border/50",
          "transition-[height,width,max-width,margin,border-radius,padding,background-color] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none",
          isMenuOpen
            ? [
                "mx-2 mt-2 h-[calc(100dvh-16px)] rounded-2xl border px-6",
                "bg-background supports-[backdrop-filter]:bg-background/92",
                "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150",
              ]
            : isScrolled
              ? [
                  "mx-auto mt-2 h-14 max-h-14 min-h-0 w-[calc(100%-16px)] max-w-[50rem] rounded-[28px] border px-5 sm:px-6",
                  "bg-background supports-[backdrop-filter]:bg-background/65",
                  "supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:backdrop-saturate-150",
                  "md:supports-[backdrop-filter]:backdrop-blur-xl",
                ]
              : "mx-auto mt-0 h-14 max-h-14 min-h-0 w-full max-w-7xl rounded-none border-transparent bg-transparent px-4 sm:px-6 lg:px-8",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="focus-ring rounded-sm transition-opacity hover:opacity-70"
            aria-label={tNav("home")}
          >
            <Image
              src="/logo.png"
              alt=""
              width={144}
              height={28}
              priority
              className="h-5"
              style={{ width: "auto" }}
            />
          </Link>
          <nav aria-label={tNav("mainNavigation")} className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const active = isNavSectionActive(pathname, link.href);
              return (
                <SiteTextLink key={link.href} href={link.href} variant="navDesktop" active={active}>
                  {tNav(link.labelKey)}
                </SiteTextLink>
              );
            })}
            <LanguageSwitcher variant="desktop" />
            <ContactSheet ctaPosition="header">
              <Button
                size="default"
                className="font-mono text-xs tracking-wider uppercase"
                data-cta-label={tHome("primaryCta.label")}
                data-cta-href={primaryCta.href}
                data-cta-position="header"
              >
                {tHome("primaryCta.label")}
              </Button>
            </ContactSheet>
          </nav>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((v) => !v);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isMenuOpen ? tNav("closeMenu") : tNav("openMenu")}
            className="focus-ring relative flex h-[44px] w-[44px] items-center justify-center rounded-md md:hidden"
          >
            <span className="relative block h-[14px] w-5" aria-hidden="true">
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-full origin-center rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "top-[6px] rotate-45" : "top-0 rotate-0",
                )}
              />
              <span
                className={cn(
                  "absolute top-[6px] left-0 h-0.5 w-full rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-full origin-center rounded-sm bg-current",
                  "transition-all duration-300 ease-in-out motion-reduce:transition-none",
                  isMenuOpen ? "top-[6px] -rotate-45" : "top-[12px] rotate-0",
                )}
              />
            </span>
          </button>
        </div>
        <div
          id="mobile-nav-panel"
          className={cn(
            "flex min-h-0 flex-col md:hidden",
            isMenuOpen ? "flex-1 pb-4" : "pointer-events-none h-0 flex-none overflow-hidden",
          )}
          aria-hidden={!isMenuOpen}
        >
          <nav
            aria-label={tNav("mobileNavigation")}
            className={cn(
              "flex flex-col items-center justify-center gap-8 text-center",
              isMenuOpen ? "flex-1" : "hidden",
            )}
          >
            {navLinks.map((link, i) => {
              const active = isNavSectionActive(pathname, link.href);
              return (
                <SiteTextLink
                  key={link.href}
                  href={link.href}
                  variant="navMobile"
                  active={active}
                  tabIndex={isMenuOpen ? undefined : -1}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    isMenuOpen
                      ? "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
                      : "pointer-events-none [transform:none] [animation:none] opacity-0",
                  )}
                  style={isMenuOpen ? { animationDelay: `${String(280 + i * 60)}ms` } : undefined}
                >
                  {tNav(link.labelKey)}
                </SiteTextLink>
              );
            })}
            <LanguageSwitcher
              variant="mobile"
              className={cn(
                isMenuOpen
                  ? "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
                  : "pointer-events-none [transform:none] [animation:none] opacity-0",
              )}
              style={isMenuOpen ? { animationDelay: "460ms" } : undefined}
            />
          </nav>
          <div
            className={cn(
              "mt-auto shrink-0",
              isMenuOpen
                ? "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300"
                : "pointer-events-none [transform:none] [animation:none] opacity-0",
            )}
            style={isMenuOpen ? { animationDelay: "520ms" } : undefined}
          >
            <ContactSheet ctaPosition="mobile_overlay">
              <Button
                size="lg"
                className="min-h-[44px] w-full"
                tabIndex={isMenuOpen ? undefined : -1}
                onClick={() => {
                  closeMenuInstantly();
                }}
                data-cta-label={tHome("primaryCta.label")}
                data-cta-href={primaryCta.href}
                data-cta-position="mobile_overlay"
              >
                {tHome("primaryCta.label")}
              </Button>
            </ContactSheet>
          </div>
        </div>
      </div>
    </header>
  );
}
