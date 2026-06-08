import { defineStore } from "pinia";
import { ref } from "vue";

import type { FrontendSDK } from "@/types";

export const useWatchingStore = defineStore("resurface.watching", () => {
  const sdk = ref<FrontendSDK>();
  const watching = ref(true);

  async function load(): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.getWatching();
    if (result.kind === "Ok") {
      watching.value = result.value;
    } else {
      sdk.value.window.showToast(result.error, { variant: "error" });
    }
  }

  async function set(value: boolean): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.setWatching(value);
    if (result.kind === "Ok") {
      watching.value = result.value;
    } else {
      sdk.value.window.showToast(result.error, { variant: "error" });
    }
  }

  function initialize(frontendSdk: FrontendSDK): void {
    sdk.value = frontendSdk;
    frontendSdk.backend.onEvent("watching:changed", (value) => {
      watching.value = value;
    });
  }

  return { watching, initialize, load, set };
});
