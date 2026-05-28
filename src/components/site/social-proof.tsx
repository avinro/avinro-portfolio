import { useTranslations } from "next-intl";

import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

export function SocialProof() {
  const t = useTranslations("home");
  const { socialProof } = homeContent;

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground w-full text-center font-mono text-xs tracking-[0.15em] uppercase">
            {t("socialProof.sectionTitle")}
          </p>
          <figure className="flex flex-col gap-6">
            <span
              aria-hidden="true"
              className="font-display text-muted-foreground/30 text-6xl leading-none select-none sm:text-7xl"
            >
              &ldquo;
            </span>
            <blockquote>
              <p
                className="font-display text-foreground leading-tight font-semibold tracking-tight text-balance"
                style={{ fontSize: "var(--text-display-sm)" }}
              >
                {socialProof.testimonial.quote}
              </p>
            </blockquote>
            <figcaption className="flex flex-col gap-0.5">
              <span className="text-foreground text-sm font-medium">
                {socialProof.testimonial.author}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {socialProof.testimonial.role}
              </span>
            </figcaption>
          </figure>
          <ul aria-hidden="true" className="flex flex-wrap gap-3">
            {Array.from({ length: socialProof.logoCount }).map((_, i) => (
              <li key={i} className="bg-muted/60 h-6 w-18 rounded-sm opacity-60 sm:h-7 sm:w-22" />
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
