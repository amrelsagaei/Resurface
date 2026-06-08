import { defineStore } from "pinia";
import { type Canary, type CanaryStatus } from "shared";
import { ref } from "vue";

import type { FrontendSDK } from "@/types";

export const useCanariesStore = defineStore("resurface.canaries", () => {
  const sdk = ref<FrontendSDK>();
  const canaries = ref<Canary[]>([]);

  async function load(): Promise<void> {
    if (sdk.value === undefined) {
      return;
    }
    const result = await sdk.value.backend.getCanaries();
    if (result.kind === "Ok") {
      canaries.value = result.value;
    } else {
      fail(result.error);
    }
  }

  function fail(error: string): void {
    sdk.value?.window.showToast(error, { variant: "error" });
  }

  async function setStatus(id: string, status: CanaryStatus): Promise<void> {
    const result = await sdk.value?.backend.setCanaryStatus(id, status);
    if (result?.kind === "Error") {
      fail(result.error);
    }
  }

  async function setTags(id: string, tags: string[]): Promise<void> {
    const result = await sdk.value?.backend.setCanaryTags(id, tags);
    if (result?.kind === "Error") {
      fail(result.error);
    }
  }

  async function remove(id: string): Promise<void> {
    const result = await sdk.value?.backend.deleteCanary(id);
    if (result?.kind === "Error") {
      fail(result.error);
    }
  }

  async function clear(): Promise<void> {
    const result = await sdk.value?.backend.clearCanaries();
    if (result?.kind === "Error") {
      fail(result.error);
    }
  }

  async function copyToken(token: string): Promise<void> {
    await navigator.clipboard.writeText(token);
    sdk.value?.window.showToast("Token copied", { variant: "success" });
  }

  async function generate(): Promise<void> {
    const result = await sdk.value?.backend.generateCanary();
    if (result?.kind === "Ok") {
      await navigator.clipboard.writeText(result.value.token);
      sdk.value?.window.showToast(`Canary copied: ${result.value.token}`, {
        variant: "success",
      });
    } else if (result?.kind === "Error") {
      fail(result.error);
    }
  }

  function initialize(frontendSdk: FrontendSDK): void {
    sdk.value = frontendSdk;
    const reload = (): void => {
      void load();
    };
    frontendSdk.backend.onEvent("canary:created", reload);
    frontendSdk.backend.onEvent("canary:updated", reload);
    frontendSdk.backend.onEvent("canary:deleted", reload);
    frontendSdk.backend.onEvent("canaries:cleared", reload);
    frontendSdk.backend.onEvent("project:changed", reload);
  }

  return {
    canaries,
    initialize,
    load,
    setStatus,
    setTags,
    remove,
    clear,
    copyToken,
    generate,
  };
});
