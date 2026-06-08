import { describe, expect, it } from "vitest";

import { extractSnippet } from "./snippet";

describe("extractSnippet", () => {
  it("returns full text when short", () => {
    expect(extractSnippet("abcDEFghi", 3, 3, 80)).toBe("abcDEFghi");
  });

  it("windows around the match with ellipses", () => {
    const text = "x".repeat(100) + "TOKEN" + "y".repeat(100);
    const snippet = extractSnippet(text, 100, 5, 10);
    expect(snippet).toBe(`...${"x".repeat(10)}TOKEN${"y".repeat(10)}...`);
  });

  it("omits leading ellipsis at start", () => {
    const text = `TOKEN${"y".repeat(100)}`;
    expect(extractSnippet(text, 0, 5, 10).startsWith("...")).toBe(false);
  });
});
