import type { Canary } from "shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockFs } from "../__tests__/mockFs";
import { createMockSDK } from "../__tests__/mockSdk";

const mockFs = createMockFs();
const mockSdk = createMockSDK();

vi.mock("fs/promises", () => mockFs);
vi.mock("../sdk", () => ({ requireSDK: () => mockSdk }));

const { canaryStore } = await import("./canaryStore");

function makeCanary(id: string, overrides: Partial<Canary> = {}): Canary {
  return {
    id,
    token: `cnry0${id}`,
    status: "active",
    tags: [],
    createdAt: Date.now(),
    sightingCount: 0,
    ...overrides,
  };
}

describe("canaryStore", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await canaryStore.initialize();
  });

  it("adds and lists", async () => {
    await canaryStore.add(makeCanary("a"));
    expect(canaryStore.list()).toHaveLength(1);
  });

  it("filters active", async () => {
    await canaryStore.add(makeCanary("a"));
    await canaryStore.add(makeCanary("b", { status: "muted" }));
    expect(canaryStore.getActive()).toHaveLength(1);
  });

  it("updates status", async () => {
    await canaryStore.add(makeCanary("a"));
    await canaryStore.setStatus("a", "archived");
    expect(canaryStore.get("a")?.status).toBe("archived");
  });

  it("records sighting count", async () => {
    await canaryStore.add(makeCanary("a"));
    await canaryStore.recordSighting("a", 123);
    const canary = canaryStore.get("a");
    expect(canary?.sightingCount).toBe(1);
    expect(canary?.lastSeenAt).toBe(123);
  });

  it("deletes", async () => {
    await canaryStore.add(makeCanary("a"));
    await canaryStore.delete("a");
    expect(canaryStore.get("a")).toBeUndefined();
  });

  it("persists across reload", async () => {
    await canaryStore.add(makeCanary("a"));
    await canaryStore.switchProject(undefined);
    expect(canaryStore.get("a")).toBeDefined();
  });
});
