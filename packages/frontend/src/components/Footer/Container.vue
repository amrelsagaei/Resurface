<script setup lang="ts">
import { storeToRefs } from "pinia";
import Popover from "primevue/popover";
import { ref } from "vue";

import StatusPopover from "./StatusPopover.vue";

import { useWatchingStore } from "@/stores/watching";

const store = useWatchingStore();
const { watching } = storeToRefs(store);

const popoverRef = ref();

function togglePopover(event: MouseEvent): void {
  popoverRef.value?.toggle(event);
}
</script>

<template>
  <button
    class="flex items-center gap-1.5 rounded px-2 py-1 transition-colors hover:bg-surface-700"
    title="Resurface"
    @click="togglePopover"
  >
    <i
      class="fas fa-binoculars text-sm"
      :class="watching ? 'text-success-400' : 'text-surface-400'"
    />
    <span class="text-sm text-surface-300">Resurface</span>
  </button>

  <Popover ref="popoverRef">
    <StatusPopover />
  </Popover>
</template>
