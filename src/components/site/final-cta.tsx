import Link from "next/link";

import { homeContent } from "@/lib/content/home";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

/*
 * FinalCta — closing section with a secondary link.
 *
 * No primary Button variant is used here.  The sticky SiteHeader CTA (md+)
 * and MobileCtaBar (<md) are the sole primary CTAs on the page, so adding
 * another would violate the "one and only one primary CTA" AC (PRO-13) and
 * the ui-ux-pro-max §4 primary-action rule.
 *
 * The outline button acts as a supporting anchor for users who reach the
 * bottom of the page without clicking the persistent CTA.
 */
export function FinalCta() {
  const { finalCta } = homeContent;

  return (
    <Section spacing="hero">
      <Container>
        <div className="flex flex-col items-start gap-6 sm:items-center sm:text-center">
          <h2 className="font-display max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
            {finalCta.heading}
          </h2>

          {/* Secondary supporting CTA — outline to stay visually subordinate */}
          <Button asChild variant="outline" size="lg">
            <Link href={finalCta.linkHref}>{finalCta.linkLabel}</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
