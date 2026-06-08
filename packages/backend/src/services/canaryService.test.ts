import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockFs } from "../__tests__/mockFs";
import { createMockSDK } from "../__tests__/mockSdk";

const mockFs = createMockFs();
const mockSdk = createMockSDK();

vi.mock("fs/promises", () => mockFs);
vi.mock("../sdk", () => ({ requireSDK: () => mockSdk }));

const { configStore } = await import("../stores/configStore");
const { canaryStore } = await import("../stores/canaryStore");
const { generateCanary } = await import("./canaryService");

describe("generateCanary", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await configStore.initialize();
    await canaryStore.initialize();
  });

  it("creates and stores an active canary with a token", async () => {
    const canary = await generateCanary();
    expect(canary.token.startsWith("cnry0")).toBe(true);
    expect(canary.status).toBe("active");
    expect(canary.tags).toEqual([]);
    expect(canaryStore.getActive()).toHaveLength(1);
  });
});
