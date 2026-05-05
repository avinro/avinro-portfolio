import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * SocialProof — testimonial + decorative client logo row.
 *
 * Accessibility:
 *   - The logo placeholders are purely decorative (aria-hidden="true").
 *     The accessible social proof is the testimonial quote and attribution.
 *   - The section title "Trusted by" is visible text, not color-only signaling.
 *
 * Content note: all text is placeholder — swap via homeContent in a future
 * content issue.
 */
export function SocialProof() {
  const { socialProof } = homeContent;

  return (
    <Section spacing="card">
      <Container>
        <div className="flex flex-col gap-8">
          <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            {socialProof.sectionTitle}
          </h2>

          {/* Decorative logo row — no accessible meaning, actual proof is the quote */}
          <div aria-hidden="true" className="flex flex-wrap gap-4">
            {Array.from({ length: socialProof.logoCount }).map((_, i) => (
              <div key={i} className="bg-muted h-8 w-24 rounded-md sm:h-9 sm:w-28" />
            ))}
          </div>

          {/* Testimonial — the meaningful social proof element */}
          <figure className="border-border border-l-2 pl-5">
            <blockquote>
              <p className="text-foreground text-base leading-relaxed sm:text-lg">
                &ldquo;{socialProof.testimonial.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-3">
              <p className="text-muted-foreground text-sm font-medium">
                {socialProof.testimonial.author}
              </p>
              <p className="text-muted-foreground text-sm">{socialProof.testimonial.role}</p>
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}
