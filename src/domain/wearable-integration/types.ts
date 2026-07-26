import type {
  WearableConnectionStatus,
  WearableDataKind,
  WearableProviderId,
} from "@/domain/wearable-integration/constants";

export type WearableConnection = {
  athleteProfileId: string;
  providerId: WearableProviderId;
  status: WearableConnectionStatus;
  /** External account label when a real OAuth/device link exists — null for stubs. */
  externalAccountLabel: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
};

/**
 * Normalized sample from a wearable.
 * Never invent — adapters return [] when not connected.
 */
export type WearableSample = {
  kind: WearableDataKind;
  recordedAt: Date;
  /** Numeric value in kind-specific units (hours, ms, bpm, score, count). */
  value: number;
  unit: string;
  providerId: WearableProviderId;
  source: "device";
  /** Optional quality / confidence from the vendor — not a medical grade. */
  quality: number | null;
};

export type WearableProviderAdapter = {
  id: WearableProviderId;
  label: string;
  status: WearableConnectionStatus;
  platforms: readonly string[];
  supportedDataKinds: readonly WearableDataKind[];
  /**
   * Connection metadata for an athlete.
   * Must not invent a connected state.
   */
  getConnection: (input: {
    athleteProfileId: string;
  }) => Promise<WearableConnection>;
  /**
   * Fetch device samples for requested kinds.
   * Return [] when unavailable / not configured — never invent values.
   */
  fetchSamples: (input: {
    athleteProfileId: string;
    since: Date;
    kinds: readonly WearableDataKind[];
  }) => Promise<WearableSample[]>;
};
