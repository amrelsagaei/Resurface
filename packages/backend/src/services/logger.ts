import { requireSDK } from "../sdk";
import { configStore } from "../stores";

export function devLog(message: string): void {
  if (configStore.getConfig().devMode) {
    requireSDK().console.log(`[Resurface] ${message}`);
  }
}
