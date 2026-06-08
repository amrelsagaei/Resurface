import { type Request } from "caido:utils";
import { type Canary, type Sighting } from "shared";

import { getErrorMessage } from "../errors";
import { configStore } from "../stores";

import { createFinding } from "./findingService";
import { devLog } from "./logger";
import { sendSightingWebhook } from "./webhookService";

export async function onNewSighting(
  sighting: Sighting,
  canary: Canary,
  request: Request,
): Promise<void> {
  const config = configStore.getConfig();
  devLog(
    `sighting ${sighting.token} ${sighting.contextType} at ${sighting.endpoint.host}${sighting.endpoint.path}`,
  );

  if (config.createFindings) {
    try {
      await createFinding(sighting, canary, request);
    } catch (error) {
      devLog(`finding failed: ${getErrorMessage(error)}`);
    }
  }

  if (config.webhook.enabled) {
    try {
      await sendSightingWebhook(sighting, canary, config);
    } catch (error) {
      devLog(`webhook failed: ${getErrorMessage(error)}`);
    }
  }
}
