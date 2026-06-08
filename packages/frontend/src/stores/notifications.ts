import { defineStore } from "pinia";
import { type ContextType } from "shared";
import { ref } from "vue";

import type { FrontendSDK } from "@/types";

export type SightingToast = {
  id: string;
  endpoint: string;
  contextType: ContextType;
  token: string;
  capHit: boolean;
};

const MAX_TOASTS = 5;

export const useNotificationsService = defineStore(
  "resurface.notifications",
  () => {
    const toasts = ref<SightingToast[]>([]);

    function dismiss(id: string): void {
      toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }

    function initialize(sdk: FrontendSDK): void {
      sdk.backend.onEvent("sighting:detected", (sighting) => {
        toasts.value = [
          ...toasts.value,
          {
            id: sighting.id,
            endpoint: `${sighting.endpoint.host}${sighting.endpoint.path}`,
            contextType: sighting.contextType,
            token: sighting.token,
            capHit: sighting.capHit,
          },
        ].slice(-MAX_TOASTS);
      });
    }

    return { toasts, dismiss, initialize };
  },
);
