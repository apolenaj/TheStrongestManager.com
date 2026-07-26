/**
 * Stub adapters for each planned wearable vendor.
 * Status is always not_configured — no fake connections.
 */

import {
  WEARABLE_PROVIDER_IDS,
  WEARABLE_PROVIDER_LABELS,
  WEARABLE_PROVIDER_PLANNED_KINDS,
  WEARABLE_PROVIDER_PLATFORMS,
  type WearableProviderId,
} from "@/domain/wearable-integration/constants";
import type { WearableProviderAdapter } from "@/domain/wearable-integration/types";

export function createNotConfiguredWearableAdapter(
  id: WearableProviderId,
): WearableProviderAdapter {
  return {
    id,
    label: WEARABLE_PROVIDER_LABELS[id],
    status: "not_configured",
    platforms: WEARABLE_PROVIDER_PLATFORMS[id],
    supportedDataKinds: WEARABLE_PROVIDER_PLANNED_KINDS[id],
    async getConnection({ athleteProfileId }) {
      return {
        athleteProfileId,
        providerId: id,
        status: "not_configured",
        externalAccountLabel: null,
        lastSyncAt: null,
        lastError: null,
      };
    },
    async fetchSamples() {
      return [];
    },
  };
}

/** All five planned providers as honest stubs. */
export function createDefaultWearableStubs(): WearableProviderAdapter[] {
  return WEARABLE_PROVIDER_IDS.map(createNotConfiguredWearableAdapter);
}
