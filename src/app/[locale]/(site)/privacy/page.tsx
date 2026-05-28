import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: "/privacy",
    },
  };
}

interface PrivacySection {
  heading: string;
  body: string[];
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as PrivacySection[];

  return (
    <main id="main-content">
      <Section spacing="heroInternalCompact">
        <Container>
          <p className="text-muted-foreground mb-4 font-mono text-xs tracking-[0.15em] uppercase">
            {t("hero.kicker")}
          </p>
          <h1 className="font-display mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.heading")}
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            {t("hero.subheading")}
          </p>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  {section.heading}
                </h2>
                <ul className="text-muted-foreground flex flex-col gap-3 text-base leading-relaxed">
                  {section.body.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="text-muted-foreground border-border/40 border-t pt-8 font-mono text-xs">
              {t("lastUpdated")}
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
