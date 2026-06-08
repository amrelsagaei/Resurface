import type { Canary } from "shared";
import { describe, expect, it } from "vitest";

import { collectSightings, type ScanSource } from "./collect";

const canary: Canary = {
  id: "c1",
  token: "cnry0abcdef1234",
  status: "active",
  tags: [],
  createdAt: 1000,
  sightingCount: 0,
};

const endpoint = {
  host: "b.com",
  port: 443,
  tls: true,
  method: "GET",
  path: "/y",
};

function run(sources: ScanSource[]) {
  return collectSightings({
    canaries: [canary],
    endpoint,
    requestId: "2",
    sources,
    window: 80,
  });
}

describe("collectSightings", () => {
  it("sniffs context for a body match", () => {
    const result = run([
      {
        source: "response-body",
        text: "<div>cnry0abcdef1234</div>",
        capHit: false,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.contextType).toBe("html-text");
    expect(result[0]?.plantedAt).toBe(1000);
  });

  it("uses header context for header sources", () => {
    const result = run([
      { source: "response-header", text: "X: cnry0abcdef1234", capHit: false },
    ]);
    expect(result[0]?.contextType).toBe("header");
  });

  it("uses url context for url sources", () => {
    const result = run([
      {
        source: "url",
        text: "https://b.com/y?q=cnry0abcdef1234",
        capHit: false,
      },
    ]);
    expect(result[0]?.contextType).toBe("url");
  });

  it("propagates the cap-hit flag", () => {
    const result = run([
      { source: "response-body", text: "cnry0abcdef1234", capHit: true },
    ]);
    expect(result[0]?.capHit).toBe(true);
  });

  it("dedupes repeated same-context matches in one source", () => {
    const result = run([
      {
        source: "response-body",
        text: "<p>cnry0abcdef1234</p><p>cnry0abcdef1234</p>",
        capHit: false,
      },
    ]);
    expect(result).toHaveLength(1);
  });

  it("keeps distinct contexts within one source", () => {
    const result = run([
      {
        source: "response-body",
        text: "<script>var x='cnry0abcdef1234'</script><p>cnry0abcdef1234</p>",
        capHit: false,
      },
    ]);
    expect(result).toHaveLength(2);
    expect(new Set(result.map((r) => r.contextType)).size).toBe(2);
  });
});
