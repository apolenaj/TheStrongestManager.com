import {
  WARMUP_BAR_KG,
  WARMUP_DEFAULT_LADDER,
  WARMUP_FATIGUE_LADDER,
  WARMUP_FATIGUE_VOLUME_RATIO,
  WARMUP_HONESTY,
  WARMUP_MAX_SETS,
  WARMUP_MIN_SETS_WHEN_FATIGUED,
  WARMUP_ROUND_KG,
  WARMUP_TOP_FRACTION_CAP,
} from "@/domain/warmup-generator/constants";
import type {
  WarmupGeneratorInput,
  WarmupGeneratorResult,
  WarmupHistorySignal,
  WarmupPlan,
  WarmupSetPlan,
} from "@/domain/warmup-generator/types";

export function roundWarmupKg(kg: number): number {
  if (!(kg > 0) || !Number.isFinite(kg)) return WARMUP_BAR_KG;
  return Math.max(
    WARMUP_ROUND_KG,
    Math.round(kg / WARMUP_ROUND_KG) * WARMUP_ROUND_KG,
  );
}

export function shouldPreferFewerSets(
  targetKg: number,
  history: WarmupHistorySignal | null,
  preferFewerSets?: boolean,
): boolean {
  if (preferFewerSets === true) return true;
  if (!history || !(targetKg > 0)) return false;
  const threshold = targetKg * 5 * WARMUP_FATIGUE_VOLUME_RATIO;
  return history.volumeKgReps >= threshold;
}

function historySummary(history: WarmupHistorySignal | null): string {
  if (!history || history.sessionCount === 0) {
    return "No recent history for this exercise in the lookback window — using conservative defaults only.";
  }
  const heavy =
    history.heaviestLoadKg != null
      ? ` Heaviest logged ≈ ${roundWarmupKg(history.heaviestLoadKg)} kg.`
      : "";
  return `${history.sessionCount} recent session(s); volume ≈ ${Math.round(history.volumeKgReps)} kg·reps.${heavy}`;
}

/**
 * Build progressive warm-up sets below the working weight.
 * Conservative, capped, never at/above target.
 */
export function generateWarmupPlan(
  input: WarmupGeneratorInput,
): WarmupGeneratorResult {
  const target = input.targetWorkingWeightKg;
  if (!Number.isFinite(target) || target <= 0) {
    return {
      ok: false,
      reason: "Enter a target working weight greater than zero.",
    };
  }
  if (target < WARMUP_BAR_KG) {
    return {
      ok: false,
      reason: `Target is below empty-bar assumption (${WARMUP_BAR_KG} kg). Enter the working weight in kg, or warm up manually for light loads.`,
    };
  }

  const fatigued = shouldPreferFewerSets(
    target,
    input.history,
    input.preferFewerSets,
  );
  const ladder = fatigued ? WARMUP_FATIGUE_LADDER : WARMUP_DEFAULT_LADDER;
  const maxSets = fatigued
    ? Math.min(WARMUP_MIN_SETS_WHEN_FATIGUED, WARMUP_MAX_SETS)
    : WARMUP_MAX_SETS;

  const sets: WarmupSetPlan[] = [];
  let prevLoad = 0;

  for (let i = 0; i < ladder.length && sets.length < maxSets; i++) {
    const step = ladder[i]!;
    const fraction = Math.min(step.fractionOfTarget, WARMUP_TOP_FRACTION_CAP);
    let load = roundWarmupKg(target * fraction);

    // First step: never invent heavier than bar when target is moderate
    if (sets.length === 0) {
      load = Math.min(load, roundWarmupKg(Math.max(WARMUP_BAR_KG, target * 0.4)));
      if (load < WARMUP_BAR_KG) load = WARMUP_BAR_KG;
    }

    // Strictly below working weight
    const workFloor = roundWarmupKg(target - WARMUP_ROUND_KG);
    if (load >= target) {
      load = workFloor;
    }
    if (load >= target) {
      continue;
    }

    // Monotonic increase
    if (load <= prevLoad) {
      load = roundWarmupKg(prevLoad + WARMUP_ROUND_KG);
      if (load >= target) break;
    }

    // Skip duplicate loads
    if (sets.some((s) => s.loadKg === load)) continue;

    sets.push({
      id: `wu-${sets.length + 1}`,
      order: sets.length + 1,
      loadKg: load,
      reps: step.reps,
      label: step.label,
      fractionOfTarget: fraction,
      userModified: false,
    });
    prevLoad = load;
  }

  if (sets.length === 0) {
    return {
      ok: false,
      reason:
        "Could not build warm-up sets below that target — try a higher working weight or edit manually.",
    };
  }

  const notes: string[] = [
    "Rest as needed between warm-ups — the plan does not prescribe rest intervals.",
    "Skip or reduce any set that feels unnecessary; add sets only if you still feel cold.",
  ];
  if (fatigued) {
    notes.push(
      "Recent volume looks high relative to this target — using a shorter ladder to limit warm-up fatigue.",
    );
  }
  if (
    input.history?.heaviestLoadKg != null &&
    input.history.heaviestLoadKg > target * 1.05
  ) {
    notes.push(
      "Recent heaviest set is above today’s target — warm-ups still stay below your entered working weight.",
    );
  }

  const plan: WarmupPlan = {
    exerciseId: input.exerciseId,
    exerciseLabel: input.exerciseLabel,
    targetWorkingWeightKg: roundWarmupKg(target),
    sets,
    usedFatigueLadder: fatigued,
    historySummary: historySummary(input.history),
    notes,
    honesty: WARMUP_HONESTY,
  };

  return { ok: true, plan };
}

/**
 * Apply user edits while keeping order and the below-target rule when possible.
 */
export function applyWarmupSetEdits(
  plan: WarmupPlan,
  edits: Array<{
    id: string;
    loadKg?: number;
    reps?: number;
    label?: string;
  }>,
): WarmupPlan {
  const byId = new Map(edits.map((e) => [e.id, e]));
  const sets = plan.sets.map((s) => {
    const edit = byId.get(s.id);
    if (!edit) return s;
    let loadKg = s.loadKg;
    let reps = s.reps;
    let label = s.label;
    if (edit.loadKg != null && Number.isFinite(edit.loadKg) && edit.loadKg > 0) {
      loadKg = roundWarmupKg(edit.loadKg);
      if (loadKg >= plan.targetWorkingWeightKg) {
        loadKg = roundWarmupKg(
          plan.targetWorkingWeightKg - WARMUP_ROUND_KG,
        );
      }
    }
    if (edit.reps != null && Number.isFinite(edit.reps) && edit.reps > 0) {
      reps = Math.min(20, Math.max(1, Math.round(edit.reps)));
    }
    if (edit.label != null && edit.label.trim()) {
      label = edit.label.trim().slice(0, 40);
    }
    return {
      ...s,
      loadKg,
      reps,
      label,
      fractionOfTarget: null,
      userModified: true,
    };
  });

  return { ...plan, sets };
}

export function removeWarmupSet(plan: WarmupPlan, setId: string): WarmupPlan {
  const sets = plan.sets
    .filter((s) => s.id !== setId)
    .map((s, i) => ({ ...s, order: i + 1, id: `wu-${i + 1}` }));
  return { ...plan, sets };
}

export function addWarmupSet(
  plan: WarmupPlan,
  draft?: { loadKg?: number; reps?: number },
): WarmupPlan {
  if (plan.sets.length >= WARMUP_MAX_SETS) return plan;
  const last = plan.sets[plan.sets.length - 1];
  let load = draft?.loadKg ?? (last ? last.loadKg + WARMUP_ROUND_KG * 2 : WARMUP_BAR_KG);
  load = roundWarmupKg(load);
  if (load >= plan.targetWorkingWeightKg) {
    load = roundWarmupKg(plan.targetWorkingWeightKg - WARMUP_ROUND_KG);
  }
  const order = plan.sets.length + 1;
  const sets = [
    ...plan.sets,
    {
      id: `wu-${order}`,
      order,
      loadKg: load,
      reps: draft?.reps ?? 2,
      label: "Custom",
      fractionOfTarget: null,
      userModified: true,
    },
  ];
  return { ...plan, sets };
}
