import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

/*
 * Smoke tests for SiteHeader using react-dom/server (no jsdom needed).
 * Verifies:
 *   - Skip link is present and targets #main-content
 *   - Wordmark "Avinro" link is rendered
 *   - Nav links are present (Work, About, Contact)
 *   - Primary CTA ("Book a call") exists and is hidden on <md via md:flex
 */
describe("SiteHeader", () => {
  it("renders a skip link targeting #main-content", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="#main-content"');
    expect(html).toContain("Skip to main content");
  });

  it("renders the wordmark link to /", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="/"');
    expect(html).toContain("Avinro");
  });

  it("renders nav links for /work, /about, /contact", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    expect(html).toContain('href="/work"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/contact"');
  });

  it("renders primary CTA inside a nav element (visible at md+)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // The CTA button wraps a Link to /contact — href should appear
    // Primary CTA href comes from homeContent.primaryCta.href = "/contact"
    expect(html).toContain("Book a call");
    // It is inside the md:flex nav, so md:flex must be present
    expect(html).toContain("md:flex");
  });

  it("does not render a hamburger button", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // No fake hamburger menu element
    expect(html).not.toContain("hamburger");
    expect(html).not.toContain("menu-toggle");
  });
});
