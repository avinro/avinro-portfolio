import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Grid, GridItem } from "./grid";

describe("Grid", () => {
  it("renders a single-column grid by default with gap=default", () => {
    const html = renderToStaticMarkup(<Grid>child</Grid>);
    expect(html).toContain('data-slot="grid"');
    expect(html).toContain('data-gap="default"');
    expect(html).toContain("grid-cols-1");
    expect(html).toContain("lg:grid-cols-12");
    expect(html).toContain("gap-6");
  });

  it("applies tight and loose gap variants", () => {
    const tight = renderToStaticMarkup(<Grid gap="tight">x</Grid>);
    expect(tight).toContain("gap-3");
    const loose = renderToStaticMarkup(<Grid gap="loose">x</Grid>);
    expect(loose).toContain("gap-8");
  });
});

describe("GridItem", () => {
  it("renders without an lg span by default", () => {
    const html = renderToStaticMarkup(<GridItem>x</GridItem>);
    expect(html).toContain('data-slot="grid-item"');
    expect(html).not.toMatch(/lg:col-span-\d+/);
  });

  it("maps lg=8 to lg:col-span-8 (literal class)", () => {
    const html = renderToStaticMarkup(<GridItem lg={8}>x</GridItem>);
    expect(html).toContain("lg:col-span-8");
    expect(html).toContain('data-lg-span="8"');
  });

  it("supports the full 1..12 range as literal classes", () => {
    const spans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
    for (const n of spans) {
      const html = renderToStaticMarkup(<GridItem lg={n}>x</GridItem>);
      // Cast to string explicitly to satisfy @typescript-eslint/restrict-template-expressions
      expect(html).toContain(`lg:col-span-${String(n)}`);
    }
  });

  it("merges consumer className", () => {
    const html = renderToStaticMarkup(
      <GridItem lg={6} className="bg-muted">
        x
      </GridItem>,
    );
    expect(html).toContain("bg-muted");
    expect(html).toContain("lg:col-span-6");
  });
});
