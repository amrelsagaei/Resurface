import { z } from "zod";

export const EndpointRefSchema = z.object({
  host: z.string(),
  port: z.number(),
  tls: z.boolean(),
  method: z.string(),
  path: z.string(),
});

export type EndpointRef = z.infer<typeof EndpointRefSchema>;
