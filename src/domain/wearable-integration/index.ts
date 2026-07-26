export {
  WEARABLE_INTEGRATION_ENGINE_VERSION,
  WEARABLE_INTEGRATION_HONESTY,
  WEARABLE_PROVIDER_IDS,
  WEARABLE_PROVIDER_LABELS,
  WEARABLE_PROVIDER_PLATFORMS,
  WEARABLE_DATA_KINDS,
  WEARABLE_DATA_KIND_LABELS,
  WEARABLE_PROVIDER_PLANNED_KINDS,
  WEARABLE_FUTURE_ENV_KEYS,
} from "@/domain/wearable-integration/constants";
export type {
  WearableProviderId,
  WearableDataKind,
  WearableConnectionStatus,
} from "@/domain/wearable-integration/constants";
export type {
  WearableConnection,
  WearableSample,
  WearableProviderAdapter,
} from "@/domain/wearable-integration/types";
export {
  createNotConfiguredWearableAdapter,
  createDefaultWearableStubs,
} from "@/domain/wearable-integration/stubs";
export {
  listWearableProviders,
  getWearableProvider,
  getConnectedWearableProvider,
  registerWearableProvider,
  resetWearableProvidersForTests,
} from "@/domain/wearable-integration/registry";
export {
  isWearableArchitectureEnabled,
  isWearableLiveSyncEnabled,
  mayUseLiveWearableReads,
} from "@/domain/wearable-integration/flags";
export {
  buildWearableIntegrationSnapshot,
  listPlannedWearableCatalog,
  type WearableIntegrationSnapshot,
} from "@/domain/wearable-integration/snapshot";
