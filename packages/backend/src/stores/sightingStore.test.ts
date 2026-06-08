import type { EndpointRef } from "shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockFs } from "../__tests__/mockFs";
import { createMockSDK } from "../__tests__/mockSdk";

import { type SightingInput } from "./sightingStore";

const mockFs = createMockFs();
const mockSdk = createMockSDK();

vi.mock("fs/promises", () => mockFs);
vi.mock("../sdk", () => ({ requireSDK: () => mockSdk }));

const { sightingStore } = await import("./sightingStore");

const endpoint: EndpointRef = {
  host: "example.com",
  port: 443,
  tls: true,
  method: "GET",
  path: "/a",
};

function makeInput(overrides: Partial<SightingInput> = {}): SightingInput {
  return {
    canaryId: "c1",
    token: "cnry0abc",
    source: "response-body",
    contextType: "html-text",
    transform: "raw",
    endpoint,
    requestId: "r1",
    snippet: "...cnry0abc...",
    plantedAt: 1000,
    at: 2000,
    capHit: false,
    ...overrides,
  };
}

describe("sightingStore", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await sightingStore.switchProject(undefined);
  });

  it("records a new sighting", async () => {
    const { sighting, isNew } = await sightingStore.record(makeInput(), true);
    expect(isNew).toBe(true);
    expect(sighting.seenCount).toBe(1);
    expect(sighting.timeSincePlantMs).toBe(1000);
  });

  it("dedupes repeat sightings", async () => {
    await sightingStore.record(makeInput(), true);
    const { sighting, isNew } = await sightingStore.record(
      makeInput({ at: 3000 }),
      true,
    );
    expect(isNew).toBe(false);
    expect(sighting.seenCount).toBe(2);
    expect(sighting.lastSeenAt).toBe(3000);
    expect(sightingStore.list()).toHaveLength(1);
  });

  it("keeps distinct endpoints separate", async () => {
    await sightingStore.record(makeInput(), true);
    await sightingStore.record(
      makeInput({ endpoint: { ...endpoint, path: "/b" } }),
      true,
    );
    expect(sightingStore.list()).toHaveLength(2);
  });

  it("does not dedupe when disabled", async () => {
    await sightingStore.record(makeInput(), false);
    await sightingStore.record(makeInput(), false);
    expect(sightingStore.list()).toHaveLength(2);
  });

  it("filters by canary", async () => {
    await sightingStore.record(makeInput(), true);
    await sightingStore.record(makeInput({ canaryId: "c2" }), true);
    expect(sightingStore.list("c1")).toHaveLength(1);
  });
});
