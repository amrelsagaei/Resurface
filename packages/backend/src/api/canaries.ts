import { type Canary, type CanaryStatus, err, ok, type Result } from "shared";

import { getErrorMessage } from "../errors";
import { generateCanary } from "../services/canaryService";
import { canaryStore } from "../stores";
import type { BackendSDK } from "../types";

export function apiGetCanaries(_sdk: BackendSDK): Result<Canary[]> {
  return ok(canaryStore.list());
}

export async function apiGenerateCanary(
  _sdk: BackendSDK,
): Promise<Result<Canary>> {
  try {
    return ok(await generateCanary());
  } catch (error) {
    return err(getErrorMessage(error));
  }
}

export async function apiSetCanaryStatus(
  _sdk: BackendSDK,
  canaryId: string,
  status: CanaryStatus,
): Promise<Result<Canary>> {
  try {
    return ok(await canaryStore.setStatus(canaryId, status));
  } catch (error) {
    return err(getErrorMessage(error));
  }
}

export async function apiSetCanaryTags(
  _sdk: BackendSDK,
  canaryId: string,
  tags: string[],
): Promise<Result<Canary>> {
  try {
    return ok(await canaryStore.setTags(canaryId, tags));
  } catch (error) {
    return err(getErrorMessage(error));
  }
}

export async function apiDeleteCanary(
  _sdk: BackendSDK,
  canaryId: string,
): Promise<Result<void>> {
  try {
    await canaryStore.delete(canaryId);
    return ok(undefined);
  } catch (error) {
    return err(getErrorMessage(error));
  }
}

export async function apiClearCanaries(
  _sdk: BackendSDK,
): Promise<Result<void>> {
  try {
    await canaryStore.clear();
    return ok(undefined);
  } catch (error) {
    return err(getErrorMessage(error));
  }
}
