import { type Request, type Response } from "caido:utils";
import type { Canary } from "shared";
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
const { canaryStore } = await import("../stores/canaryStore");
const { sightingStore } = await import("../stores/sightingStore");
const { handleResponse } = await import("./scanService");

type Headers = Record<string, Array<string>>;

function fakeRequest(host: string, path: string, id: string): Request {
  return {
    getId: () => id,
    getHost: () => host,
    getPort: () => 443,
    getTls: () => true,
    getMethod: () => "GET",
    getPath: () => path,
    getUrl: () => `https://${host}${path}`,
    getHeaders: () => ({}),
    getHeader: () => undefined,
    getBody: () => undefined,
  } as unknown as Request;
}

function fakeResponse(headers: Headers, bodyText: string): Response {
  return {
    getCode: () => 200,
    getHeaders: () => headers,
    getHeader: (name: string) => headers[name],
    getBody: () => ({ toText: () => bodyText }),
  } as unknown as Response;
}

const html: Headers = { "content-type": ["text/html"] };

async function addCanary(): Promise<Canary> {
  return canaryStore.add({
    id: "c1",
    token: "cnry0abcdef1234",
    status: "active",
    tags: [],
    createdAt: 1000,
    sightingCount: 0,
  });
}

function sentEvents(): unknown[] {
  return mockSdk.api.send.mock.calls.map((call) => call[0]);
}

describe("scanService.handleResponse", () => {
  beforeEach(async () => {
    mockFs._store.clear();
    vi.clearAllMocks();
    await configStore.initialize();
    await canaryStore.initialize();
    await sightingStore.switchProject(undefined);
  });

  it("records a sighting from a response body and emits an event", async () => {
    await addCanary();
    await handleResponse(
      fakeRequest("victim.com", "/profile", "r2"),
      fakeResponse(html, "<div>cnry0abcdef1234</div>"),
    );
    const sightings = sightingStore.list();
    expect(sightings).toHaveLength(1);
    expect(sightings[0]?.contextType).toBe("html-text");
    expect(sentEvents()).toContain("sighting:detected");
  });

  it("notifies on every repeat occurrence while deduping the row", async () => {
    await addCanary();
    const request = fakeRequest("victim.com", "/profile", "r2");
    const response = fakeResponse(html, "<div>cnry0abcdef1234</div>");
    await handleResponse(request, response);
    await handleResponse(request, response);
    const emits = sentEvents().filter((e) => e === "sighting:detected");
    expect(emits).toHaveLength(2);
    expect(sightingStore.list()).toHaveLength(1);
    expect(canaryStore.get("c1")?.sightingCount).toBe(2);
  });

  it("does nothing when watching is off", async () => {
    await addCanary();
    await configStore.setWatching(false);
    await handleResponse(
      fakeRequest("victim.com", "/p", "r2"),
      fakeResponse(html, "cnry0abcdef1234"),
    );
    expect(sightingStore.list()).toHaveLength(0);
  });

  it("skips non-text response bodies", async () => {
    await addCanary();
    await handleResponse(
      fakeRequest("victim.com", "/img", "r2"),
      fakeResponse({ "content-type": ["image/png"] }, "cnry0abcdef1234"),
    );
    expect(sightingStore.list()).toHaveLength(0);
  });

  it("skips out-of-scope responses when scopeOnly is enabled", async () => {
    await addCanary();
    await configStore.updateConfig({ scopeOnly: true });
    mockSdk.requests.inScope.mockReturnValue(false);
    await handleResponse(
      fakeRequest("victim.com", "/api", "r2"),
      fakeResponse(html, "<div>cnry0abcdef1234</div>"),
    );
    expect(sightingStore.list()).toHaveLength(0);
    expect(mockSdk.requests.inScope).toHaveBeenCalled();
    mockSdk.requests.inScope.mockReturnValue(true);
  });

  it("skips traffic to the configured webhook host", async () => {
    await addCanary();
    await configStore.updateConfig({
      webhook: {
        enabled: true,
        url: "https://hook.example.com/x",
        format: "discord",
      },
    });
    await handleResponse(
      fakeRequest("hook.example.com", "/x", "r2"),
      fakeResponse(html, "<div>cnry0abcdef1234</div>"),
    );
    expect(sightingStore.list()).toHaveLength(0);
  });
});
