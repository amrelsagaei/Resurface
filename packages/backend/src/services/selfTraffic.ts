import { type Request } from "caido:utils";
import { type ResurfaceConfig } from "shared";

function webhookHost(url: string): string | undefined {
  return /^https?:\/\/([^/:]+)/i.exec(url)?.[1];
}

export function isSelfTraffic(
  request: Request,
  config: ResurfaceConfig,
): boolean {
  if (!config.webhook.enabled || config.webhook.url === "") {
    return false;
  }
  const host = webhookHost(config.webhook.url);
  return host !== undefined && request.getHost() === host;
}
