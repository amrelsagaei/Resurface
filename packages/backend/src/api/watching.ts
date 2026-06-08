import { err, ok, type Result } from "shared";

import { getErrorMessage } from "../errors";
import { configStore } from "../stores";
import type { BackendSDK } from "../types";

export function apiGetWatching(_sdk: BackendSDK): Result<boolean> {
  return ok(configStore.isWatching());
}

export async function apiSetWatching(
  _sdk: BackendSDK,
  watching: boolean,
): Promise<Result<boolean>> {
  try {
    return ok(await configStore.setWatching(watching));
  } catch (error) {
    return err(getErrorMessage(error));
  }
}
