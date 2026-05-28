import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getPublishedCaseStudies } from "@/lib/content/case-studies";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { CaseStudyGrid } from "@/components/case-study/case-study-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudies" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: { canonical: "/case-studies" },
  };
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("caseStudies");
  const cases = getPublishedCaseStudies(locale);

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
          </div>
        </Container>
      </Section>
      <Section>
        <CaseStudyGrid cases={cases} />
      </Section>
    </main>
  );
}
