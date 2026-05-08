import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

/*
 * Smoke tests for SiteFooter using react-dom/server (no jsdom needed).
 *
 * PRO-23 focus-ring regressions:
 *   - Footer nav links and email link must carry focus-ring-invert so they
 *     have a visible keyboard indicator on the dark bg-foreground surface.
 *   - The CircularText home link already has bespoke focus-visible classes;
 *     those are not tested here since they use Tailwind ring utilities, not
 *     the focus-ring-invert utility.
 */
describe("SiteFooter", () => {
  it("renders a footer landmark", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("<footer");
  });

  it("renders footer nav with aria-label", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain('aria-label="Footer navigation"');
  });

  it("renders nav links for /work, /about, /contact, /privacy", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain('href="/work"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/contact"');
    expect(html).toContain('href="/privacy"');
  });

  it("renders the email mailto link", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain('href="mailto:hello@avinro.com"');
  });

  // PRO-23 — focus ring regressions
  it("applies focus-ring-invert to footer nav links (keyboard visibility on dark surface)", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    const navIdx = html.indexOf('aria-label="Footer navigation"');
    expect(navIdx).toBeGreaterThan(-1);
    const navSection = html.slice(navIdx, navIdx + 1500);
    // Each of the 4 nav links + the mailto must carry focus-ring-invert.
    // At minimum 4 occurrences (Work, About, Contact, Privacy).
    expect(navSection.match(/focus-ring-invert/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("applies focus-ring-invert to the mailto email link", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    const mailtoIdx = html.indexOf('href="mailto:hello@avinro.com"');
    expect(mailtoIdx).toBeGreaterThan(-1);
    // Isolate a window around the mailto anchor.
    const mailtoSlice = html.slice(Math.max(0, mailtoIdx - 200), mailtoIdx + 100);
    expect(mailtoSlice).toContain("focus-ring-invert");
  });
});
