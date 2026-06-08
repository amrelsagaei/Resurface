import path from "path";

import {
  DEFAULT_CONFIG,
  type ResurfaceConfig,
  ResurfaceConfigSchema,
  type UpdateConfig,
  UpdateConfigSchema,
} from "shared";

import { ValidationError } from "../errors";
import { requireSDK } from "../sdk";

import { getBasePath, readJson, writeJson } from "./storage";

class ConfigStoreClass {
  private data: ResurfaceConfig = { ...DEFAULT_CONFIG };

  private file(): string {
    return path.join(getBasePath(), "config.json");
  }

  async initialize(): Promise<void> {
    const loaded = await readJson<unknown>(this.file());
    const merged =
      typeof loaded === "object" && loaded !== null
        ? { ...DEFAULT_CONFIG, ...loaded }
        : DEFAULT_CONFIG;
    const parsed = ResurfaceConfigSchema.safeParse(merged);
    this.data = parsed.success ? parsed.data : { ...DEFAULT_CONFIG };
    await writeJson(this.file(), this.data);
  }

  getConfig(): ResurfaceConfig {
    return { ...this.data };
  }

  isWatching(): boolean {
    return this.data.watching;
  }

  async updateConfig(updates: UpdateConfig): Promise<ResurfaceConfig> {
    const parsed = UpdateConfigSchema.safeParse(updates);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.message);
    }

    const { webhook, ...rest } = parsed.data;
    this.data = {
      ...this.data,
      ...rest,
      webhook:
        webhook !== undefined
          ? { ...this.data.webhook, ...webhook }
          : this.data.webhook,
    };

    await writeJson(this.file(), this.data);
    requireSDK().api.send("config:updated", this.getConfig());
    return this.getConfig();
  }

  async setWatching(value: boolean): Promise<boolean> {
    await this.updateConfig({ watching: value });
    requireSDK().api.send("watching:changed", value);
    return value;
  }
}

export const configStore = new ConfigStoreClass();
