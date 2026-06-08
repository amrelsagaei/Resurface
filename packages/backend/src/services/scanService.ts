import { type Body, type Request, type Response } from "caido:utils";
import { type EndpointRef, type ResurfaceConfig } from "shared";

import { collectSightings, type ScanSource } from "../engine/collect";
import { isTextContentType } from "../engine/contentType";
import { requireSDK } from "../sdk";
import { canaryStore, configStore, sightingStore } from "../stores";
import type { BackendSDK } from "../types";

import { devLog } from "./logger";
import { isSelfTraffic } from "./selfTraffic";
import { onNewSighting } from "./surface";

const SNIPPET_WINDOW = 80;
const FLUSH_INTERVAL_MS = 1000;

type Collected = ReturnType<typeof collectSightings>[number];
type PendingScan = { items: Collected[]; request: Request; at: number };

const pending: PendingScan[] = [];
let flushing = false;

function endpointOf(request: Request): EndpointRef {
  return {
    host: request.getHost(),
    port: request.getPort(),
    tls: request.getTls(),
    method: request.getMethod(),
    path: request.getPath(),
  };
}

function headersToText(headers: Record<string, Array<string>>): string {
  return Object.entries(headers)
    .map(([name, values]) => `${name}: ${values.join(", ")}`)
    .join("\n");
}

function contentType(value: Array<string> | undefined): string | undefined {
  return value?.[0];
}

function bodySource(
  source: ScanSource["source"],
  body: Body | undefined,
  type: string | undefined,
  config: ResurfaceConfig,
): ScanSource | undefined {
  if (body === undefined) {
    return undefined;
  }
  if (config.skipNonText && !isTextContentType(type)) {
    return undefined;
  }
  const text = body.toText();
  if (text.length > config.scanCapBytes) {
    return { source, text: text.slice(0, config.scanCapBytes), capHit: true };
  }
  return { source, text, capHit: false };
}

function buildSources(
  request: Request,
  response: Response,
  config: ResurfaceConfig,
): ScanSource[] {
  const sources: ScanSource[] = [
    { source: "url", text: request.getUrl(), capHit: false },
    {
      source: "request-header",
      text: headersToText(request.getHeaders()),
      capHit: false,
    },
    {
      source: "response-header",
      text: headersToText(response.getHeaders()),
      capHit: false,
    },
  ];

  const requestBody = bodySource(
    "request-body",
    request.getBody(),
    contentType(request.getHeader("content-type")),
    config,
  );
  if (requestBody !== undefined) {
    sources.push(requestBody);
  }

  const responseBody = bodySource(
    "response-body",
    response.getBody(),
    contentType(response.getHeader("content-type")),
    config,
  );
  if (responseBody !== undefined) {
    sources.push(responseBody);
  }

  return sources;
}

function detect(request: Request, response: Response): Collected[] {
  const config = configStore.getConfig();
  if (!config.watching) {
    return [];
  }

  const canaries = canaryStore.getActive();
  if (canaries.length === 0) {
    return [];
  }

  if (config.scopeOnly && !requireSDK().requests.inScope(request)) {
    devLog(`skip out-of-scope ${request.getHost()}${request.getPath()}`);
    return [];
  }
  if (isSelfTraffic(request, config)) {
    return [];
  }

  const collected = collectSightings({
    canaries,
    endpoint: endpointOf(request),
    requestId: request.getId(),
    sources: buildSources(request, response, config),
    window: SNIPPET_WINDOW,
  });
  devLog(
    `scan ${request.getHost()}${request.getPath()}: ${collected.length} matches (${canaries.length} active canaries)`,
  );
  return collected;
}

async function record(
  item: Collected,
  request: Request,
  at: number,
): Promise<void> {
  const { sighting } = await sightingStore.record(
    { ...item, at },
    configStore.getConfig().dedupe,
  );
  await canaryStore.recordSighting(item.canaryId, at);
  requireSDK().api.send("sighting:detected", sighting);
  const canary = canaryStore.get(item.canaryId);
  if (canary !== undefined) {
    await onNewSighting(sighting, canary, request);
  }
}

export async function handleResponse(
  request: Request,
  response: Response,
): Promise<void> {
  const items = detect(request, response);
  for (const item of items) {
    await record(item, request, Date.now());
  }
}

async function flush(): Promise<void> {
  if (flushing) {
    return;
  }
  flushing = true;
  try {
    while (pending.length > 0) {
      const next = pending.shift();
      if (next === undefined) {
        continue;
      }
      for (const item of next.items) {
        try {
          await record(item, next.request, next.at);
        } catch (error) {
          devLog(`record failed: ${String(error)}`);
        }
      }
    }
  } finally {
    flushing = false;
  }
}

export function registerScanner(sdk: BackendSDK): void {
  sdk.events.onInterceptResponse((_sdk, request, response) => {
    const items = detect(request, response);
    if (items.length > 0) {
      pending.push({ items, request, at: Date.now() });
    }
  });
  setInterval(() => {
    void flush();
  }, FLUSH_INTERVAL_MS);
}
