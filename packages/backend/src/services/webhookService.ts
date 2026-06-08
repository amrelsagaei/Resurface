import { Blob, fetch } from "caido:http";
import { type Canary, type ResurfaceConfig, type Sighting } from "shared";

import { buildWriteup, type Writeup } from "../engine/template";

import { formatPayload } from "./webhookFormats";

async function postJson(url: string, payload: unknown): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: new Blob([JSON.stringify(payload)], { type: "application/json" }),
  });
  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }
}

export async function sendSightingWebhook(
  sighting: Sighting,
  canary: Canary,
  config: ResurfaceConfig,
): Promise<void> {
  if (!config.webhook.enabled || config.webhook.url === "") {
    return;
  }
  const payload = formatPayload(
    config.webhook.format,
    buildWriteup(sighting, canary),
  );
  await postJson(config.webhook.url, payload);
}

export async function sendTestWebhook(config: ResurfaceConfig): Promise<void> {
  if (config.webhook.url === "") {
    throw new Error("No webhook URL configured");
  }
  const writeup: Writeup = {
    title: "Resurface test",
    description: "Your Resurface webhook is configured correctly.",
  };
  await postJson(
    config.webhook.url,
    formatPayload(config.webhook.format, writeup),
  );
}
