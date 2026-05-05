import Link from "next/link";

/*
 * SiteFooter — minimal global footer.
 *
 * pb-[var(--space-cta-bar)] reserves space on mobile so the last content
 * item is not hidden behind the fixed MobileCtaBar.  The md:pb-0 override
 * removes the extra padding on desktop where MobileCtaBar is hidden.
 */

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/40 border-t pb-[var(--space-cta-bar)] md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-muted-foreground text-sm">&copy; {year} Avinro. All rights reserved.</p>

        <nav aria-label="Footer navigation" className="flex gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="mailto:hello@avinro.com"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Email
          </a>
        </nav>
      </div>
    </footer>
  );
}
