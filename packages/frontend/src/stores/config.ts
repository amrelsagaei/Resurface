import { defineStore } from "pinia";
import {
  DEFAULT_CONFIG,
  type ResurfaceConfig,
  type UpdateConfig,
} from "shared";
import { ref } from "vue";

import type { FrontendSDK } from "@/types";

export const useConfigStore = defineStore("resurface.config", () => {
  const sdk = ref<FrontendSDK>();
  const config = ref<ResurfaceConfig>({ ...DEFAULT_CONFIG });

  async function load(): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.getConfig();
    if (result.kind === "Ok") {
      config.value = result.value;
    } else {
      sdk.value.window.showToast(result.error, { variant: "error" });
    }
  }

  async function update(updates: UpdateConfig): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.updateConfig(updates);
    if (result.kind === "Ok") {
      config.value = result.value;
    } else {
      sdk.value.window.showToast(result.error, { variant: "error" });
    }
  }

  async function testWebhook(): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.testWebhook();
    if (result.kind === "Ok") {
      sdk.value.window.showToast("Webhook sent", { variant: "success" });
    } else {
      sdk.value.window.showToast(result.error, { variant: "error" });
    }
  }

  function initialize(frontendSdk: FrontendSDK): void {
    sdk.value = frontendSdk;
    frontendSdk.backend.onEvent("config:updated", (next) => {
      config.value = next;
    });
  }

  return { config, initialize, load, update, testWebhook };
});
