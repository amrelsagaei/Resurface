import type { Canary } from "./canary";
import type { ResurfaceConfig } from "./config";
import type { Sighting } from "./sighting";

export type Events = {
  "watching:changed": (watching: boolean) => void;
  "config:updated": (config: ResurfaceConfig) => void;
  "canary:created": (canary: Canary) => void;
  "canary:updated": (canary: Canary) => void;
  "canary:deleted": (canaryId: string) => void;
  "canaries:cleared": () => void;
  "sighting:detected": (sighting: Sighting) => void;
  "project:changed": (projectId: string | undefined) => void;
};
