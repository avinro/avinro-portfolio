import { describe, expect, it } from "vitest";

import {
  INTRO_HOME_PATHS,
  isIntroHomePath,
  normalizeIntroPath,
} from "@/lib/intro/block-first-paint";

describe("isIntroHomePath", () => {
  it("includes localized home paths", () => {
    expect(INTRO_HOME_PATHS).toEqual(["/", "/es"]);
  });

  it("normalizes trailing slashes", () => {
    expect(normalizeIntroPath("/es/")).toBe("/es");
    expect(normalizeIntroPath("////")).toBe("/");
  });

  it("only treats localized home routes as intro routes", () => {
    expect(isIntroHomePath("/")).toBe(true);
    expect(isIntroHomePath("/es")).toBe(true);
    expect(isIntroHomePath("/work")).toBe(false);
    expect(isIntroHomePath("/es/work")).toBe(false);
  });
});
