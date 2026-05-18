import { describe, expect, it, vi, beforeEach } from "vitest";

import { refreshLenisBounds } from "./refresh-lenis-bounds";

const { scrollTriggerRefresh } = vi.hoisted(() => ({
  scrollTriggerRefresh: vi.fn(),
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { refresh: scrollTriggerRefresh },
}));

describe("refreshLenisBounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls lenis.resize and ScrollTrigger.refresh", () => {
    const resize = vi.fn();
    const lenis = { resize };

    refreshLenisBounds(lenis as never);

    expect(resize).toHaveBeenCalledOnce();
    expect(scrollTriggerRefresh).toHaveBeenCalledOnce();
  });
});
