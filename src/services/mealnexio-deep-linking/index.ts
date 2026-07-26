import {
  buildMealnexioDeepLinkingSnapshot,
  buildRecoveryNutritionDeepLinkPrompt,
  type MealnexioDeepLinkingSnapshot,
  type RecoveryNutritionDeepLinkPrompt,
} from "@/domain/mealnexio-deep-linking";
import { featureFlags } from "@/config/feature-flags";

export function getMealnexioDeepLinkingSnapshot(): MealnexioDeepLinkingSnapshot {
  return buildMealnexioDeepLinkingSnapshot();
}

/**
 * Recovery → Mealnexio CTA when deep linking flag is on.
 * Null when flagged off — callers must not invent an alternate fake sync CTA.
 */
export function getRecoveryNutritionDeepLinkPrompt(): RecoveryNutritionDeepLinkPrompt | null {
  if (!featureFlags.mealnexioDeepLinking) return null;
  return buildRecoveryNutritionDeepLinkPrompt();
}
