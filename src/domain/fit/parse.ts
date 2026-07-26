import {
  FIT_DAYS,
  FIT_EQUIPMENT,
  FIT_EXPERIENCE,
  FIT_GOALS,
  FIT_INPUT_DEFAULTS,
  FIT_PREFERENCES,
  FIT_RECOVERY,
  FIT_SESSION,
  FIT_SPORT,
  type FitDays,
  type FitEquipment,
  type FitExperience,
  type FitGoal,
  type FitInputs,
  type FitPreference,
  type FitRecovery,
  type FitSession,
  type FitSport,
} from "@/domain/fit/types";

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!value) return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function firstParam(
  raw: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * Parse shareable `/fit?...` query into FitInputs (invalid keys fall back to defaults).
 */
export function parseFitSearchParams(
  params: Record<string, string | string[] | undefined>,
): FitInputs {
  return {
    goal: pick(firstParam(params.goal), FIT_GOALS, FIT_INPUT_DEFAULTS.goal),
    experience: pick(
      firstParam(params.experience),
      FIT_EXPERIENCE,
      FIT_INPUT_DEFAULTS.experience,
    ),
    days: pick(firstParam(params.days), FIT_DAYS, FIT_INPUT_DEFAULTS.days),
    session: pick(
      firstParam(params.session),
      FIT_SESSION,
      FIT_INPUT_DEFAULTS.session,
    ),
    recovery: pick(
      firstParam(params.recovery),
      FIT_RECOVERY,
      FIT_INPUT_DEFAULTS.recovery,
    ),
    equipment: pick(
      firstParam(params.equipment),
      FIT_EQUIPMENT,
      FIT_INPUT_DEFAULTS.equipment,
    ),
    sport: pick(firstParam(params.sport), FIT_SPORT, FIT_INPUT_DEFAULTS.sport),
    preference: pick(
      firstParam(params.preference),
      FIT_PREFERENCES,
      FIT_INPUT_DEFAULTS.preference,
    ),
  };
}

export function buildSharePath(inputs: FitInputs): string {
  const q = new URLSearchParams({
    goal: inputs.goal,
    experience: inputs.experience,
    days: inputs.days,
    session: inputs.session,
    recovery: inputs.recovery,
    equipment: inputs.equipment,
    sport: inputs.sport,
    preference: inputs.preference,
  });
  return `/fit?${q.toString()}`;
}

export function isCompleteFitQuery(
  params: Record<string, string | string[] | undefined>,
): boolean {
  const keys = [
    "goal",
    "experience",
    "days",
    "session",
    "recovery",
    "equipment",
    "sport",
    "preference",
  ] as const;
  return keys.every((key) => {
    const v = firstParam(params[key]);
    return typeof v === "string" && v.length > 0;
  });
}

/** Type guards used by tests / UI option maps */
export type {
  FitDays,
  FitEquipment,
  FitExperience,
  FitGoal,
  FitPreference,
  FitRecovery,
  FitSession,
  FitSport,
};
