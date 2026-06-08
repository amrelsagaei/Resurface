import { err, ok, type Result, type Sighting } from "shared";

import { getErrorMessage } from "../errors";
import { requireSDK } from "../sdk";
import { createFinding } from "../services/findingService";
import { canaryStore, sightingStore } from "../stores";
import type { BackendSDK } from "../types";

export function apiGetSightings(
  _sdk: BackendSDK,
  canaryId?: string,
): Result<Sighting[]> {
  return ok(sightingStore.list(canaryId));
}

export async function apiPromoteSighting(
  _sdk: BackendSDK,
  sightingId: string,
): Promise<Result<void>> {
  const sighting = sightingStore.get(sightingId);
  if (sighting === undefined) {
    return err("Sighting not found");
  }
  const canary = canaryStore.get(sighting.canaryId);
  if (canary === undefined) {
    return err("Canary not found");
  }
  if (sighting.requestId === undefined) {
    return err("No request associated with this sighting");
  }

  try {
    const pair = await requireSDK().requests.get(sighting.requestId);
    if (pair === undefined) {
      return err("Request no longer available");
    }
    await createFinding(sighting, canary, pair.request);
    await sightingStore.markPromoted(sightingId);
    return ok(undefined);
  } catch (error) {
    return err(getErrorMessage(error));
  }
}
