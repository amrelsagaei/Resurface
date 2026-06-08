import { Classic } from "@caido/primevue";
import { createPinia, type Pinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import { createApp } from "vue";

import { registerCommands } from "./commands";
import { Footer } from "./components/Footer";
import { mountNotifications } from "./components/Notifications/mount";
import { SDKPlugin } from "./plugins/sdk";
import { useCanariesStore } from "./stores/canaries";
import { useConfigStore } from "./stores/config";
import { useNotificationsService } from "./stores/notifications";
import { useWatchingStore } from "./stores/watching";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

const PAGE_PATH = "/resurface";

function bootstrapStores(sdk: FrontendSDK, pinia: Pinia): void {
  const config = useConfigStore(pinia);
  const watching = useWatchingStore(pinia);
  const canaries = useCanariesStore(pinia);
  const notifications = useNotificationsService(pinia);

  config.initialize(sdk);
  watching.initialize(sdk);
  canaries.initialize(sdk);
  notifications.initialize(sdk);

  void config.load();
  void watching.load();
  void canaries.load();
}

function setupSidebarBadge(sdk: FrontendSDK, root: HTMLElement): void {
  let count = 0;
  let onPage = false;

  const sidebarItem = sdk.sidebar.registerItem("Resurface", PAGE_PATH, {
    icon: "fas fa-binoculars",
  });
  const clear = (): void => {
    count = 0;
    sidebarItem.setCount(0);
  };

  sdk.navigation.addPage(PAGE_PATH, {
    body: root,
    onEnter: () => {
      onPage = true;
      clear();
    },
  });
  sdk.navigation.onPageChange((event) => {
    onPage = event.path === PAGE_PATH;
    if (onPage) {
      clear();
    }
  });
  const bump = (): void => {
    if (onPage) {
      return;
    }
    count += 1;
    sidebarItem.setCount(count);
  };
  sdk.backend.onEvent("canary:created", bump);
  sdk.backend.onEvent("sighting:detected", bump);
}

export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(PrimeVue, { unstyled: true, pt: Classic });
  app.use(ConfirmationService);
  app.use(SDKPlugin, sdk);

  const root = document.createElement("div");
  Object.assign(root.style, { height: "100%", width: "100%" });
  root.id = "plugin--resurface";
  app.mount(root);

  setupSidebarBadge(sdk, root);
  bootstrapStores(sdk, pinia);

  sdk.footer.addToSlot("footer-primary", {
    type: "Custom",
    definition: { component: Footer },
  });

  mountNotifications(sdk, pinia);
  registerCommands(sdk);
};
