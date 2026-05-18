import { describe, it, expect } from "vitest";
import { buildWorkHeaderMetadata, buildWorkHeaderTags } from "./work-header-metadata";
import type { WorkFrontmatter } from "./works";

function baseFrontmatter(overrides: Partial<WorkFrontmatter> = {}): WorkFrontmatter {
  return {
    title: "Test",
    slug: "test",
    year: 2024,
    category: "Concept",
    summary: "Summary",
    coverImage: "/cover.jpg",
    coverAspect: "portrait",
    gallery: [],
    tools: [],
    tags: [],
    order: 1,
    featured: false,
    draft: false,
    meta: {},
    ...overrides,
  };
}

describe("buildWorkHeaderMetadata", () => {
  it("returns items in editorial order when all fields are present", () => {
    const items = buildWorkHeaderMetadata(
      baseFrontmatter({
        client: "Baptist Health",
        meta: {
          type: "Agency work",
          industry: "Healthcare",
          platform: "Mobile app",
          status: "Shipped",
          role: "Senior Product Designer",
        },
      }),
    );

    expect(items.map((item) => item.kind)).toEqual([
      "type",
      "client",
      "category",
      "industry",
      "year",
      "platform",
      "status",
      "role",
    ]);
  });

  it("uses yearLabel override when provided", () => {
    const items = buildWorkHeaderMetadata(
      baseFrontmatter({
        year: 2023,
        meta: { yearLabel: "2022–2023" },
      }),
    );

    expect(items.find((item) => item.kind === "year")?.value).toBe("2022–2023");
  });

  it("falls back to numeric year when yearLabel is absent", () => {
    const items = buildWorkHeaderMetadata(baseFrontmatter({ year: 2025 }));
    expect(items.find((item) => item.kind === "year")?.value).toBe("2025");
  });

  it("omits empty optional fields", () => {
    const items = buildWorkHeaderMetadata(
      baseFrontmatter({
        meta: { type: "Personal concept" },
      }),
    );

    expect(items.map((item) => item.kind)).toEqual(["type", "category", "year"]);
  });

  it("includes live link when externalLink is set", () => {
    const items = buildWorkHeaderMetadata(
      baseFrontmatter({
        externalLink: "https://example.com",
      }),
    );

    const live = items.find((item) => item.kind === "live");
    expect(live?.href).toBe("https://example.com");
    expect(live?.value).toBe("View live");
  });

  it("handles projects with minimal metadata", () => {
    const items = buildWorkHeaderMetadata(
      baseFrontmatter({
        category: "UX Redesign",
        year: 2025,
        meta: {
          type: "Proposal",
          industry: "Web3",
          platform: "iOS",
          status: "Not implemented",
        },
      }),
    );

    expect(items.some((item) => item.kind === "role")).toBe(false);
    expect(items.some((item) => item.kind === "client")).toBe(false);
    expect(items.length).toBe(6);
  });
});

describe("buildWorkHeaderTags", () => {
  it("merges tags and tools in order", () => {
    expect(buildWorkHeaderTags(["Healthcare", "Mobile UI"], ["Figma", "Prototyping"])).toEqual([
      "Healthcare",
      "Mobile UI",
      "Figma",
      "Prototyping",
    ]);
  });

  it("deduplicates case-insensitively while preserving first casing", () => {
    expect(buildWorkHeaderTags(["Figma"], ["figma", "Prototyping"])).toEqual([
      "Figma",
      "Prototyping",
    ]);
  });

  it("returns empty array when both inputs are empty", () => {
    expect(buildWorkHeaderTags([], [])).toEqual([]);
  });

  it("skips blank labels", () => {
    expect(buildWorkHeaderTags(["  ", "Healthcare"], ["", "Mobile UI"])).toEqual([
      "Healthcare",
      "Mobile UI",
    ]);
  });
});
