import { describe, expect, it } from "vitest";

import { generateToken, TOKEN_PREFIX } from "./token";

describe("token", () => {
  it("starts with the prefix", () => {
    expect(generateToken(10).startsWith(TOKEN_PREFIX)).toBe(true);
  });

  it("has the requested random length", () => {
    expect(generateToken(10)).toHaveLength(TOKEN_PREFIX.length + 10);
  });

  it("is lowercase alphanumeric", () => {
    expect(/^cnry0[a-z0-9]+$/.test(generateToken(12))).toBe(true);
  });

  it("falls back to length 10 for non-positive", () => {
    expect(generateToken(0)).toHaveLength(TOKEN_PREFIX.length + 10);
  });

  it("generates unique tokens", () => {
    const set = new Set(Array.from({ length: 500 }, () => generateToken(10)));
    expect(set.size).toBe(500);
  });
});
