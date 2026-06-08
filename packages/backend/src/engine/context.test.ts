import { describe, expect, it } from "vitest";

import { sniffContext } from "./context";

function ctx(html: string, token = "cnry0abcdef"): string {
  return sniffContext(html, html.indexOf(token));
}

describe("sniffContext", () => {
  it("detects script", () => {
    expect(ctx(`<script>var x = "cnry0abcdef";</script>`)).toBe("script");
  });

  it("detects html-attr", () => {
    expect(ctx(`<input value="cnry0abcdef">`)).toBe("html-attr");
  });

  it("detects html-text", () => {
    expect(ctx(`<div>cnry0abcdef</div>`)).toBe("html-text");
  });

  it("detects json-string", () => {
    expect(ctx(`{"name":"cnry0abcdef"}`)).toBe("json-string");
  });

  it("does not tag a json key as json-string", () => {
    expect(ctx(`{"cnry0abcdef":"x"}`)).not.toBe("json-string");
  });

  it("detects url", () => {
    expect(ctx(`see https://x.com/p?q=cnry0abcdef now`)).toBe("url");
  });

  it("falls back to raw", () => {
    expect(ctx(`plain value cnry0abcdef here`)).toBe("raw");
  });
});
