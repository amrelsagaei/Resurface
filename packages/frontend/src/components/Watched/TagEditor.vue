<script setup lang="ts">
import { nextTick, ref } from "vue";

const props = defineProps<{
  tags: string[];
}>();

const emit = defineEmits<{
  update: [tags: string[]];
}>();

const draft = ref("");
const editing = ref(false);
const inputRef = ref<HTMLInputElement>();

async function startEdit(): Promise<void> {
  editing.value = true;
  await nextTick();
  inputRef.value?.focus();
}

function addTag(): void {
  const value = draft.value.trim();
  draft.value = "";
  editing.value = false;
  if (value === "" || props.tags.includes(value)) {
    return;
  }
  emit("update", [...props.tags, value]);
}

function cancel(): void {
  draft.value = "";
  editing.value = false;
}

function removeTag(tag: string): void {
  emit(
    "update",
    props.tags.filter((existing) => existing !== tag),
  );
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <span
      v-for="tag in tags"
      :key="tag"
      class="flex items-center gap-1 rounded bg-surface-700 px-1.5 py-0.5 text-xs text-surface-200"
    >
      {{ tag }}
      <button
        class="text-surface-400 hover:text-surface-100"
        @click="removeTag(tag)"
      >
        <i class="fas fa-times text-[10px]" />
      </button>
    </span>

    <input
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      class="w-20 rounded border border-surface-600 bg-surface-900 px-1.5 py-0.5 text-xs text-surface-200 outline-none"
      @keyup.enter="addTag"
      @keyup.escape="cancel"
      @blur="addTag"
    />
    <button
      v-else
      class="flex items-center gap-1 rounded border border-dashed border-surface-600 px-1.5 py-0.5 text-xs text-surface-400 transition-colors hover:text-surface-200"
      @click="startEdit"
    >
      <i class="fas fa-plus text-[10px]" />
      tag
    </button>
  </div>
</template>
