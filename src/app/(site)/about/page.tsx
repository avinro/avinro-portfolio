import type { Metadata } from "next";

import { aboutContent } from "@/lib/content/about";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";
import { PersonJsonLd } from "@/lib/seo/json-ld";
import type { ExperienceEntry, EducationEntry, ToolGroup } from "@/lib/content/about";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProcessStack } from "@/components/site/process-stack";
import { AboutPortraitCardLoader } from "@/components/site/about-portrait-card-loader";

export const metadata: Metadata = {
  title: "About",
  description:
    "Product Design Engineer working at the intersection of strategy, design, and front-end implementation. Background, experience, tools, and design philosophy.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Avinro — Product Design Engineer",
    description:
      "Product Design Engineer working at the intersection of strategy, design, and front-end implementation.",
    url: "/about",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: SITE_TWITTER_CARD,
    title: "Avinro — Product Design Engineer",
    description:
      "Product Design Engineer working at the intersection of strategy, design, and front-end implementation.",
    images: [SITE_OG_IMAGE.url],
  },
};

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

export default function AboutPage() {
  const { hero, experience, education, tools, process } = aboutContent;

  return (
    <main id="main-content">
      <PersonJsonLd />
      <Section spacing="heroInternalCompact">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
            <div className="flex flex-col gap-6 md:flex-1">
              <SectionKicker>About</SectionKicker>

              <h1
                className="font-display font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)", lineHeight: 1.1 }}
              >
                Product Design Engineer.
              </h1>

              <div className="flex flex-col gap-4">
                {hero.bio.map((paragraph, i) => (
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
            <SectionKicker>{experience.sectionTitle}</SectionKicker>
            <h2 className="sr-only">{experience.sectionTitle}</h2>
            <div>
              {experience.entries.map((entry) => (
                <ExperienceRow key={`${entry.year}-${entry.role}-${entry.company}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{education.sectionTitle}</SectionKicker>
            <h2 className="sr-only">{education.sectionTitle}</h2>
            <div>
              {education.entries.map((entry) => (
                <EducationRow key={`${entry.years}-${entry.degree}`} entry={entry} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-col gap-8">
            <SectionKicker>{tools.sectionTitle}</SectionKicker>
            <h2 className="sr-only">{tools.sectionTitle}</h2>
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
            sectionTitle={process.sectionTitle}
            intro={process.intro}
            stages={process.stages}
          />
        </Container>
      </Section>
    </main>
  );
}
