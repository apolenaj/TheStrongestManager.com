import {
  buildWearableIntegrationSnapshot,
  type WearableIntegrationSnapshot,
} from "@/domain/wearable-integration";

export function getWearableIntegrationSnapshot(): WearableIntegrationSnapshot {
  return buildWearableIntegrationSnapshot();
}
