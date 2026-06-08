import type { DefinePluginPackageSpec } from "@caido/sdk-shared";

import type { API } from "./api";
import type { Events } from "./events";

export { type Result, ok, err } from "./result";

export {
  CANARY_STATUSES,
  CanaryStatusSchema,
  type CanaryStatus,
  CONTEXT_TYPES,
  ContextTypeSchema,
  type ContextType,
  MATCH_SOURCES,
  MatchSourceSchema,
  type MatchSource,
  TRANSFORMS,
  TransformSchema,
  type Transform,
  WEBHOOK_FORMATS,
  WebhookFormatSchema,
  type WebhookFormat,
} from "./enums";

export { EndpointRefSchema, type EndpointRef } from "./endpoint";
export { CanarySchema, type Canary } from "./canary";
export { SightingSchema, type Sighting } from "./sighting";

export {
  WebhookConfigSchema,
  type WebhookConfig,
  ResurfaceConfigSchema,
  type ResurfaceConfig,
  DEFAULT_CONFIG,
  UpdateConfigSchema,
  type UpdateConfig,
} from "./config";

export type { API } from "./api";
export type { Events } from "./events";

export type Spec = DefinePluginPackageSpec<{
  manifestId: "resurface";
  api: API;
  events: Events;
}>;
