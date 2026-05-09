import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "./site-footer";

/*
 * Smoke tests for SiteFooter.
 *
 * Updated for the curtain footer redesign:
 *   - CircularText is removed — no assertions for it.
 *   - Footer is now position:fixed (curtain effect) with data-curtain-footer.
 *   - Closing CTA heading is now an <h3> with letter-spacing: 0.8em.
 *   - Plain Avinro wordmark link replaces the circular animated one.
 *
 * PRO-23 focus-ring regressions retained:
 *   - Footer nav links must carry focus-ring-invert on the dark bg-foreground surface.
 */
describe("SiteFooter", () => {
  it("renders a footer landmark", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("<footer");
  });

  it("carries data-curtain-footer attribute for curtain effect and tests", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("data-curtain-footer");
  });

  it("renders closing CTA as h3 (not h2)", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("<h3");
    expect(html).not.toContain('<h2 id="footer-cta-title"');
  });

  it("applies tight letter-spacing and display line-height to the CTA heading", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(html).toContain("letter-spacing:-0.03em");
    expect(html).toContain("line-height:0.9");
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

  it("renders a plain text Avinro home link (no CircularText)", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    // Plain text wordmark link must be present
    expect(html).toContain('aria-label="Avinro — home"');
    // CircularText component markup must not be present
    expect(html).not.toContain("circular-text");
    expect(html).not.toContain("CircularText");
  });

  // PRO-23 — focus ring regressions
  it("applies focus-ring-invert to footer nav links (keyboard visibility on dark surface)", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    const navIdx = html.indexOf('aria-label="Footer navigation"');
    expect(navIdx).toBeGreaterThan(-1);
    const navSection = html.slice(navIdx, navIdx + 1500);
    // Each of the 4 nav links + the mailto must carry focus-ring-invert.
    expect(navSection.match(/focus-ring-invert/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("applies focus-ring-invert to the mailto email link", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    const mailtoIdx = html.indexOf('href="mailto:hello@avinro.com"');
    expect(mailtoIdx).toBeGreaterThan(-1);
    const mailtoSlice = html.slice(Math.max(0, mailtoIdx - 200), mailtoIdx + 100);
    expect(mailtoSlice).toContain("focus-ring-invert");
  });
});
