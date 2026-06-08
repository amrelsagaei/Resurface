import {
  type Canary,
  type ContextType,
  type EndpointRef,
  type MatchSource,
  type Transform,
} from "shared";

import { sniffContext } from "./context";
import { findMatches } from "./match";
import { extractSnippet } from "./snippet";

export type ScanSource = {
  source: MatchSource;
  text: string;
  capHit: boolean;
};

type Collected = {
  canaryId: string;
  token: string;
  source: MatchSource;
  contextType: ContextType;
  transform: Transform;
  endpoint: EndpointRef;
  requestId: string | undefined;
  snippet: string;
  capHit: boolean;
  plantedAt: number;
};

function contextFor(
  source: MatchSource,
  text: string,
  index: number,
): ContextType {
  if (source === "response-header" || source === "request-header") {
    return "header";
  }
  if (source === "url") {
    return "url";
  }
  return sniffContext(text, index);
}

type CollectInput = {
  canaries: ReadonlyArray<Canary>;
  endpoint: EndpointRef;
  requestId: string | undefined;
  sources: ReadonlyArray<ScanSource>;
  window: number;
};

export function collectSightings(input: CollectInput): Collected[] {
  const { canaries, endpoint, requestId, sources, window } = input;
  const result: Collected[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    for (const match of findMatches(source.text, canaries)) {
      const canary = canaries.find((c) => c.id === match.canaryId);
      if (canary === undefined) {
        continue;
      }
      const contextType = contextFor(source.source, source.text, match.index);
      const key = `${match.canaryId}|${source.source}|${contextType}|${match.transform}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push({
        canaryId: match.canaryId,
        token: match.token,
        source: source.source,
        contextType,
        transform: match.transform,
        endpoint,
        requestId,
        snippet: extractSnippet(source.text, match.index, match.length, window),
        capHit: source.capHit,
        plantedAt: canary.createdAt,
      });
    }
  }

  return result;
}
