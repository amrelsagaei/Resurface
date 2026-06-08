import path from "path";

import {
  type ContextType,
  type EndpointRef,
  type MatchSource,
  type Sighting,
  SightingSchema,
  type Transform,
} from "shared";

import { requireSDK } from "../sdk";
import { newId } from "../util/ids";

import { getProjectDir, readJson, writeJson } from "./storage";

export type SightingInput = {
  canaryId: string;
  token: string;
  source: MatchSource;
  contextType: ContextType;
  transform: Transform;
  endpoint: EndpointRef;
  requestId: string | undefined;
  snippet: string;
  plantedAt: number;
  at: number;
  capHit: boolean;
};

type DedupeFields = {
  canaryId: string;
  endpoint: EndpointRef;
  source: MatchSource;
  contextType: ContextType;
  transform: Transform;
};

function dedupeKey(fields: DedupeFields): string {
  return [
    fields.canaryId,
    fields.endpoint.host,
    fields.endpoint.path,
    fields.source,
    fields.contextType,
    fields.transform,
  ].join("|");
}

class SightingStoreClass {
  private projectId: string | undefined;
  private sightings = new Map<string, Sighting>();
  private byKey = new Map<string, string>();

  private file(): string {
    return path.join(getProjectDir(this.projectId), "sightings.json");
  }

  async switchProject(projectId: string | undefined): Promise<void> {
    this.projectId = projectId;
    this.sightings = new Map();
    this.byKey = new Map();
    const loaded = await readJson<unknown[]>(this.file());
    if (Array.isArray(loaded)) {
      for (const item of loaded) {
        const parsed = SightingSchema.safeParse(item);
        if (parsed.success) {
          this.sightings.set(parsed.data.id, parsed.data);
          this.byKey.set(dedupeKey(parsed.data), parsed.data.id);
        }
      }
    }
  }

  async initialize(): Promise<void> {
    const project = await requireSDK().projects.getCurrent();
    await this.switchProject(project?.getId());
  }

  list(canaryId?: string): Sighting[] {
    const all = [...this.sightings.values()];
    const filtered =
      canaryId !== undefined ? all.filter((s) => s.canaryId === canaryId) : all;
    return filtered.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  }

  get(id: string): Sighting | undefined {
    return this.sightings.get(id);
  }

  async record(
    input: SightingInput,
    dedupe: boolean,
  ): Promise<{ sighting: Sighting; isNew: boolean }> {
    const key = dedupeKey(input);
    if (dedupe) {
      const existingId = this.byKey.get(key);
      const existing =
        existingId !== undefined ? this.sightings.get(existingId) : undefined;
      if (existing !== undefined) {
        const updated: Sighting = {
          ...existing,
          seenCount: existing.seenCount + 1,
          lastSeenAt: input.at,
          timeSincePlantMs: input.at - input.plantedAt,
          snippet: input.snippet,
          requestId: input.requestId,
          capHit: input.capHit,
        };
        this.sightings.set(existing.id, updated);
        await this.persist();
        return { sighting: updated, isNew: false };
      }
    }

    const sighting: Sighting = {
      id: newId("s"),
      canaryId: input.canaryId,
      token: input.token,
      source: input.source,
      contextType: input.contextType,
      transform: input.transform,
      endpoint: input.endpoint,
      requestId: input.requestId,
      snippet: input.snippet,
      seenCount: 1,
      firstSeenAt: input.at,
      lastSeenAt: input.at,
      timeSincePlantMs: input.at - input.plantedAt,
      capHit: input.capHit,
      promoted: false,
    };
    this.sightings.set(sighting.id, sighting);
    this.byKey.set(key, sighting.id);
    await this.persist();
    return { sighting, isNew: true };
  }

  async markPromoted(id: string): Promise<void> {
    const existing = this.sightings.get(id);
    if (existing === undefined) {
      return;
    }
    this.sightings.set(id, { ...existing, promoted: true });
    await this.persist();
  }

  private async persist(): Promise<void> {
    await writeJson(this.file(), [...this.sightings.values()]);
  }
}

export const sightingStore = new SightingStoreClass();
