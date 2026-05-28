import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { SiteTextLink } from "@/components/site/site-text-link";
import { getPublishedWorks } from "@/lib/content/works";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { WorkGalleryGrid } from "@/components/work/work-gallery-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: { canonical: "/work" },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("work");
  const works = getPublishedWorks(locale);

  return (
    <main id="main-content">
      <Section
        as="header"
        spacing="heroInternalCompact"
        className="border-border border-b"
        style={{ paddingBottom: "calc(var(--space-hero) / 2)" }}
      >
        <Container>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t("kicker")}
            </p>
            <h1 className="font-display text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              {t("headline").split("\n")[0]}
              <br className="hidden sm:block" /> {t("headline").split("\n")[1]}
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed sm:text-lg md:max-w-none">
              {t("intro")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("caseStudyPrompt")}{" "}
              <SiteTextLink href="/case-studies" variant="inlineMono" className="text-foreground">
                {t("caseStudyLink")}
              </SiteTextLink>
            </p>
          </div>
        </Container>
      </Section>
      <Section>
        <WorkGalleryGrid works={works} />
      </Section>
    </main>
  );
}
