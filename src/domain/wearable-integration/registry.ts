/**
 * Wearable provider registry (Prompt 185).
 * Real adapters register here when credentials + native/API clients exist.
 */

import { createDefaultWearableStubs } from "@/domain/wearable-integration/stubs";
import type { WearableProviderAdapter } from "@/domain/wearable-integration/types";
import type { WearableProviderId } from "@/domain/wearable-integration/constants";

const registry: WearableProviderAdapter[] = createDefaultWearableStubs();

export function listWearableProviders(): WearableProviderAdapter[] {
  return [...registry];
}

export function getWearableProvider(
  id: WearableProviderId,
): WearableProviderAdapter | undefined {
  return registry.find((a) => a.id === id);
}

/**
 * Prefer a real connected adapter; otherwise null (no fake “active device”).
 */
export function getConnectedWearableProvider(): WearableProviderAdapter | null {
  return registry.find((a) => a.status === "connected") ?? null;
}

/**
 * Register a real adapter (tests or future live wiring).
 * Replaces the stub with the same id.
 */
export function registerWearableProvider(
  adapter: WearableProviderAdapter,
): void {
  const idx = registry.findIndex((a) => a.id === adapter.id);
  if (idx >= 0) {
    registry[idx] = adapter;
    return;
  }
  registry.push(adapter);
}

/** Reset to not_configured stubs (tests). */
export function resetWearableProvidersForTests(): void {
  registry.length = 0;
  registry.push(...createDefaultWearableStubs());
}
