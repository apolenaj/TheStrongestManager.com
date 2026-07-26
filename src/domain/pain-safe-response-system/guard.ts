/**
 * Central guard — suppress aggressive training recommendations in pain-safe mode.
 */

import {
  PAIN_SAFE_AGGRESSIVE_KINDS,
  PAIN_SAFE_SEEK_CARE_MESSAGE,
  type PainSafeAggressiveKind,
  type PainSafeSurface,
} from "@/domain/pain-safe-response-system/constants";
import type { PainSafeAnalysis } from "@/domain/pain-safe-response-system/types";
import type { PainSafeGuardResult } from "@/domain/pain-safe-response-system/types";
import { isPainSafeModeActive } from "@/domain/pain-safe-response-system/analyze";

export function isAggressiveKind(
  kind: string,
): kind is PainSafeAggressiveKind {
  return (PAIN_SAFE_AGGRESSIVE_KINDS as readonly string[]).includes(kind);
}

/**
 * Map adaptive changeKind → aggressive kind when applicable.
 */
export function adaptiveKindToAggressive(
  changeKind: string,
): PainSafeAggressiveKind | null {
  if (changeKind === "increase_load") return "increase_load";
  if (changeKind === "increase_volume") return "increase_volume";
  return null;
}

/**
 * Fail closed: when pain-safe mode is active and the recommendation is aggressive,
 * withhold it and surface seek-care messaging. Never diagnose.
 */
export function applyPainSafeGuard<T>(input: {
  analysis: PainSafeAnalysis;
  recommendation: T;
  surface: PainSafeSurface;
  aggressiveKind: PainSafeAggressiveKind | null;
}): PainSafeGuardResult<T> {
  const active = isPainSafeModeActive(input.analysis);
  if (!active || input.aggressiveKind == null) {
    return {
      recommendation: input.recommendation,
      suppressed: false,
      painSafeModeActive: active,
      seekCareMessage: active ? PAIN_SAFE_SEEK_CARE_MESSAGE : null,
      surface: input.surface,
      reason: active
        ? "Pain-safe mode active — non-aggressive recommendation allowed."
        : null,
    };
  }

  return {
    recommendation: null,
    suppressed: true,
    painSafeModeActive: true,
    seekCareMessage: PAIN_SAFE_SEEK_CARE_MESSAGE,
    surface: input.surface,
    reason: `Withheld ${input.aggressiveKind} on ${input.surface} — pain-safe mode active. Seek qualified medical evaluation. This app does not diagnose.`,
  };
}

/**
 * Safe substitute for adaptive engine when increase_* would have been proposed.
 */
export function painSafeAdaptationHold(exerciseName: string): {
  changeKind: "keep_load";
  recommendedChange: string;
  reason: string;
  confidence: "low";
  params: Record<string, never>;
  source: "recommended";
} {
  const name = exerciseName.trim() || "this lift";
  return {
    changeKind: "keep_load",
    recommendedChange: `Hold load on ${name} — pain-safe mode`,
    reason: `${PAIN_SAFE_SEEK_CARE_MESSAGE} Aggressive progression is paused while sharp pain, neurological symptoms, or serious injury reports are active.`,
    confidence: "low",
    params: {},
    source: "recommended",
  };
}
