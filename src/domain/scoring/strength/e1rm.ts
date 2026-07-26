import {
  EPLEY_MAX_REPS,
  EPLEY_REP_DIVISOR,
} from "@/domain/scoring/strength/thresholds";
import type { InputSourceKind } from "@/domain/scoring/types";

/**
 * Evidence label for a logged load or derived 1RM.
 * Estimated 1RM must never be presented as a verified PR.
 */
export type StrengthEvidenceLabel = "Verified" | "Estimated" | "Reported";

export type ResolvedEffort = {
  /** Canonical kg used for comparisons (load or e1RM). */
  effortKg: number;
  /** Raw logged load kg. */
  loadKg: number;
  reps: number | null;
  label: StrengthEvidenceLabel;
  /** True only when effortKg came from Epley (multi-rep). */
  isEstimated1rm: boolean;
  source: InputSourceKind;
  recordedAt: Date;
};

/**
 * Epley (1985): estimated 1RM ≈ w × (1 + r/30).
 * Returns null when estimation is inappropriate.
 */
export function estimate1rmKg(weightKg: number, reps: number): number | null {
  if (!(weightKg > 0) || !Number.isFinite(weightKg)) return null;
  if (!Number.isInteger(reps) || reps < 2 || reps > EPLEY_MAX_REPS) return null;
  return weightKg * (1 + reps / EPLEY_REP_DIVISOR);
}

/**
 * Resolve how a lift sample should be interpreted for strength scoring.
 * - Verified: observed single (or unspecified) load — the weight that was lifted
 * - Estimated: multi-rep → Epley e1RM (never a PR)
 * - Reported: athlete-claimed load without observation
 */
export function resolveLiftEffort(sample: {
  valueKg: number;
  reps?: number | null;
  source: InputSourceKind;
  recordedAt: Date;
}): ResolvedEffort | null {
  if (!(sample.valueKg > 0)) return null;

  const reps = sample.reps ?? null;

  if (reps != null && reps >= 2) {
    const e1rm = estimate1rmKg(sample.valueKg, reps);
    if (e1rm == null) return null;
    return {
      effortKg: e1rm,
      loadKg: sample.valueKg,
      reps,
      label: "Estimated",
      isEstimated1rm: true,
      source: sample.source,
      recordedAt: sample.recordedAt,
    };
  }

  if (sample.source === "observed") {
    return {
      effortKg: sample.valueKg,
      loadKg: sample.valueKg,
      reps: reps === 1 ? 1 : reps,
      label: "Verified",
      isEstimated1rm: false,
      source: sample.source,
      recordedAt: sample.recordedAt,
    };
  }

  return {
    effortKg: sample.valueKg,
    loadKg: sample.valueKg,
    reps,
    label: "Reported",
    isEstimated1rm: false,
    source: sample.source,
    recordedAt: sample.recordedAt,
  };
}
