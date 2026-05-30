/**
 * Tests for the work category localizer.
 *
 * The `category` field is a closed Zod enum whose English value doubles as the
 * stable catalog key (it cannot be localized in MDX). These tests cover:
 *   - Known categories resolve through the `categories.*` catalog.
 *   - Missing keys fall back to the raw enum value (badge never renders blank).
 *   - The catalog key is built as `categories.<category>`.
 */

import { describe, it, expect, vi } from "vitest";
import { localizeWorkCategory, type CategoryTranslator } from "./work-category";

/** Builds a minimal CategoryTranslator backed by a plain catalog object. */
function makeTranslator(catalog: Record<string, string>): CategoryTranslator {
  const t = ((key: string) => catalog[key] ?? key) as CategoryTranslator;
  t.has = (key: string) => key in catalog;
  return t;
}

describe("localizeWorkCategory", () => {
  it("resolves a known category through the categories.* catalog", () => {
    const t = makeTranslator({ "categories.UX Redesign": "Rediseño UX" });
    expect(localizeWorkCategory("UX Redesign", t)).toBe("Rediseño UX");
  });

  it("falls back to the raw enum value when the key is missing", () => {
    const t = makeTranslator({});
    expect(localizeWorkCategory("Concept", t)).toBe("Concept");
  });

  it("builds the catalog key as categories.<category>", () => {
    const has = vi.fn().mockReturnValue(false);
    const t = ((key: string) => key) as CategoryTranslator;
    t.has = has;
    localizeWorkCategory("Visual system", t);
    expect(has).toHaveBeenCalledWith("categories.Visual system");
  });
});
