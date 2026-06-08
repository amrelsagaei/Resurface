import type { Canary } from "./canary";
import type { ResurfaceConfig, UpdateConfig } from "./config";
import type { CanaryStatus } from "./enums";
import type { Result } from "./result";
import type { Sighting } from "./sighting";

export type API = {
  getCanaries: () => Result<Canary[]>;
  generateCanary: () => Promise<Result<Canary>>;
  setCanaryStatus: (
    canaryId: string,
    status: CanaryStatus,
  ) => Promise<Result<Canary>>;
  setCanaryTags: (canaryId: string, tags: string[]) => Promise<Result<Canary>>;
  deleteCanary: (canaryId: string) => Promise<Result<void>>;
  clearCanaries: () => Promise<Result<void>>;

  getSightings: (canaryId?: string) => Result<Sighting[]>;
  promoteSighting: (sightingId: string) => Promise<Result<void>>;

  getConfig: () => Result<ResurfaceConfig>;
  updateConfig: (updates: UpdateConfig) => Promise<Result<ResurfaceConfig>>;

  getWatching: () => Result<boolean>;
  setWatching: (watching: boolean) => Promise<Result<boolean>>;

  testWebhook: () => Promise<Result<void>>;
};
