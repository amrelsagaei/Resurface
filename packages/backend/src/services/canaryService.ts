import { type Canary } from "shared";

import { generateToken } from "../engine/token";
import { canaryStore, configStore } from "../stores";
import { newId } from "../util/ids";

export async function generateCanary(): Promise<Canary> {
  const token = generateToken(configStore.getConfig().tokenLength);
  return canaryStore.add({
    id: newId("k"),
    token,
    status: "active",
    tags: [],
    createdAt: Date.now(),
    sightingCount: 0,
  });
}
