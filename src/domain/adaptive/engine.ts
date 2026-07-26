import type {
  AdaptationChangeKind,
  AdaptationConfidence,
} from "@/domain/adaptive/constants";
import {
  DEFAULT_DELOAD_LOAD_PCT,
  DEFAULT_LOAD_INCREMENT_KG,
  DEFAULT_LOAD_REDUCTION_KG,
  DEFAULT_VOLUME_SET_DELTA,
} from "@/domain/adaptive/constants";

/** Frozen input snapshot — stored on ProgramAdaptation.inputsJson. */
export type AdaptationSignals = {
  goalTitle: string | null;
  goalCategory: string | null;
  /** Sets with performed data in lookback. */
  completedSetCount: number;
  /** Average performed RPE when logged. */
  avgRpe: number | null;
  /** Target RPE when available (mean). */
  avgTargetRpe: number | null;
  /** Fraction of sets that missed prescribed reps (0–1). */
  missedRepRate: number | null;
  /** Mean load delta vs prior session for same exercise (kg), when comparable. */
  recentLoadTrendKg: number | null;
  /** Consistency score 0–100 when enough sessions; else null. */
  consistencyScore: number | null;
  /** Mean readiness 0–100 when logged; else null. */
  recoveryReadiness: number | null;
  /** Technique overall trend: later mean − earlier mean (points). */
  techniqueTrendDelta: number | null;
  /** Latest technique overallScore mean in window. */
  techniqueRecentMean: number | null;
  currentLoadKg: number | null;
  currentSets: number | null;
  exerciseName: string | null;
};

export type AdaptationParams = {
  deltaKg?: number;
  loadMultiplier?: number;
  setsDelta?: number;
};

export type AdaptationSuggestion = {
  changeKind: AdaptationChangeKind;
  recommendedChange: string;
  reason: string;
  confidence: AdaptationConfidence;
  params: AdaptationParams;
  source: "recommended" | "heuristic";
};

function clampConfidence(parts: {
  hasSets: boolean;
  hasRpe: boolean;
  hasRecovery: boolean;
  hasConsistency: boolean;
  hasTechnique: boolean;
}): AdaptationConfidence {
  let score = 0;
  if (parts.hasSets) score += 2;
  if (parts.hasRpe) score += 1;
  if (parts.hasRecovery) score += 1;
  if (parts.hasConsistency) score += 1;
  if (parts.hasTechnique) score += 1;
  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function formatKg(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded} kg`;
}

/**
 * Pure adaptive engine — deterministic rules, no DB, never mutates a program.
 * Priority: safety (recovery / misses / technique) before progression.
 */
export function proposeAdaptation(
  signals: AdaptationSignals,
): AdaptationSuggestion {
  const confidence = clampConfidence({
    hasSets: signals.completedSetCount > 0,
    hasRpe: signals.avgRpe != null,
    hasRecovery: signals.recoveryReadiness != null,
    hasConsistency: signals.consistencyScore != null,
    hasTechnique: signals.techniqueTrendDelta != null,
  });

  const name = signals.exerciseName?.trim() || "this lift";
  const base = {
    confidence,
    source: "recommended" as const,
  };

  if (signals.completedSetCount === 0) {
    return {
      ...base,
      changeKind: "keep_load",
      recommendedChange: `Keep load on ${name}`,
      reason:
        "Not enough completed sets to justify a change. Log work sets before adapting.",
      params: {},
      confidence: "low",
      source: "heuristic",
    };
  }

  const recoveryLow =
    signals.recoveryReadiness != null && signals.recoveryReadiness < 45;
  const recoveryHigh =
    signals.recoveryReadiness != null && signals.recoveryReadiness >= 70;
  const missedHigh =
    signals.missedRepRate != null && signals.missedRepRate >= 0.35;
  const missedSome =
    signals.missedRepRate != null && signals.missedRepRate >= 0.15;
  const rpeHigh =
    signals.avgRpe != null &&
    (signals.avgTargetRpe != null
      ? signals.avgRpe >= signals.avgTargetRpe + 0.75
      : signals.avgRpe >= 9);
  const rpeLow =
    signals.avgRpe != null &&
    (signals.avgTargetRpe != null
      ? signals.avgRpe <= signals.avgTargetRpe - 1
      : signals.avgRpe <= 6.5);
  const techniqueDown =
    signals.techniqueTrendDelta != null && signals.techniqueTrendDelta <= -5;
  const consistencyPoor =
    signals.consistencyScore != null && signals.consistencyScore < 50;
  const hitAll =
    signals.missedRepRate != null && signals.missedRepRate === 0;

  // 1) Deload / volume cut when recovery + performance stress
  if (recoveryLow && (missedSome || rpeHigh || consistencyPoor)) {
    const setsDelta = -DEFAULT_VOLUME_SET_DELTA;
    return {
      ...base,
      changeKind: "deload",
      recommendedChange: `Deload ${name} (~${Math.round(DEFAULT_DELOAD_LOAD_PCT * 100)}% load${signals.currentSets != null ? `, −${DEFAULT_VOLUME_SET_DELTA} set` : ""})`,
      reason: [
        `Recent readiness is low${signals.recoveryReadiness != null ? ` (${Math.round(signals.recoveryReadiness)})` : ""}.`,
        missedSome ? "Reps were missed." : null,
        rpeHigh ? "RPE ran high versus target." : null,
        consistencyPoor ? "Training consistency is soft." : null,
        "A short deload protects progress better than pushing through.",
      ]
        .filter(Boolean)
        .join(" "),
      params: {
        loadMultiplier: 1 - DEFAULT_DELOAD_LOAD_PCT,
        setsDelta: signals.currentSets != null && signals.currentSets > 1 ? setsDelta : 0,
      },
    };
  }

  // 2) Technique declining → keep or reduce
  if (techniqueDown && (rpeHigh || missedSome)) {
    return {
      ...base,
      changeKind: "reduce_load",
      recommendedChange: `Reduce load on ${name} by ${formatKg(DEFAULT_LOAD_REDUCTION_KG)}`,
      reason: `Technique trend is down${signals.techniqueTrendDelta != null ? ` (${signals.techniqueTrendDelta.toFixed(0)} pts)` : ""} while effort is stressed. Back the load off before adding stress.`,
      params: { deltaKg: -DEFAULT_LOAD_REDUCTION_KG },
    };
  }

  if (techniqueDown) {
    return {
      ...base,
      changeKind: "keep_load",
      recommendedChange: `Keep load on ${name}`,
      reason:
        "Technique scores are trending down. Hold load and prioritize quality before progressing.",
      params: {},
    };
  }

  // 3) Missed reps → reduce load
  if (missedHigh) {
    return {
      ...base,
      changeKind: "reduce_load",
      recommendedChange: `Reduce load on ${name} by ${formatKg(DEFAULT_LOAD_REDUCTION_KG)}`,
      reason: `About ${Math.round((signals.missedRepRate ?? 0) * 100)}% of recent sets missed prescribed reps. Lower the load so targets are hit cleanly.`,
      params: { deltaKg: -DEFAULT_LOAD_REDUCTION_KG },
    };
  }

  // 4) High RPE with some misses → reduce volume
  if (rpeHigh && missedSome) {
    return {
      ...base,
      changeKind: "reduce_volume",
      recommendedChange: `Reduce volume on ${name} (−${DEFAULT_VOLUME_SET_DELTA} set)`,
      reason:
        "RPE is high and some reps were missed. Drop a set before cutting load further.",
      params: { setsDelta: -DEFAULT_VOLUME_SET_DELTA },
    };
  }

  if (rpeHigh) {
    return {
      ...base,
      changeKind: "keep_load",
      recommendedChange: `Keep load on ${name}`,
      reason:
        "Average RPE is already high. Hold load this cycle rather than adding stress.",
      params: {},
    };
  }

  // 5) Clean hits + recoverable → increase load
  if (hitAll && rpeLow && (recoveryHigh || signals.recoveryReadiness == null)) {
    return {
      ...base,
      changeKind: "increase_load",
      recommendedChange: `Increase load on ${name} by ${formatKg(DEFAULT_LOAD_INCREMENT_KG)}`,
      reason: [
        "All recent prescribed reps were hit",
        rpeLow ? "with room under target RPE" : null,
        recoveryHigh ? "and readiness looks solid" : null,
        signals.goalCategory === "strength" ||
        signals.goalTitle?.toLowerCase().includes("strength")
          ? "— aligned with a strength goal."
          : ".",
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+\./, "."),
      params: { deltaKg: DEFAULT_LOAD_INCREMENT_KG },
    };
  }

  if (hitAll && !rpeHigh && recoveryHigh && signals.consistencyScore != null && signals.consistencyScore >= 75) {
    // Volume bump when load progression is unclear but athlete is consistent
    if (signals.currentLoadKg == null || signals.recentLoadTrendKg == null) {
      return {
        ...base,
        changeKind: "increase_volume",
        recommendedChange: `Increase volume on ${name} (+${DEFAULT_VOLUME_SET_DELTA} set)`,
        reason:
          "Consistency and recovery are strong with reps hit. Add a set before chasing heavier loads.",
        params: { setsDelta: DEFAULT_VOLUME_SET_DELTA },
      };
    }
  }

  if (hitAll && signals.avgRpe != null && !rpeHigh) {
    return {
      ...base,
      changeKind: "increase_load",
      recommendedChange: `Increase load on ${name} by ${formatKg(DEFAULT_LOAD_INCREMENT_KG)}`,
      reason:
        "Recent sets hit the prescription without elevated RPE. A small load bump is the next logical step.",
      params: { deltaKg: DEFAULT_LOAD_INCREMENT_KG },
    };
  }

  // 6) Default — keep
  return {
    ...base,
    changeKind: "keep_load",
    recommendedChange: `Keep load on ${name}`,
    reason:
      "Signals are mixed or incomplete. Holding load is safer than guessing a change.",
    params: {},
    source: confidence === "low" ? "heuristic" : "recommended",
  };
}

/** Apply params onto current load/sets for preview (does not write DB). */
export function previewAdaptedPrescription(input: {
  currentLoadKg: number | null;
  currentSets: number | null;
  params: AdaptationParams;
}): { loadKg: number | null; sets: number | null } {
  let loadKg = input.currentLoadKg;
  let sets = input.currentSets;

  if (loadKg != null) {
    if (input.params.loadMultiplier != null) {
      loadKg = Math.round(loadKg * input.params.loadMultiplier * 10) / 10;
    }
    if (input.params.deltaKg != null) {
      loadKg = Math.round((loadKg + input.params.deltaKg) * 10) / 10;
      if (loadKg < 0) loadKg = 0;
    }
  }

  if (sets != null && input.params.setsDelta != null) {
    sets = Math.max(1, sets + input.params.setsDelta);
  }

  return { loadKg, sets };
}
