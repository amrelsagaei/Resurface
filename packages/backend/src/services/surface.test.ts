import { type Request } from "caido:utils";
import type { Canary, Sighting } from "shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockFs } from "../__tests__/mockFs";
import { createMockSDK } from "../__tests__/mockSdk";

const mockFs = createMockFs();
const mockSdk = createMockSDK();
const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

vi.mock("fs/promises", () => mockFs);
vi.mock("../sdk", () => ({ requireSDK: () => mockSdk }));
vi.mock("caido:http", () => {
  class MockBlob {
    constructor(public parts: string[]) {}
  }
  return { fetch: mockFetch, Blob: MockBlob };
});

const { configStore } = await import("../stores/configStore");
const { onNewSighting } = await import("./surface");

const canary: Canary = {
  id: "c1",
  token: "cnry0abc",
  status: "active",
  tags: [],
  createdAt: 1000,
  sightingCount: 0,
};

const sighting: Sighting = {
  id: "s1",
  canaryId: "c1",
  token: "cnry0abc",
  source: "response-body",
  contextType: "html-text",
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

const request = {} as unknown as Request;

describe("onNewSighting", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await configStore.initialize();
  });

  it("creates a finding and sends a webhook when enabled", async () => {
    await configStore.updateConfig({
      createFindings: true,
      webhook: { enabled: true, url: "https://hook.test/x", format: "discord" },
    });
    await onNewSighting(sighting, canary, request);
    expect(mockSdk.findings.create).toHaveBeenCalledTimes(1);
    expect(mockSdk.findings.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reporter: "Resurface",
        dedupeKey: expect.stringContaining("c1"),
        request,
      }),
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0]?.[0]).toBe("https://hook.test/x");
  });

  it("skips the webhook when it is disabled", async () => {
    await configStore.updateConfig({
      createFindings: false,
      webhook: { enabled: false, url: "", format: "discord" },
    });
    await onNewSighting(sighting, canary, request);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("skips the webhook when enabled but the URL is empty", async () => {
    await configStore.updateConfig({
      createFindings: false,
      webhook: { enabled: true, url: "", format: "discord" },
    });
    await onNewSighting(sighting, canary, request);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
