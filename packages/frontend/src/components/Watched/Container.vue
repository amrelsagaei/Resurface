<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Tag from "primevue/tag";
import { useConfirm } from "primevue/useconfirm";
import { type Canary } from "shared";
import { onBeforeUnmount, ref } from "vue";

import TagEditor from "./TagEditor.vue";

import { useCanariesStore } from "@/stores/canaries";
import { formatAge } from "@/utils/format";

const store = useCanariesStore();
const confirm = useConfirm();

const now = ref(Date.now());
const ticker = setInterval(() => {
  now.value = Date.now();
}, 1000);
onBeforeUnmount(() => clearInterval(ticker));

function row(data: unknown): Canary {
  return data as Canary;
}

function statusSeverity(status: Canary["status"]): string {
  if (status === "active") {
    return "success";
  }
  return status === "muted" ? "warn" : "secondary";
}

function onClearAll(): void {
  confirm.require({
    message:
      "This deletes all canaries and their sightings. This action cannot be undone.",
    header: "Clear all canaries",
    icon: "fas fa-exclamation-triangle",
    acceptLabel: "Delete all",
    rejectLabel: "Cancel",
    accept: () => {
      void store.clear();
    },
  });
}
</script>

<template>
  <Card
    class="h-full"
    :pt="{
      body: { class: 'h-full p-0' },
      content: { class: 'h-full flex flex-col min-h-0' },
    }"
  >
    <template #content>
      <div
        class="flex items-center justify-between gap-4 border-b border-surface-700 px-4 py-3"
      >
        <div>
          <h3 class="text-lg font-semibold">Canaries</h3>
          <p class="text-sm text-surface-400">
            Generate a canary, paste it anywhere, and watch for it to resurface.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            label="Generate canary"
            icon="fas fa-plus"
            size="small"
            @click="store.generate()"
          />
          <Button
            label="Clear all"
            icon="fas fa-trash"
            severity="danger"
            size="small"
            :disabled="store.canaries.length === 0"
            @click="onClearAll"
          />
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-auto">
        <div
          v-if="store.canaries.length === 0"
          class="flex h-full items-center justify-center p-6 text-center text-surface-500"
        >
          No canaries yet. Click "Generate canary" (or use the command palette),
          then paste the token wherever you want to track it.
        </div>
        <DataTable
          v-else
          :value="store.canaries"
          striped-rows
          size="small"
          data-key="id"
          :pt="{ table: { class: 'w-full table-fixed' } }"
        >
          <Column header="Token" style="width: 24rem">
            <template #body="{ data }">
              <span class="break-all font-mono text-xs text-primary-400">
                {{ row(data).token }}
              </span>
            </template>
          </Column>
          <Column header="Tags">
            <template #body="{ data }">
              <TagEditor
                :tags="row(data).tags"
                @update="(tags) => store.setTags(row(data).id, tags)"
              />
            </template>
          </Column>
          <Column header="Age" style="width: 5rem">
            <template #body="{ data }">
              <span class="text-xs text-surface-400">
                {{ formatAge(row(data).createdAt, now) }}
              </span>
            </template>
          </Column>
          <Column
            header="Sightings"
            field="sightingCount"
            style="width: 6rem"
          />
          <Column header="Status" style="width: 7rem">
            <template #body="{ data }">
              <Tag
                :value="row(data).status"
                :severity="statusSeverity(row(data).status)"
              />
            </template>
          </Column>
          <Column style="width: 9rem">
            <template #body="{ data }">
              <div class="flex justify-end gap-1">
                <Button
                  icon="fas fa-copy"
                  severity="contrast"
                  text
                  size="small"
                  title="Copy token"
                  @click="store.copyToken(row(data).token)"
                />
                <Button
                  :icon="
                    row(data).status === 'muted'
                      ? 'fas fa-bell'
                      : 'fas fa-bell-slash'
                  "
                  severity="contrast"
                  text
                  size="small"
                  :title="row(data).status === 'muted' ? 'Unmute' : 'Mute'"
                  @click="
                    store.setStatus(
                      row(data).id,
                      row(data).status === 'muted' ? 'active' : 'muted',
                    )
                  "
                />
                <Button
                  icon="fas fa-box-archive"
                  severity="contrast"
                  text
                  size="small"
                  title="Archive"
                  @click="store.setStatus(row(data).id, 'archived')"
                />
                <Button
                  icon="fas fa-trash"
                  severity="danger"
                  text
                  size="small"
                  title="Delete"
                  @click="store.remove(row(data).id)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </Card>
</template>
