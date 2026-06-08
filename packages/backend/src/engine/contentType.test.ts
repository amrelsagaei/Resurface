import { describe, expect, it } from "vitest";

import { isTextContentType } from "./contentType";

describe("isTextContentType", () => {
  it("treats html and json as text", () => {
    expect(isTextContentType("text/html")).toBe(true);
    expect(isTextContentType("application/json")).toBe(true);
  });

  it("treats images and binaries as non-text", () => {
    expect(isTextContentType("image/png")).toBe(false);
    expect(isTextContentType("application/octet-stream")).toBe(false);
  });

  it("treats unknown or empty as text", () => {
    expect(isTextContentType(undefined)).toBe(true);
    expect(isTextContentType("")).toBe(true);
  });

  it("ignores charset suffix", () => {
    expect(isTextContentType("text/html; charset=utf-8")).toBe(true);
  });
});
