import { err, ok, type Result } from "shared";

import { getErrorMessage } from "../errors";
import { sendTestWebhook } from "../services/webhookService";
import { configStore } from "../stores";
import type { BackendSDK } from "../types";

export async function apiTestWebhook(_sdk: BackendSDK): Promise<Result<void>> {
  try {
    await sendTestWebhook(configStore.getConfig());
    return ok(undefined);
  } catch (error) {
    return err(getErrorMessage(error));
  }
}
