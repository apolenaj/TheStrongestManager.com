/**
 * Nutrition provider abstraction (Prompt 31).
 * Mealnexio plugs in here when a real API exists. Do not assume the API exists today.
 */

import {
  NUTRITION_SHARED_DATA_KINDS,
  type NutritionConnectionStatus,
  type NutritionDailySummary,
  type NutritionDailyTargets,
  type NutritionProviderConnection,
  type NutritionSharedDataKind,
} from "@/domain/nutrition/types";

export type NutritionProviderAdapter = {
  id: string;
  label: string;
  status: NutritionConnectionStatus;
  /** Data kinds this provider can share when connected. */
  supportedDataKinds: readonly NutritionSharedDataKind[];
  /**
   * Read connection metadata for an athlete.
   * Must not invent a connected state.
   */
  getConnection: (input: {
    athleteProfileId: string;
  }) => Promise<NutritionProviderConnection>;
  /**
   * Fetch daily targets when securely synced.
   * Return null when unavailable / not connected — never invent targets.
   */
  fetchDailyTargets: (input: {
    athleteProfileId: string;
    date: string;
  }) => Promise<NutritionDailyTargets | null>;
  /**
   * Fetch observed daily nutrition summary when securely synced.
   * Return null when unavailable — never invent intake.
   */
  fetchDailySummary: (input: {
    athleteProfileId: string;
    date: string;
  }) => Promise<NutritionDailySummary | null>;
};

/** Default Mealnexio stub — documents the extension point without pretending to sync. */
export const unavailableMealnexioAdapter: NutritionProviderAdapter = {
  id: "mealnexio",
  label: "Mealnexio",
  status: "unavailable",
  supportedDataKinds: NUTRITION_SHARED_DATA_KINDS,
  async getConnection({ athleteProfileId }) {
    return {
      athleteProfileId,
      providerId: "mealnexio",
      status: "unavailable",
      externalAccountLabel: null,
      lastSyncAt: null,
      lastError: null,
    };
  },
  async fetchDailyTargets() {
    return null;
  },
  async fetchDailySummary() {
    return null;
  },
};

const registry: NutritionProviderAdapter[] = [unavailableMealnexioAdapter];

export function listNutritionProviders(): NutritionProviderAdapter[] {
  return [...registry];
}

/**
 * Active provider for dashboard reads.
 * Prefers a real `connected` adapter; otherwise the Mealnexio stub.
 */
export function getActiveNutritionProvider(): NutritionProviderAdapter {
  const connected = registry.find((a) => a.status === "connected");
  if (connected) return connected;
  const mealnexio = registry.find((a) => a.id === "mealnexio");
  return mealnexio ?? unavailableMealnexioAdapter;
}

/**
 * Register a real adapter when Mealnexio API credentials and client exist.
 * Rejects duplicate ids.
 */
export function registerNutritionProvider(
  adapter: NutritionProviderAdapter,
): void {
  if (registry.some((a) => a.id === adapter.id)) {
    throw new Error(`Nutrition provider already registered: ${adapter.id}`);
  }
  registry.push(adapter);
}

/** Reset registry to the unavailable Mealnexio stub (tests). */
export function resetNutritionProvidersForTests(): void {
  registry.length = 0;
  registry.push(unavailableMealnexioAdapter);
}
