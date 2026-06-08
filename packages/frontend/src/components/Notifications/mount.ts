import type { Pinia } from "pinia";
import { createApp } from "vue";

import NotificationManager from "./NotificationManager.vue";

import { SDKPlugin } from "@/plugins/sdk";
import type { FrontendSDK } from "@/types";

export function mountNotifications(sdk: FrontendSDK, pinia: Pinia): void {
  const container = document.createElement("div");
  container.id = "resurface-notifications";
  document.body.appendChild(container);

  const app = createApp(NotificationManager);
  app.use(SDKPlugin, sdk);
  app.use(pinia);
  app.mount(container);
}
