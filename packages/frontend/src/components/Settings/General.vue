<script setup lang="ts">
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import { computed } from "vue";

import ToggleRow from "./ToggleRow.vue";

import { useConfigStore } from "@/stores/config";

const store = useConfigStore();

const tokenLength = computed({
  get: () => store.config.tokenLength,
  set: (value: number) => void store.update({ tokenLength: value }),
});

const scanCapBytes = computed({
  get: () => store.config.scanCapBytes,
  set: (value: number) => void store.update({ scanCapBytes: value }),
});
</script>

<template>
  <Card :pt="{ body: { class: 'p-4' } }">
    <template #content>
      <div class="flex flex-col gap-5">
        <div>
          <h3 class="text-base font-semibold">General</h3>
          <p class="text-sm text-surface-400">
            Findings, logging, and canary generation.
          </p>
        </div>

        <ToggleRow
          label="Create findings"
          description="Add a Caido finding when a qualifying canary resurfaces."
          :model-value="store.config.createFindings"
          @update:model-value="(v) => store.update({ createFindings: v })"
        />
        <ToggleRow
          label="Dev mode"
          description="Verbose console logging for every scan decision."
          :model-value="store.config.devMode"
          @update:model-value="(v) => store.update({ devMode: v })"
        />

        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <label class="text-sm font-medium">Token length</label>
            <p class="text-sm text-surface-400">
              Random characters after the cnry0 prefix.
            </p>
          </div>
          <div class="w-48 shrink-0">
            <InputNumber
              v-model="tokenLength"
              :min="6"
              :max="64"
              :use-grouping="false"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="min-w-0 flex-1">
            <label class="text-sm font-medium">Scan cap (bytes)</label>
            <p class="text-sm text-surface-400">
              Maximum response body size scanned per message.
            </p>
          </div>
          <div class="w-48 shrink-0">
            <InputNumber
              v-model="scanCapBytes"
              :min="1024"
              :step="1024"
              :use-grouping="false"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
