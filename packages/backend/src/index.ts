import type { SDK } from "caido:plugin";
import type { Spec } from "shared";

import {
  apiClearCanaries,
  apiDeleteCanary,
  apiGenerateCanary,
  apiGetCanaries,
  apiGetConfig,
  apiGetSightings,
  apiGetWatching,
  apiPromoteSighting,
  apiSetCanaryStatus,
  apiSetCanaryTags,
  apiSetWatching,
  apiTestWebhook,
  apiUpdateConfig,
} from "./api";
import { setSDK } from "./sdk";
import { registerScanner } from "./services/scanService";
import { canaryStore, configStore, sightingStore } from "./stores";

export function init(sdk: SDK<Spec>) {
  setSDK(sdk);

  sdk.api.register("getConfig", apiGetConfig);
  sdk.api.register("updateConfig", apiUpdateConfig);
  sdk.api.register("getWatching", apiGetWatching);
  sdk.api.register("setWatching", apiSetWatching);
  sdk.api.register("getCanaries", apiGetCanaries);
  sdk.api.register("generateCanary", apiGenerateCanary);
  sdk.api.register("setCanaryStatus", apiSetCanaryStatus);
  sdk.api.register("setCanaryTags", apiSetCanaryTags);
  sdk.api.register("deleteCanary", apiDeleteCanary);
  sdk.api.register("clearCanaries", apiClearCanaries);
  sdk.api.register("getSightings", apiGetSightings);
  sdk.api.register("promoteSighting", apiPromoteSighting);
  sdk.api.register("testWebhook", apiTestWebhook);

  registerScanner(sdk);

  sdk.events.onProjectChange(async (_sdk, project) => {
    const projectId = project?.getId();
    await canaryStore.switchProject(projectId);
    await sightingStore.switchProject(projectId);
    sdk.api.send("project:changed", projectId);
  });

  loadStores().catch((error) => {
    sdk.console.error(`Resurface store load failed: ${String(error)}`);
  });
}

async function loadStores(): Promise<void> {
  await configStore.initialize();
  await canaryStore.initialize();
  await sightingStore.initialize();
}
