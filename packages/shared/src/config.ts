import { z } from "zod";

import { WebhookFormatSchema } from "./enums";

export const WebhookConfigSchema = z.object({
  enabled: z.boolean(),
  url: z.string(),
  format: WebhookFormatSchema,
});

export type WebhookConfig = z.infer<typeof WebhookConfigSchema>;

export const ResurfaceConfigSchema = z.object({
  watching: z.boolean(),
  scopeOnly: z.boolean(),
  skipNonText: z.boolean(),
  dedupe: z.boolean(),
  scanCapBytes: z.number().int().min(1024),
  tokenLength: z.number().int().min(6).max(64),
  createFindings: z.boolean(),
  webhook: WebhookConfigSchema,
  devMode: z.boolean(),
});

export type ResurfaceConfig = z.infer<typeof ResurfaceConfigSchema>;

export const DEFAULT_CONFIG: ResurfaceConfig = {
  watching: true,
  scopeOnly: false,
  skipNonText: true,
  dedupe: true,
  scanCapBytes: 2 * 1024 * 1024,
  tokenLength: 10,
  createFindings: true,
  webhook: { enabled: false, url: "", format: "discord" },
  devMode: false,
};

export const UpdateConfigSchema = ResurfaceConfigSchema.partial().extend({
  webhook: WebhookConfigSchema.partial().optional(),
});

export type UpdateConfig = z.infer<typeof UpdateConfigSchema>;
