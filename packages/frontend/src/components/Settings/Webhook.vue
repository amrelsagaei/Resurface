<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import { type WebhookFormat } from "shared";
import { computed, ref } from "vue";

import ToggleRow from "./ToggleRow.vue";

import { useConfigStore } from "@/stores/config";

const store = useConfigStore();
const testing = ref(false);

const formatOptions = [
  { label: "Discord", value: "discord" },
  { label: "Slack", value: "slack" },
  { label: "Generic", value: "generic" },
];

const placeholders: Record<WebhookFormat, string> = {
  discord: "https://discord.com/api/webhooks/...",
  slack: "https://hooks.slack.com/services/...",
  generic: "https://example.com/webhook",
};

const url = computed({
  get: () => store.config.webhook.url,
  set: (value: string) => void store.update({ webhook: { url: value } }),
});

const format = computed({
  get: () => store.config.webhook.format,
  set: (value: WebhookFormat) =>
    void store.update({ webhook: { format: value } }),
});

const placeholder = computed(() => placeholders[store.config.webhook.format]);

async function sendTest(): Promise<void> {
  testing.value = true;
  await store.testWebhook();
  testing.value = false;
}
</script>

<template>
  <Card :pt="{ body: { class: 'p-4' } }">
    <template #content>
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="text-base font-semibold text-surface-100">Webhook</h3>
          <p class="text-sm text-surface-400">
            Send a message when a qualifying canary resurfaces.
          </p>
        </div>

        <ToggleRow
          label="Enable webhook"
          description="POST a message when a qualifying canary resurfaces."
          :model-value="store.config.webhook.enabled"
          @update:model-value="(v) => store.update({ webhook: { enabled: v } })"
        />

        <div class="flex flex-col gap-2 text-sm">
          <span class="text-surface-400">Format</span>
          <SelectButton
            v-model="format"
            :options="formatOptions"
            option-label="label"
            option-value="value"
            :allow-empty="false"
          />
        </div>

        <div class="flex flex-col gap-2 text-sm">
          <span class="text-surface-400">Webhook URL</span>
          <div class="flex items-center gap-2">
            <InputText
              v-model="url"
              :placeholder="placeholder"
              class="flex-1"
            />
            <Button
              label="Send test"
              icon="fas fa-paper-plane"
              :loading="testing"
              :disabled="!store.config.webhook.enabled"
              @click="sendTest"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
