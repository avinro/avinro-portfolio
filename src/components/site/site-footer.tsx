"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { homeContent } from "@/lib/content/home";
import { SOCIAL_LINKS } from "@/lib/seo/site";
import { ContactSheet } from "@/components/site/contact-sheet";
import { BehanceIcon } from "@/components/site/icons/behance-icon";
import { GithubIcon } from "@/components/site/icons/github-icon";
import { LinkedinIcon } from "@/components/site/icons/linkedin-icon";
import { siteUnderlineBarClassName } from "@/components/site/site-link-underline";
import { SiteTextLink } from "@/components/site/site-text-link";
import { isNavSectionActive } from "@/lib/navigation/nav-active";

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
] as const;

const socialLinks = [
  { label: "GitHub", href: SOCIAL_LINKS.github, Icon: GithubIcon },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin, Icon: LinkedinIcon },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();
  const { finalCta } = homeContent;

  return (
    <footer
      data-curtain-footer
      className="border-background/10 bg-foreground text-background pointer-events-none fixed inset-x-0 bottom-0 z-0 flex h-[calc(100dvh-72px)] flex-col border-t"
    >
      <div className="pointer-events-auto mx-auto flex h-full w-full max-w-7xl flex-col justify-between gap-12 px-4 py-12 pb-6 sm:px-6 lg:px-8">
        <section
          aria-labelledby="footer-cta-title"
          className="flex flex-1 flex-col justify-center gap-8 py-12"
        >
          <h3
            id="footer-cta-title"
            className="font-display text-3xl font-semibold text-balance sm:text-4xl md:text-[length:var(--text-display-md)]"
            style={{
              letterSpacing: "-0.03em",
              lineHeight: "0.9",
            }}
          >
            {finalCta.heading}
          </h3>

          <ContactSheet ctaPosition="footer_link">
            <button
              type="button"
              data-cta-label={finalCta.linkLabel}
              data-cta-href={finalCta.linkHref}
              data-cta-position="footer_link"
              className="focus-ring-invert group focus-visible:ring-background focus-visible:ring-offset-foreground font-display hover:text-background/90 inline-flex w-fit cursor-pointer text-2xl font-semibold tracking-tight transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none sm:text-3xl"
            >
              <span className="relative inline-flex items-center gap-2 pb-0.5">
                {finalCta.linkLabel}
                <span aria-hidden="true">→</span>
                <span
                  aria-hidden
                  className={siteUnderlineBarClassName({ active: false, mode: "reveal" })}
                />
              </span>
            </button>
          </ContactSheet>
        </section>

        <div className="flex flex-col gap-8">
          <Link
            href="/"
            aria-label="Avinro — home"
            className="focus-ring-invert w-fit rounded-sm transition-opacity hover:opacity-70"
          >
            <Image
              src="/logo.png"
              alt=""
              width={62}
              height={12}
              className="h-3 invert"
              style={{ width: "auto" }}
            />
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Footer navigation" className="flex gap-5">
              {footerLinks.map((link) => {
                const active = isNavSectionActive(pathname, link.href);
                return (
                  <SiteTextLink
                    key={link.href}
                    href={link.href}
                    variant="footerNav"
                    active={active}
                  >
                    {link.label}
                  </SiteTextLink>
                );
              })}
            </nav>
            <div className="flex items-center gap-4" aria-label="Social links">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  data-cta-position="footer_social"
                  className="focus-ring-invert text-background/70 hover:text-background rounded-sm transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href={SOCIAL_LINKS.behance}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Behance"
                data-cta-position="footer_social"
                className="focus-ring-invert text-background/70 hover:text-background rounded-sm transition-colors"
              >
                <BehanceIcon className="h-4 w-4" />
              </a>
            </div>

            <p className="text-background/70 font-mono text-xs">&copy; {year} Avinro</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
