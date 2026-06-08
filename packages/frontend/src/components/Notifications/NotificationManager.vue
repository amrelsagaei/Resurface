<script setup lang="ts">
import SightingToast from "./SightingToast.vue";

import { useSDK } from "@/plugins/sdk";
import { useNotificationsService } from "@/stores/notifications";

const sdk = useSDK();
const store = useNotificationsService();

function onDismiss(id: string): void {
  store.dismiss(id);
}

function onOpen(): void {
  sdk.navigation.goTo("/resurface");
}
</script>

<template>
  <div
    class="pointer-events-none fixed right-4 top-4 z-[99999] flex flex-col gap-2"
  >
    <SightingToast
      v-for="toast in store.toasts"
      :key="toast.id"
      :toast="toast"
      @dismiss="onDismiss"
      @open="onOpen"
    />
  </div>
</template>
