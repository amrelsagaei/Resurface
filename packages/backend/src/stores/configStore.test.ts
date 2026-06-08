import { DEFAULT_CONFIG } from "shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockFs } from "../__tests__/mockFs";
import { createMockSDK } from "../__tests__/mockSdk";

const mockFs = createMockFs();
const mockSdk = createMockSDK();

vi.mock("fs/promises", () => mockFs);
vi.mock("../sdk", () => ({ requireSDK: () => mockSdk }));

const { configStore } = await import("./configStore");

describe("configStore", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await configStore.initialize();
  });

  it("returns defaults initially", () => {
    expect(configStore.getConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("updates top-level fields", async () => {
    await configStore.updateConfig({ createFindings: false });
    expect(configStore.getConfig().createFindings).toBe(false);
  });

  it("merges webhook partially", async () => {
    await configStore.updateConfig({ webhook: { enabled: true } });
    const config = configStore.getConfig();
    expect(config.webhook.enabled).toBe(true);
    expect(config.webhook.url).toBe(DEFAULT_CONFIG.webhook.url);
  });

  it("setWatching toggles and emits", async () => {
    await configStore.setWatching(false);
    expect(configStore.isWatching()).toBe(false);
    const events = mockSdk.api.send.mock.calls.map((call) => call[0]);
    expect(events).toContain("watching:changed");
  });

  it("rejects invalid config", async () => {
    await expect(
      configStore.updateConfig({
        scanCapBytes: "big" as unknown as number,
      }),
    ).rejects.toThrow();
  });
});
