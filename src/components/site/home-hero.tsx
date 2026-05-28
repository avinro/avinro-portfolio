"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowDown, Download } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { homeContent } from "@/lib/content/home";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import VariableProximity from "@/components/motion/variable-proximity";

const CircularText = dynamic(
  () => import("@/components/motion/circular-text").then((m) => m.CircularText),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden="true" className="rounded-full" style={{ width: 220, height: 220 }} />
    ),
  },
);

export function HomeHero() {
  const { hero, aboutTeaser } = homeContent;
  const t = useTranslations("home");
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [isCircleHovered, setIsCircleHovered] = useState(false);

  return (
    <Section
      as="header"
      spacing="hero"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-32"
    >
      <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-[10vh] right-6 z-10 delay-700 duration-1000 md:hidden">
        <Link
          href={aboutTeaser.linkHref}
          aria-label={t("hero.circularAria")}
          className="group cursor-pointer rounded-full"
          data-cta-href={aboutTeaser.linkHref}
          data-cta-label="Hero circular — About"
          data-cta-position="hero_circle_mobile"
          onPointerEnter={() => {
            setIsCircleHovered(true);
          }}
          onPointerLeave={() => {
            setIsCircleHovered(false);
          }}
        >
          <div className="relative" style={{ width: 120, height: 120 }}>
            <CircularText
              text={isCircleHovered ? t("hero.circularTextHover") : t("hero.circularText")}
              textChangeTransition="shuffle"
              spinDuration={20}
              onHover="slowDown"
              size={120}
              fontSize="0.65rem"
              aria-hidden="true"
              className="text-foreground/60"
            />
            <div
              aria-hidden="true"
              className="bg-muted pointer-events-none absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
              style={{ width: "calc(60% + 4px)" }}
            >
              <Image
                src={hero.profileImageSrc}
                alt=""
                fill
                sizes="80px"
                className="object-cover transition-transform duration-[800ms] ease-in-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                priority
              />
            </div>
          </div>
        </Link>
      </div>

      <Container width="wide" className="relative">
        <div className="animate-in fade-in fill-mode-both pointer-events-auto absolute top-0 right-0 z-10 hidden delay-700 duration-1000 md:block">
          <Link
            href={aboutTeaser.linkHref}
            aria-label={t("hero.circularAria")}
            className="group cursor-pointer rounded-full"
            data-cta-href={aboutTeaser.linkHref}
            data-cta-label="Hero circular — About"
            data-cta-position="hero_circle_desktop"
            onPointerEnter={() => {
              setIsCircleHovered(true);
            }}
            onPointerLeave={() => {
              setIsCircleHovered(false);
            }}
          >
            <div className="relative" style={{ width: 180, height: 180 }}>
              <CircularText
                text={isCircleHovered ? t("hero.circularTextHover") : t("hero.circularText")}
                textChangeTransition="shuffle"
                spinDuration={20}
                onHover="slowDown"
                size={180}
                fontSize="1rem"
                aria-hidden="true"
                className="text-foreground/60"
              />
              <div
                aria-hidden="true"
                className="bg-muted pointer-events-none absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                style={{ width: "calc(70%" }}
              >
                <Image
                  src={hero.profileImageSrc}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-[800ms] ease-in-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  priority
                />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <span
                aria-hidden="true"
                className="pulse-ring inline-block h-1.5 w-1.5 rounded-full bg-green-500"
              />
              {t("hero.badgeText")}
            </Badge>
          </div>
          <h1
            ref={headlineRef}
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
            style={{
              fontSize: "clamp(3.25rem, 14vw, 8rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            <VariableProximity
              label={t("hero.headline")}
              containerRef={headlineRef}
              fromFontVariationSettings="'wght' 500, 'opsz' 14"
              toFontVariationSettings="'wght' 900, 'opsz' 40"
              radius={200}
              falloff="gaussian"
              className="font-display font-semibold text-balance"
              style={{
                display: "block",
                fontFamily: "var(--font-google-sans-flex), ui-sans-serif, system-ui, sans-serif",
              }}
            />
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-muted-foreground max-w-xl text-base leading-snug delay-150 duration-700 sm:text-xl md:text-2xl">
            {t("hero.subheadline")}
          </p>
          <div className="animate-in fade-in fill-mode-both flex flex-wrap gap-3 delay-300 duration-700">
            <Button asChild variant="default" size="lg">
              <Link
                href={hero.primaryCtaHref}
                data-cta-label={t("hero.primaryCta")}
                data-cta-href={hero.primaryCtaHref}
                data-cta-position="hero_primary"
              >
                {t("hero.primaryCta")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={hero.downloadCtaHref}
                download
                data-cta-label={t("hero.downloadCta")}
                data-cta-href={hero.downloadCtaHref}
                data-cta-position="hero_download"
              >
                <Download className="h-4 w-4" />
                {t("hero.downloadCta")}
              </a>
            </Button>
          </div>
        </div>
      </Container>
      <div
        aria-hidden="true"
        className="animate-in fade-in fill-mode-both pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 delay-1000 duration-1000"
      >
        <ArrowDown
          strokeWidth={1.5}
          className="text-foreground/40 h-5 w-5 animate-bounce motion-reduce:animate-none"
        />
      </div>
    </Section>
  );
}
