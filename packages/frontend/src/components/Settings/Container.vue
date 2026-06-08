<script setup lang="ts">
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import { ref } from "vue";

import General from "./General.vue";
import Noise from "./Noise.vue";
import Webhook from "./Webhook.vue";

type Tab = "general" | "webhook";

const tab = ref<Tab>("general");
const tabs = [
  { label: "General", value: "general" },
  { label: "Webhook", value: "webhook" },
];
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-1">
    <Card
      class="shrink-0"
      :pt="{ body: { class: 'p-0' }, content: { class: 'p-0' } }"
    >
      <template #content>
        <div class="px-4 py-3">
          <h3 class="text-lg font-semibold">Settings</h3>
          <p class="text-sm text-surface-400">
            Configure how Resurface behaves.
          </p>
        </div>
      </template>
    </Card>

    <Card
      class="shrink-0"
      :pt="{ body: { class: 'p-0' }, content: { class: 'p-0' } }"
    >
      <template #content>
        <div class="px-2 py-1">
          <SelectButton
            v-model="tab"
            :options="tabs"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>
      </template>
    </Card>

    <div class="flex min-h-0 flex-1 flex-col gap-1 overflow-auto">
      <template v-if="tab === 'general'">
        <General />
        <Noise />
      </template>
      <Webhook v-else />
    </div>
  </div>
</template>
