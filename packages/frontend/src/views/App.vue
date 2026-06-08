<script setup lang="ts">
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import MenuBar from "primevue/menubar";
import { computed, ref } from "vue";

import { Settings } from "@/components/Settings";
import { Watched } from "@/components/Watched";

type Page = "Watched" | "Settings";

const page = ref<Page>("Watched");

const navItems = [
  {
    label: "Watched",
    isActive: () => page.value === "Watched",
    command: () => {
      page.value = "Watched";
    },
  },
  {
    label: "Settings",
    isActive: () => page.value === "Settings",
    command: () => {
      page.value = "Settings";
    },
  },
];

const component = computed(() =>
  page.value === "Watched" ? Watched : Settings,
);

const handleLabel = (
  label: string | ((...args: unknown[]) => string) | undefined,
): string | undefined => (typeof label === "function" ? label() : label);
</script>

<template>
  <div class="flex h-full flex-col gap-1">
    <ConfirmDialog />
    <MenuBar :model="navItems" class="h-12 gap-2">
      <template #start>
        <div class="px-2 font-bold">Resurface</div>
      </template>

      <template #item="{ item }">
        <Button
          :severity="item.isActive?.() ? 'secondary' : 'contrast'"
          :outlined="item.isActive?.()"
          size="small"
          :text="!item.isActive?.()"
          :label="handleLabel(item.label)"
          @click="item.command?.()"
        />
      </template>
    </MenuBar>

    <div class="min-h-0 flex-1">
      <KeepAlive>
        <component :is="component" />
      </KeepAlive>
    </div>
  </div>
</template>
