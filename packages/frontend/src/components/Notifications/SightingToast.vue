<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { type SightingToast } from "@/stores/notifications";

const props = defineProps<{
  toast: SightingToast;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
  open: [];
}>();

const AUTO_DISMISS_MS = 9000;
const TICK_MS = 50;

const visible = ref(false);
const progress = ref(100);
const isHovered = ref(false);

let timerId: ReturnType<typeof setInterval> | undefined;
let elapsed = 0;

function close(): void {
  if (timerId !== undefined) {
    clearInterval(timerId);
  }
  visible.value = false;
  setTimeout(() => emit("dismiss", props.toast.id), 200);
}

function open(): void {
  emit("open");
  close();
}

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
  timerId = setInterval(() => {
    if (isHovered.value) {
      return;
    }
    elapsed += TICK_MS;
    progress.value = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100);
    if (elapsed >= AUTO_DISMISS_MS) {
      close();
    }
  }, TICK_MS);
});

onUnmounted(() => {
  if (timerId !== undefined) {
    clearInterval(timerId);
  }
});
</script>

<template>
  <div
    class="pointer-events-auto w-[300px] overflow-hidden rounded-[10px] border border-surface-600 bg-surface-800 shadow-2xl"
    :style="{
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? '1' : '0',
      transition:
        'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="flex items-center justify-between px-3.5 pt-2.5">
      <div
        class="flex items-center gap-2 text-[13px] font-semibold text-surface-100"
      >
        <i class="fas fa-binoculars text-primary-500" />
        <span>Canary resurfaced</span>
      </div>
      <button
        class="cursor-pointer border-none bg-transparent p-1 text-xs leading-none text-surface-500 transition-colors hover:text-surface-200"
        @click="close"
      >
        <i class="fas fa-times" />
      </button>
    </div>

    <button
      class="block w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left"
      @click="open"
    >
      <div class="mb-1.5 truncate text-[13px] text-surface-200">
        {{ toast.endpoint }}
      </div>
      <div class="flex flex-wrap items-center gap-1.5 text-xs text-surface-400">
        <span class="rounded bg-surface-900 px-1.5 py-0.5 text-surface-300">
          {{ toast.contextType }}
        </span>
        <span
          v-if="toast.capHit"
          class="rounded bg-surface-900 px-1.5 py-0.5 text-warning-400"
        >
          cap hit
        </span>
      </div>
    </button>

    <div class="h-0.5 bg-surface-900">
      <div
        class="h-full bg-primary-500"
        :style="{ width: `${progress}%`, transition: 'width 0.05s linear' }"
      />
    </div>
  </div>
</template>
