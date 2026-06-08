import {
  err,
  ok,
  type Result,
  type ResurfaceConfig,
  type UpdateConfig,
} from "shared";

import { getErrorMessage } from "../errors";
import { configStore } from "../stores";
import type { BackendSDK } from "../types";

export function apiGetConfig(_sdk: BackendSDK): Result<ResurfaceConfig> {
  return ok(configStore.getConfig());
}

export async function apiUpdateConfig(
  _sdk: BackendSDK,
  updates: UpdateConfig,
): Promise<Result<ResurfaceConfig>> {
  try {
    return ok(await configStore.updateConfig(updates));
  } catch (error) {
    return err(getErrorMessage(error));
  }
}
