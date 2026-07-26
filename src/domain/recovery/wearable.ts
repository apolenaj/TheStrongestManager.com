/**
 * Recovery-facing wearable bridge (Prompt 26 + 185).
 * Delegates to wearable-integration — never invents device sleep.
 */

import {
  WEARABLE_PROVIDER_IDS,
  getConnectedWearableProvider,
  listWearableProviders,
  mayUseLiveWearableReads,
  registerWearableProvider,
  type WearableProviderAdapter,
  type WearableProviderId,
} from "@/domain/wearable-integration";

export type WearableConnectionStatus =
  | "unavailable"
  | "not_configured"
  | "connected";

export type WearableSleepSample = {
  recordedAt: Date;
  sleepHours: number;
  sleepQuality: number | null;
  providerId: string;
  /** observed from device — still not a medical sleep study. */
  source: "device";
};

export type WearableAdapter = {
  id: string;
  label: string;
  status: WearableConnectionStatus;
  /**
   * Fetch recent sleep samples when a real provider is connected + live flag on.
   * Must return [] when unavailable — never invent sleep.
   */
  fetchRecentSleep: (input: {
    athleteProfileId: string;
    since: Date;
  }) => Promise<WearableSleepSample[]>;
};

function toSleepAdapter(provider: WearableProviderAdapter): WearableAdapter {
  return {
    id: provider.id,
    label: provider.label,
    status: provider.status,
    async fetchRecentSleep(input) {
      if (!mayUseLiveWearableReads(provider)) return [];
      const samples = await provider.fetchSamples({
        athleteProfileId: input.athleteProfileId,
        since: input.since,
        kinds: ["sleep"],
      });
      return samples
        .filter((s) => s.kind === "sleep")
        .map((s) => ({
          recordedAt: s.recordedAt,
          sleepHours: s.value,
          sleepQuality: s.quality,
          providerId: s.providerId,
          source: "device" as const,
        }));
    },
  };
}

/** Default — no device connected; sleep never invented. */
export const unavailableWearableAdapter: WearableAdapter = {
  id: "none",
  label: "No wearable connected",
  status: "unavailable",
  async fetchRecentSleep() {
    return [];
  },
};

/** Planned providers as recovery-facing adapters (stubs until live). */
export function listWearableAdapters(): WearableAdapter[] {
  return listWearableProviders().map(toSleepAdapter);
}

export function getActiveWearableAdapter(): WearableAdapter {
  const connected = getConnectedWearableProvider();
  if (connected && mayUseLiveWearableReads(connected)) {
    return toSleepAdapter(connected);
  }
  return unavailableWearableAdapter;
}

/**
 * Bridge for tests / legacy callers. Prefer `registerWearableProvider`.
 */
export function registerWearableAdapter(adapter: WearableAdapter): void {
  if (adapter.id === "none") {
    throw new Error("Cannot replace the unavailable placeholder adapter id.");
  }
  if (!(WEARABLE_PROVIDER_IDS as readonly string[]).includes(adapter.id)) {
    throw new Error(
      `Unknown wearable id "${adapter.id}" — use registerWearableProvider with a WearableProviderId.`,
    );
  }
  const id = adapter.id as WearableProviderId;
  registerWearableProvider({
    id,
    label: adapter.label,
    status: adapter.status,
    platforms: [],
    supportedDataKinds: ["sleep"],
    async getConnection({ athleteProfileId }) {
      return {
        athleteProfileId,
        providerId: id,
        status: adapter.status,
        externalAccountLabel: null,
        lastSyncAt: null,
        lastError: null,
      };
    },
    async fetchSamples(input) {
      if (!input.kinds.includes("sleep")) return [];
      const sleep = await adapter.fetchRecentSleep({
        athleteProfileId: input.athleteProfileId,
        since: input.since,
      });
      return sleep.map((s) => ({
        kind: "sleep" as const,
        recordedAt: s.recordedAt,
        value: s.sleepHours,
        unit: "hours",
        providerId: id,
        source: "device" as const,
        quality: s.sleepQuality,
      }));
    },
  });
}
