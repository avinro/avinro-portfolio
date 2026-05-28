import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { aboutContent } from "@/lib/content/about";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import type { ExperienceEntry, EducationEntry, ToolGroup } from "@/lib/content/about";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProcessStack } from "@/components/site/process-stack";
import { AboutPortraitCardLoader } from "@/components/site/about-portrait-card-loader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const bio = t.raw("hero.bio") as string[];
  return {
    title: t("title"),
    description: bio[0],
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title: t("og.title"),
      description: t("og.description"),
      url: "/about",
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: SITE_TWITTER_CARD,
      title: t("og.title"),
      description: t("og.description"),
      images: [SITE_OG_IMAGE.url],
    },
  };
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
      {children}
    </p>
  );
}

function ExperienceRow({ entry }: { entry: ExperienceEntry }) {
  return (
    <div className="border-border/40 flex flex-col gap-1 border-b py-6 first:border-t sm:flex-row sm:items-start sm:gap-12">
      <span className="text-muted-foreground w-36 shrink-0 font-mono text-sm whitespace-nowrap tabular-nums">
        {entry.year}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        <span className="font-display text-lg font-semibold tracking-tight">
          {entry.role}
          <span className="text-muted-foreground font-sans text-base font-normal">
            {" "}
            — {entry.company}
          </span>
        </span>
        <span className="text-muted-foreground text-sm leading-relaxed">{entry.outcome}</span>
      </div>
    </div>
  );
}

function EducationRow({ entry }: { entry: EducationEntry }) {
  return (
    <div className="border-border/40 flex flex-col gap-1 border-b py-6 first:border-t sm:flex-row sm:items-start sm:gap-8">
      <span className="text-muted-foreground w-16 shrink-0 font-mono text-sm tabular-nums">
        {entry.description ? entry.years.slice(-4) : entry.years.slice(0, 4)}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        <span className="font-display text-lg font-semibold tracking-tight">
          {entry.degree}
          <span className="text-muted-foreground font-sans text-base font-normal">
            {" "}
            — {entry.institution}
          </span>
        </span>
        {entry.description ? (
          <span className="text-muted-foreground text-sm leading-relaxed">{entry.description}</span>
        ) : (
          <span className="text-muted-foreground font-mono text-sm">{entry.years}</span>
        )}
      </div>
    </div>
  );
}

function ToolChip({ label }: { label: string }) {
  return (
    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-mono text-xs tracking-wide uppercase">
      {label}
    </span>
  );
}

function ToolGroupBlock({ group }: { group: ToolGroup }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-foreground text-sm font-medium">{group.label}</span>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item) => (
          <ToolChip key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const { hero, experience, education, tools, process } = aboutContent;
  const heroBio = t.raw("hero.bio") as string[];
  const experienceOutcomes = t.raw("experience.entries") as { outcome: string }[];
  const educationEntries = t.raw("education.entries") as { description: string }[];
  const processStages = t.raw("process.stages") as {
    title: string;
    subtitle: string;
    body: string;
  }[];
  const localizedExperience = experience.entries.map((entry, index) => ({
    ...entry,
    outcome: experienceOutcomes[index]?.outcome ?? entry.outcome,
  }));
  const localizedEducation = education.entries.map((entry, index) => ({
    ...entry,
    description: educationEntries[index]?.description ?? entry.description,
  }));
  const localizedStages = process.stages.map((stage, index) => ({
    ...stage,
    ...processStages[index],
  }));

  return (
    <main id="main-content">
      <PersonJsonLd />
      <Section spacing="heroInternalCompact">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
            <div className="flex flex-col gap-6 md:flex-1">
              <SectionKicker>{t("title")}</SectionKicker>

              <h1
                className="font-display font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)", lineHeight: 1.1 }}
              >
                {t("hero.headline")}
              </h1>

              <div className="flex flex-col gap-4">
                {heroBio.map((paragraph, i) => (
                  <p key={i} className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="w-full md:w-72 lg:w-80">
              <AboutPortraitCardLoader imageSrc={hero.portraitSrc} />
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{t("experience.sectionTitle")}</SectionKicker>
            <h2 className="sr-only">{t("experience.sectionTitle")}</h2>
            <div>
              {localizedExperience.map((entry) => (
                <ExperienceRow key={`${entry.year}-${entry.role}-${entry.company}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{t("education.sectionTitle")}</SectionKicker>
            <h2 className="sr-only">{t("education.sectionTitle")}</h2>
            <div>
              {localizedEducation.map((entry) => (
                <EducationRow key={`${entry.years}-${entry.degree}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{t("tools.sectionTitle")}</SectionKicker>
            <h2 className="sr-only">{t("tools.sectionTitle")}</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tools.groups.map((group) => (
                <ToolGroupBlock key={group.label} group={group} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <ProcessStack
            sectionTitle={t("process.sectionTitle")}
            intro={t("process.intro")}
            stages={localizedStages}
          />
        </Container>
      </Section>
    </main>
  );
}
