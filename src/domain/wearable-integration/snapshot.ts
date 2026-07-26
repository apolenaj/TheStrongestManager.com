import {
  WEARABLE_DATA_KINDS,
  WEARABLE_FUTURE_ENV_KEYS,
  WEARABLE_INTEGRATION_ENGINE_VERSION,
  WEARABLE_INTEGRATION_HONESTY,
  WEARABLE_PROVIDER_IDS,
  WEARABLE_PROVIDER_LABELS,
  WEARABLE_PROVIDER_PLANNED_KINDS,
  WEARABLE_PROVIDER_PLATFORMS,
} from "@/domain/wearable-integration/constants";
import {
  isWearableArchitectureEnabled,
  isWearableLiveSyncEnabled,
} from "@/domain/wearable-integration/flags";
import { listWearableProviders } from "@/domain/wearable-integration/registry";

export type WearableIntegrationSnapshot = {
  engineVersion: typeof WEARABLE_INTEGRATION_ENGINE_VERSION;
  honesty: typeof WEARABLE_INTEGRATION_HONESTY;
  architectureEnabled: boolean;
  dataKinds: typeof WEARABLE_DATA_KINDS;
  providers: Array<{
    id: string;
    label: string;
    status: string;
    platforms: readonly string[];
    plannedKinds: readonly string[];
    liveSyncFlagOn: boolean;
    futureEnvKeys: readonly string[];
  }>;
  connectedCount: number;
  docPath: "docs/WEARABLE_INTEGRATION.md";
  generatedAt: string;
};

export function buildWearableIntegrationSnapshot(
  generatedAt: string = new Date().toISOString(),
): WearableIntegrationSnapshot {
  const providers = listWearableProviders().map((a) => ({
    id: a.id,
    label: a.label,
    status: a.status,
    platforms: a.platforms,
    plannedKinds: a.supportedDataKinds,
    liveSyncFlagOn: isWearableLiveSyncEnabled(a.id),
    futureEnvKeys: WEARABLE_FUTURE_ENV_KEYS[a.id],
  }));

  return {
    engineVersion: WEARABLE_INTEGRATION_ENGINE_VERSION,
    honesty: WEARABLE_INTEGRATION_HONESTY,
    architectureEnabled: isWearableArchitectureEnabled(),
    dataKinds: WEARABLE_DATA_KINDS,
    providers,
    connectedCount: providers.filter((p) => p.status === "connected").length,
    docPath: "docs/WEARABLE_INTEGRATION.md",
    generatedAt,
  };
}

export function listPlannedWearableCatalog() {
  return WEARABLE_PROVIDER_IDS.map((id) => ({
    id,
    label: WEARABLE_PROVIDER_LABELS[id],
    platforms: WEARABLE_PROVIDER_PLATFORMS[id],
    plannedKinds: WEARABLE_PROVIDER_PLANNED_KINDS[id],
  }));
}
