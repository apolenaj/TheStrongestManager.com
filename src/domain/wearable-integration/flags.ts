/**
 * Feature-flag helpers for wearable live sync.
 * Architecture registry is visible when wearableIntegration is on;
 * per-provider live sync flags default off.
 */

import { featureFlags } from "@/config/feature-flags";
import type { WearableProviderId } from "@/domain/wearable-integration/constants";

const LIVE_FLAG_BY_PROVIDER: Record<
  WearableProviderId,
  () => boolean
> = {
  apple_health: () => featureFlags.wearableAppleHealth,
  google_health_connect: () => featureFlags.wearableGoogleHealthConnect,
  garmin: () => featureFlags.wearableGarmin,
  whoop: () => featureFlags.wearableWhoop,
  oura: () => featureFlags.wearableOura,
};

export function isWearableArchitectureEnabled(): boolean {
  return featureFlags.wearableIntegration;
}

/** Live sync path allowed for this vendor (credentials + adapter still required). */
export function isWearableLiveSyncEnabled(id: WearableProviderId): boolean {
  if (!featureFlags.wearableIntegration) return false;
  return LIVE_FLAG_BY_PROVIDER[id]();
}

/**
 * Whether the app may treat a connected adapter as live for reads.
 * Stubs are never live; connected + flag required.
 */
export function mayUseLiveWearableReads(
  adapter: { id: WearableProviderId; status: string },
): boolean {
  if (adapter.status !== "connected") return false;
  return isWearableLiveSyncEnabled(adapter.id);
}
