import { describe, expect, it } from "vitest";

import { findMatches, hasPrefix } from "./match";

const canaries = [{ id: "c1", token: "cnry0abcdef1234" }];

describe("findMatches", () => {
  it("pre-filters text without the prefix", () => {
    expect(findMatches("nothing here", canaries)).toEqual([]);
    expect(hasPrefix("nothing")).toBe(false);
  });

  it("matches raw token", () => {
    const m = findMatches("x cnry0abcdef1234 y", canaries);
    expect(m).toHaveLength(1);
    expect(m[0]?.transform).toBe("raw");
    expect(m[0]?.index).toBe(2);
  });

  it("matches uppercase token", () => {
    const m = findMatches("X CNRY0ABCDEF1234 Y", canaries);
    expect(m[0]?.transform).toBe("uppercase");
  });

  it("matches truncated token", () => {
    const m = findMatches("clip cnry0abcdef end", canaries);
    expect(m[0]?.transform).toBe("truncated");
  });

  it("prefers raw over truncated", () => {
    const m = findMatches("cnry0abcdef1234", canaries);
    expect(m).toHaveLength(1);
    expect(m[0]?.transform).toBe("raw");
  });

  it("matches every occurrence of the raw form", () => {
    const m = findMatches("a cnry0abcdef1234 b cnry0abcdef1234 c", canaries);
    expect(m).toHaveLength(2);
    expect(m.every((match) => match.transform === "raw")).toBe(true);
    expect(m[0]?.index).not.toBe(m[1]?.index);
  });

  it("matches multiple canaries", () => {
    const two = [
      { id: "c1", token: "cnry0aaaaaa1111" },
      { id: "c2", token: "cnry0bbbbbb2222" },
    ];
    const m = findMatches("cnry0aaaaaa1111 and cnry0bbbbbb2222", two);
    expect(m).toHaveLength(2);
  });
});
