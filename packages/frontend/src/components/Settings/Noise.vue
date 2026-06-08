<script setup lang="ts">
import Card from "primevue/card";

import ToggleRow from "./ToggleRow.vue";

import { useConfigStore } from "@/stores/config";

const store = useConfigStore();
</script>

<template>
  <Card :pt="{ body: { class: 'p-4' } }">
    <template #content>
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="text-base font-semibold">Noise control</h3>
          <p class="text-sm text-surface-400">
            Control what traffic is scanned and how repeats are handled.
          </p>
        </div>

        <ToggleRow
          label="In-scope only"
          description="Only scan traffic inside the project scope."
          :model-value="store.config.scopeOnly"
          @update:model-value="(v) => store.update({ scopeOnly: v })"
        />
        <ToggleRow
          label="Skip non-text bodies"
          description="Never scan images, fonts, or other binary content."
          :model-value="store.config.skipNonText"
          @update:model-value="(v) => store.update({ skipNonText: v })"
        />
        <ToggleRow
          label="Collapse duplicate sightings"
          description="Merge repeat sightings into one row with a seen-count."
          :model-value="store.config.dedupe"
          @update:model-value="(v) => store.update({ dedupe: v })"
        />
      </div>
    </template>
  </Card>
</template>
