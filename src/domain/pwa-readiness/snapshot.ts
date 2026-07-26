import {
  PWA_CAPABILITIES,
  PWA_ENGINE_VERSION,
  PWA_HONESTY,
  PWA_NEVER_CACHE_PATTERNS,
  PWA_SHELL_PRECACHE,
  PWA_SW_PATH,
  PWA_CACHE_SHELL,
  PWA_CACHE_STATIC,
} from "@/domain/pwa-readiness/constants";

export type PwaReadinessSnapshot = {
  engineVersion: typeof PWA_ENGINE_VERSION;
  honesty: typeof PWA_HONESTY;
  capabilities: typeof PWA_CAPABILITIES;
  neverCachePatterns: typeof PWA_NEVER_CACHE_PATTERNS;
  shellPrecache: typeof PWA_SHELL_PRECACHE;
  swPath: typeof PWA_SW_PATH;
  cacheNames: {
    shell: typeof PWA_CACHE_SHELL;
    static: typeof PWA_CACHE_STATIC;
  };
  docPath: "docs/PWA_READINESS.md";
  generatedAt: string;
};

export function buildPwaReadinessSnapshot(
  generatedAt: string = new Date().toISOString(),
): PwaReadinessSnapshot {
  return {
    engineVersion: PWA_ENGINE_VERSION,
    honesty: PWA_HONESTY,
    capabilities: PWA_CAPABILITIES,
    neverCachePatterns: PWA_NEVER_CACHE_PATTERNS,
    shellPrecache: PWA_SHELL_PRECACHE,
    swPath: PWA_SW_PATH,
    cacheNames: {
      shell: PWA_CACHE_SHELL,
      static: PWA_CACHE_STATIC,
    },
    docPath: "docs/PWA_READINESS.md",
    generatedAt,
  };
}
