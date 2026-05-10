import { describe, expect, it } from "vitest";
import { rateLimitHit } from "@/lib/rate-limit";

describe("rateLimitHit", () => {
  it("allows under limit then blocks", () => {
    const key = `t-${Math.random()}`;
    expect(rateLimitHit(key, 2, 60_000)).toBe(false);
    expect(rateLimitHit(key, 2, 60_000)).toBe(false);
    expect(rateLimitHit(key, 2, 60_000)).toBe(true);
  });
});
