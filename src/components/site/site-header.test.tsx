import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

/*
 * Smoke tests for SiteHeader using react-dom/server (no jsdom needed).
 * Verifies:
 *   - Skip link is present and targets #main-content
 *   - Wordmark "Avinro" link is rendered
 *   - Nav links are present (Work, About, Contact)
 *   - Primary CTA ("Let's talk") exists and is hidden on <md via md:flex
 *   - PRO-23: focus-ring class is present on skip link, wordmark, and nav links
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
    // Primary CTA label comes from homeContent.primaryCta.label = "Let's talk"
    expect(html).toContain("Let&#x27;s talk");
    // It is inside the md:flex nav, so md:flex must be present
    expect(html).toContain("md:flex");
  });

  it("does not render a hamburger button", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // No fake hamburger menu element
    expect(html).not.toContain("hamburger");
    expect(html).not.toContain("menu-toggle");
  });

  // PRO-23 — focus ring regressions
  it("applies focus-ring class to the skip link (keyboard visibility)", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // The skip link must carry the focus-ring utility so keyboard users see
    // a visible outline when it receives focus-visible.
    expect(html).toContain('href="#main-content"');
    expect(html).toMatch(/focus-ring[^-]/);
  });

  it("applies focus-ring class to the wordmark link", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // Split the HTML at the wordmark href to isolate its class attribute.
    const wordmarkIdx = html.indexOf('href="/"');
    expect(wordmarkIdx).toBeGreaterThan(-1);
    // The focus-ring class must appear on or near the wordmark element.
    const wordmarkSlice = html.slice(Math.max(0, wordmarkIdx - 300), wordmarkIdx + 200);
    expect(wordmarkSlice).toContain("focus-ring");
  });

  it("applies focus-ring class to each nav link", () => {
    const html = renderToStaticMarkup(<SiteHeader />);
    // Each nav link (Work, About, Contact) must have focus-ring so keyboard
    // navigation shows a visible indicator on all three links.
    const navIdx = html.indexOf('aria-label="Main navigation"');
    expect(navIdx).toBeGreaterThan(-1);
    const navSection = html.slice(navIdx, navIdx + 1000);
    expect(navSection.match(/focus-ring/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
