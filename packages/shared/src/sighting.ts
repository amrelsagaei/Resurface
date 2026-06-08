import { z } from "zod";

import { EndpointRefSchema } from "./endpoint";
import { ContextTypeSchema, MatchSourceSchema, TransformSchema } from "./enums";

export const SightingSchema = z.object({
  id: z.string(),
  canaryId: z.string(),
  token: z.string(),
  source: MatchSourceSchema,
  contextType: ContextTypeSchema,
  transform: TransformSchema,
  endpoint: EndpointRefSchema,
  requestId: z.string().optional(),
  snippet: z.string(),
  seenCount: z.number(),
  firstSeenAt: z.number(),
  lastSeenAt: z.number(),
  timeSincePlantMs: z.number(),
  capHit: z.boolean(),
  promoted: z.boolean(),
});

export type Sighting = z.infer<typeof SightingSchema>;
