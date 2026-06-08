<script setup lang="ts">
import ToggleSwitch from "primevue/toggleswitch";

defineProps<{
  label: string;
  description: string;
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

function onChange(value: boolean): void {
  emit("update:modelValue", value);
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="min-w-0 flex-1">
      <label class="text-sm font-medium">{{ label }}</label>
      <p class="text-sm text-surface-400">{{ description }}</p>
    </div>
    <div class="flex w-48 shrink-0 justify-end">
      <ToggleSwitch :model-value="modelValue" @update:model-value="onChange" />
    </div>
  </div>
</template>
