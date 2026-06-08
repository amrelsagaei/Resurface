<script setup lang="ts">
import { storeToRefs } from "pinia";
import ToggleSwitch from "primevue/toggleswitch";
import { computed } from "vue";

import { useCanariesStore } from "@/stores/canaries";
import { useWatchingStore } from "@/stores/watching";

const watchingStore = useWatchingStore();
const canariesStore = useCanariesStore();
const { watching } = storeToRefs(watchingStore);
const { canaries } = storeToRefs(canariesStore);

const sightings = computed(() =>
  canaries.value.reduce((total, canary) => total + canary.sightingCount, 0),
);

function setWatch(value: boolean): void {
  void watchingStore.set(value);
}
</script>

<template>
  <div class="flex min-w-[190px] flex-col gap-2 p-1">
    <div class="flex items-center justify-between gap-4">
      <span class="text-sm font-medium text-surface-200">Watch traffic</span>
      <ToggleSwitch :model-value="watching" @update:model-value="setWatch" />
    </div>
    <div class="text-xs text-surface-400">
      {{ canaries.length }} canaries / {{ sightings }} sightings
    </div>
  </div>
</template>
