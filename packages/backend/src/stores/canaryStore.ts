import path from "path";

import { type Canary, CanarySchema, type CanaryStatus } from "shared";

import { NotFoundError } from "../errors";
import { requireSDK } from "../sdk";

import { getProjectDir, readJson, writeJson } from "./storage";

class CanaryStoreClass {
  private projectId: string | undefined;
  private canaries = new Map<string, Canary>();

  private file(): string {
    return path.join(getProjectDir(this.projectId), "canaries.json");
  }

  async initialize(): Promise<void> {
    const project = await requireSDK().projects.getCurrent();
    await this.switchProject(project?.getId());
  }

  async switchProject(projectId: string | undefined): Promise<void> {
    this.projectId = projectId;
    this.canaries = new Map();
    const loaded = await readJson<unknown[]>(this.file());
    if (Array.isArray(loaded)) {
      for (const item of loaded) {
        const parsed = CanarySchema.safeParse(item);
        if (parsed.success) {
          this.canaries.set(parsed.data.id, parsed.data);
        }
      }
    }
  }

  list(): Canary[] {
    return [...this.canaries.values()].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }

  get(id: string): Canary | undefined {
    return this.canaries.get(id);
  }

  getActive(): Canary[] {
    return [...this.canaries.values()].filter((c) => c.status === "active");
  }

  async add(canary: Canary): Promise<Canary> {
    this.canaries.set(canary.id, canary);
    await this.persist();
    requireSDK().api.send("canary:created", canary);
    return canary;
  }

  async update(id: string, patch: Partial<Canary>): Promise<Canary> {
    const existing = this.canaries.get(id);
    if (existing === undefined) {
      throw new NotFoundError(`Canary ${id}`);
    }
    const updated: Canary = { ...existing, ...patch, id: existing.id };
    this.canaries.set(id, updated);
    await this.persist();
    requireSDK().api.send("canary:updated", updated);
    return updated;
  }

  async setStatus(id: string, status: CanaryStatus): Promise<Canary> {
    return this.update(id, { status });
  }

  async setTags(id: string, tags: string[]): Promise<Canary> {
    return this.update(id, { tags });
  }

  async recordSighting(id: string, at: number): Promise<void> {
    const existing = this.canaries.get(id);
    if (existing === undefined) {
      return;
    }
    await this.update(id, {
      sightingCount: existing.sightingCount + 1,
      lastSeenAt: at,
    });
  }

  async delete(id: string): Promise<void> {
    if (!this.canaries.delete(id)) {
      throw new NotFoundError(`Canary ${id}`);
    }
    await this.persist();
    requireSDK().api.send("canary:deleted", id);
  }

  async clear(): Promise<void> {
    this.canaries.clear();
    await this.persist();
    requireSDK().api.send("canaries:cleared");
  }

  private async persist(): Promise<void> {
    await writeJson(this.file(), [...this.canaries.values()]);
  }
}

export const canaryStore = new CanaryStoreClass();
