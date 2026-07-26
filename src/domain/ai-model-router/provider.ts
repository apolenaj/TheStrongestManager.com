/**
 * Provider registry — not hard-wired to one vendor.
 */

import type {
  AiModelProvider,
  AiRouterTaskKind,
} from "@/domain/ai-model-router/constants";
import { DEFAULT_PROVIDER_CHAINS } from "@/domain/ai-model-router/constants";
import {
  noneAiModelProvider,
  stubAiModelProvider,
} from "@/domain/ai-model-router/stubs";

let providers: AiModelProvider[] = [
  noneAiModelProvider,
  stubAiModelProvider,
];

/** Optional overrides per task kind (provider id lists). */
let chainOverrides: Partial<Record<AiRouterTaskKind, readonly string[]>> = {};

export function listAiModelProviders(): readonly AiModelProvider[] {
  return providers;
}

export function getAiModelProvider(id: string): AiModelProvider | null {
  return providers.find((p) => p.id === id) ?? null;
}

export function registerAiModelProvider(provider: AiModelProvider): void {
  const without = providers.filter((p) => p.id !== provider.id);
  providers = [...without, provider];
}

export function setAiModelProviderChain(
  taskKind: AiRouterTaskKind,
  providerIds: readonly string[],
): void {
  chainOverrides = { ...chainOverrides, [taskKind]: providerIds };
}

export function getProviderChainForTask(
  taskKind: AiRouterTaskKind,
): string[] {
  const override = chainOverrides[taskKind];
  return [...(override ?? DEFAULT_PROVIDER_CHAINS[taskKind])];
}

/**
 * Ordered providers for a task — skips unknown ids; preserves chain order.
 */
export function resolveProvidersForTask(
  taskKind: AiRouterTaskKind,
): AiModelProvider[] {
  const chain = getProviderChainForTask(taskKind);
  const resolved: AiModelProvider[] = [];
  for (const id of chain) {
    const p = getAiModelProvider(id);
    if (p) resolved.push(p);
  }
  if (resolved.length === 0) {
    resolved.push(stubAiModelProvider);
  }
  return resolved;
}

export function resetAiModelProvidersForTests(): void {
  providers = [noneAiModelProvider, stubAiModelProvider];
  chainOverrides = {};
}
