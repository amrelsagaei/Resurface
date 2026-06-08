import type { Canary, Sighting } from "shared";
import { describe, expect, it } from "vitest";

import { buildWriteup } from "./template";

const canary: Canary = {
  id: "c1",
  token: "cnry0abc",
  status: "active",
  tags: ["login", "admin"],
  createdAt: 1000,
  sightingCount: 1,
};

const sighting: Sighting = {
  id: "s1",
  canaryId: "c1",
  token: "cnry0abc",
  source: "response-body",
  contextType: "script",
  transform: "raw",
  endpoint: { host: "b.com", port: 443, tls: true, method: "GET", path: "/p" },
  requestId: "2",
  snippet: "...cnry0abc...",
  seenCount: 1,
  firstSeenAt: 2000,
  lastSeenAt: 2000,
  timeSincePlantMs: 1000,
  capHit: false,
  promoted: false,
};

describe("buildWriteup", () => {
  it("includes token, endpoint, and tags", () => {
    const writeup = buildWriteup(sighting, canary);
    expect(writeup.title).toContain("b.com/p");
    expect(writeup.description).toContain("cnry0abc");
    expect(writeup.description).toContain("GET b.com/p");
    expect(writeup.description).toContain("login");
  });

  it("does not include a next-step line", () => {
    expect(buildWriteup(sighting, canary).description).not.toContain(
      "Next step",
    );
  });

  it("notes when the scan cap was hit", () => {
    const writeup = buildWriteup({ ...sighting, capHit: true }, canary);
    expect(writeup.description).toContain("scan cap");
  });
});
