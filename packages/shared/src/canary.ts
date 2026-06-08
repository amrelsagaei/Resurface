import { z } from "zod";

import { CanaryStatusSchema } from "./enums";

export const CanarySchema = z.object({
  id: z.string(),
  token: z.string(),
  status: CanaryStatusSchema,
  tags: z.array(z.string()),
  createdAt: z.number(),
  sightingCount: z.number(),
  lastSeenAt: z.number().optional(),
});

export type Canary = z.infer<typeof CanarySchema>;
