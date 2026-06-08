import { z } from "zod";

export const CANARY_STATUSES = ["active", "muted", "archived"] as const;
export const CanaryStatusSchema = z.enum(CANARY_STATUSES);
export type CanaryStatus = z.infer<typeof CanaryStatusSchema>;

export const CONTEXT_TYPES = [
  "html-text",
  "html-attr",
  "script",
  "json-string",
  "url",
  "header",
  "raw",
] as const;
export const ContextTypeSchema = z.enum(CONTEXT_TYPES);
export type ContextType = z.infer<typeof ContextTypeSchema>;

export const MATCH_SOURCES = [
  "response-body",
  "response-header",
  "request-body",
  "request-header",
  "url",
] as const;
export const MatchSourceSchema = z.enum(MATCH_SOURCES);
export type MatchSource = z.infer<typeof MatchSourceSchema>;

export const TRANSFORMS = [
  "raw",
  "uppercase",
  "lowercase",
  "url-encoded",
  "truncated",
] as const;
export const TransformSchema = z.enum(TRANSFORMS);
export type Transform = z.infer<typeof TransformSchema>;

export const WEBHOOK_FORMATS = ["discord", "slack", "generic"] as const;
export const WebhookFormatSchema = z.enum(WEBHOOK_FORMATS);
export type WebhookFormat = z.infer<typeof WebhookFormatSchema>;
