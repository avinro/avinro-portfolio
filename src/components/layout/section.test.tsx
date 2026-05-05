import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Section } from "./section";

describe("Section", () => {
  it("renders a <section> by default with spacing=section", () => {
    const html = renderToStaticMarkup(<Section>child</Section>);
    expect(html).toMatch(/^<section/);
    expect(html).toContain('data-slot="section"');
    expect(html).toContain('data-spacing="section"');
    expect(html).toContain("py-(--space-section)");
  });

  it("respects the as prop to render a different landmark", () => {
    const html = renderToStaticMarkup(<Section as="header">x</Section>);
    expect(html).toMatch(/^<header/);
  });

  it("applies hero spacing variant", () => {
    const html = renderToStaticMarkup(<Section spacing="hero">x</Section>);
    expect(html).toContain('data-spacing="hero"');
    expect(html).toContain("py-(--space-hero)");
    expect(html).not.toContain("py-(--space-section)");
  });

  it("applies no padding when spacing=none", () => {
    const html = renderToStaticMarkup(<Section spacing="none">x</Section>);
    expect(html).toContain('data-spacing="none"');
    expect(html).not.toMatch(/py-\(--space-/);
  });

  it("merges consumer className over variant classes", () => {
    const html = renderToStaticMarkup(
      <Section spacing="section" className="bg-muted">
        x
      </Section>,
    );
    expect(html).toContain("bg-muted");
    expect(html).toContain("py-(--space-section)");
  });
});
