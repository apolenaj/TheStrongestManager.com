/**
 * Assemble pain-safe analysis from detections / reports.
 */

import {
  PAIN_SAFE_AGGRESSIVE_KINDS,
  PAIN_SAFE_ENGINE_VERSION,
  PAIN_SAFE_RESPONSE_HONESTY,
  PAIN_SAFE_SEEK_CARE_MESSAGE,
  type PainSafeCategory,
} from "@/domain/pain-safe-response-system/constants";
import type {
  PainSafeAnalysis,
  PainSafeDetection,
} from "@/domain/pain-safe-response-system/types";

function uniqueCategories(detections: PainSafeDetection[]): PainSafeCategory[] {
  const set = new Set<PainSafeCategory>();
  for (const d of detections) {
    if (d.matched) set.add(d.category);
  }
  return [...set];
}

/**
 * Pure analysis — never diagnoses; activates on any matching red-flag category.
 */
export function analyzePainSafeResponse(input: {
  detections: PainSafeDetection[];
}): PainSafeAnalysis {
  const categoriesActive = uniqueCategories(input.detections);
  const active = categoriesActive.length > 0;

  const explanation: string[] = [];
  if (!active) {
    explanation.push(
      "No sharp pain, neurological symptoms, or serious injury reports are active. Aggressive recommendations are not blocked by this safety layer.",
    );
  } else {
    explanation.push(
      `Pain-safe mode is active for: ${categoriesActive
        .map((c) => c.replace(/_/g, " "))
        .join(", ")}.`,
    );
    explanation.push(PAIN_SAFE_SEEK_CARE_MESSAGE);
    explanation.push(
      "Aggressive load/volume progression and high-risk attempt advice are withheld until you clear these reports with your clinician’s guidance.",
    );
    for (const d of input.detections.filter((x) => x.matched)) {
      explanation.push(
        `${d.label} (${d.source}): ${d.evidence.slice(0, 120)}`,
      );
    }
  }

  return {
    engineVersion: PAIN_SAFE_ENGINE_VERSION,
    active,
    categoriesActive,
    detections: input.detections.filter((d) => d.matched),
    seekCareMessage: active ? PAIN_SAFE_SEEK_CARE_MESSAGE : "",
    suppressedAggressiveKinds: active ? PAIN_SAFE_AGGRESSIVE_KINDS : [],
    explanation,
    honesty: PAIN_SAFE_RESPONSE_HONESTY,
    neverDiagnose: true,
  };
}

export function isPainSafeModeActive(analysis: PainSafeAnalysis): boolean {
  return analysis.active;
}
