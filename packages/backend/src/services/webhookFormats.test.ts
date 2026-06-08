import { describe, expect, it } from "vitest";

import { formatPayload } from "./webhookFormats";

const writeup = { title: "T", description: "D" };

describe("formatPayload", () => {
  it("discord uses a content field", () => {
    const payload = formatPayload("discord", writeup) as { content: string };
    expect(payload.content).toContain("T");
    expect(payload.content).toContain("D");
  });

  it("slack uses a text field", () => {
    const payload = formatPayload("slack", writeup) as { text: string };
    expect(payload.text).toContain("T");
  });

  it("generic uses title and description", () => {
    const payload = formatPayload("generic", writeup) as {
      title: string;
      description: string;
    };
    expect(payload.title).toBe("T");
    expect(payload.description).toBe("D");
  });

  it("clips long discord content", () => {
    const payload = formatPayload("discord", {
      title: "T",
      description: "x".repeat(5000),
    }) as { content: string };
    expect(payload.content.length).toBeLessThan(2000);
  });
});
