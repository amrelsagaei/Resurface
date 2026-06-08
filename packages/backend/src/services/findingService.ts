import { type Request } from "caido:utils";
import { type Canary, type Sighting } from "shared";

import { buildWriteup } from "../engine/template";
import { requireSDK } from "../sdk";

function dedupeKey(sighting: Sighting): string {
  return `resurface:${sighting.canaryId}:${sighting.endpoint.host}${sighting.endpoint.path}:${sighting.contextType}`;
}

export async function createFinding(
  sighting: Sighting,
  canary: Canary,
  request: Request,
): Promise<void> {
  const { title, description } = buildWriteup(sighting, canary);
  await requireSDK().findings.create({
    title,
    description,
    reporter: "Resurface",
    dedupeKey: dedupeKey(sighting),
    request,
  });
}
