/**
 * Pure activation evaluation from timestamps (Prompt 160).
 */

import {
  ACTIVATION_CRITERIA,
  ACTIVATION_MIN_COHORT_FOR_RATES,
  ACTIVATION_RETURN_WINDOW_DAYS,
  type ActivationCriterionId,
  type ActivationFunnelStepId,
} from "@/domain/activation-metrics/constants";

export type AthleteActivationInput = {
  userId: string;
  /** User.createdAt — cohort + return window anchor. */
  signedUpAt: Date;
  onboardingCompletedAt: Date | null;
  /** Earliest completed TrainingSession.completedAt. */
  firstWorkoutCompletedAt: Date | null;
  /** Earliest non-deleted TechniqueAnalysis.createdAt. */
  firstTechniqueUploadedAt: Date | null;
  /**
   * All product activity timestamps used for D7 return
   * (completed workouts + technique uploads).
   */
  activityTimestamps: Date[];
};

export type AthleteActivationResult = {
  userId: string;
  criteria: Record<ActivationCriterionId, boolean>;
  fullyActivated: boolean;
  /** ISO timestamps when each criterion was first satisfied (null if unmet). */
  satisfiedAt: Record<ActivationCriterionId, string | null>;
};

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * True when activity occurs on a UTC calendar day after signup day
 * and within ACTIVATION_RETURN_WINDOW_DAYS of signedUpAt.
 */
export function hasReturnedWithinSevenDays(
  signedUpAt: Date,
  activityTimestamps: readonly Date[],
  windowDays: number = ACTIVATION_RETURN_WINDOW_DAYS,
): { returned: boolean; firstReturnAt: Date | null } {
  const signupDay = utcDayKey(signedUpAt);
  const windowEnd = addDays(signedUpAt, windowDays);
  let firstReturnAt: Date | null = null;

  for (const ts of activityTimestamps) {
    if (ts.getTime() > windowEnd.getTime()) continue;
    if (ts.getTime() < signedUpAt.getTime()) continue;
    if (utcDayKey(ts) === signupDay) continue;
    if (!firstReturnAt || ts.getTime() < firstReturnAt.getTime()) {
      firstReturnAt = ts;
    }
  }

  return { returned: firstReturnAt !== null, firstReturnAt };
}

export function evaluateAthleteActivation(
  input: AthleteActivationInput,
): AthleteActivationResult {
  const onboarding = input.onboardingCompletedAt !== null;
  const workout = input.firstWorkoutCompletedAt !== null;
  const technique = input.firstTechniqueUploadedAt !== null;
  const { returned, firstReturnAt } = hasReturnedWithinSevenDays(
    input.signedUpAt,
    input.activityTimestamps,
  );

  const criteria: Record<ActivationCriterionId, boolean> = {
    onboarding_completed: onboarding,
    first_workout_logged: workout,
    first_technique_uploaded: technique,
    returned_within_seven_days: returned,
  };

  const satisfiedAt: Record<ActivationCriterionId, string | null> = {
    onboarding_completed: input.onboardingCompletedAt?.toISOString() ?? null,
    first_workout_logged:
      input.firstWorkoutCompletedAt?.toISOString() ?? null,
    first_technique_uploaded:
      input.firstTechniqueUploadedAt?.toISOString() ?? null,
    returned_within_seven_days: firstReturnAt?.toISOString() ?? null,
  };

  return {
    userId: input.userId,
    criteria,
    fullyActivated: ACTIVATION_CRITERIA.every((c) => criteria[c.id]),
    satisfiedAt,
  };
}

export type ActivationCohortTotals = {
  signedUp: number;
  onboardingCompleted: number;
  firstWorkoutLogged: number;
  firstTechniqueUploaded: number;
  returnedWithinSevenDays: number;
  fullyActivated: number;
};

export type ActivationRateRow = {
  id: ActivationFunnelStepId;
  label: string;
  count: number;
  /** Rate vs signed-up cohort; null when cohort too small or N/A. */
  rateOfSignedUp: number | null;
  decisionReady: boolean;
};

export type ActivationCohortSummary = {
  totals: ActivationCohortTotals;
  rates: ActivationRateRow[];
  /** Athletes who met some but not all criteria. */
  partialActivationCount: number;
  decisionReady: boolean;
  note: string;
};

export function summarizeActivationCohort(
  results: readonly AthleteActivationResult[],
): ActivationCohortSummary {
  const signedUp = results.length;
  const totals: ActivationCohortTotals = {
    signedUp,
    onboardingCompleted: results.filter((r) => r.criteria.onboarding_completed)
      .length,
    firstWorkoutLogged: results.filter((r) => r.criteria.first_workout_logged)
      .length,
    firstTechniqueUploaded: results.filter(
      (r) => r.criteria.first_technique_uploaded,
    ).length,
    returnedWithinSevenDays: results.filter(
      (r) => r.criteria.returned_within_seven_days,
    ).length,
    fullyActivated: results.filter((r) => r.fullyActivated).length,
  };

  const decisionReady = signedUp >= ACTIVATION_MIN_COHORT_FOR_RATES;
  const rate = (n: number): number | null =>
    signedUp === 0 ? null : n / signedUp;

  const rates: ActivationRateRow[] = [
    {
      id: "signed_up",
      label: "Signed up",
      count: totals.signedUp,
      rateOfSignedUp: signedUp === 0 ? null : 1,
      decisionReady,
    },
    {
      id: "onboarding_completed",
      label: "Onboarding completed",
      count: totals.onboardingCompleted,
      rateOfSignedUp: rate(totals.onboardingCompleted),
      decisionReady,
    },
    {
      id: "first_workout_logged",
      label: "First workout logged",
      count: totals.firstWorkoutLogged,
      rateOfSignedUp: rate(totals.firstWorkoutLogged),
      decisionReady,
    },
    {
      id: "first_technique_uploaded",
      label: "First technique uploaded",
      count: totals.firstTechniqueUploaded,
      rateOfSignedUp: rate(totals.firstTechniqueUploaded),
      decisionReady,
    },
    {
      id: "returned_within_seven_days",
      label: "Returned within 7 days",
      count: totals.returnedWithinSevenDays,
      rateOfSignedUp: rate(totals.returnedWithinSevenDays),
      decisionReady,
    },
    {
      id: "fully_activated",
      label: "Fully activated",
      count: totals.fullyActivated,
      rateOfSignedUp: rate(totals.fullyActivated),
      decisionReady,
    },
  ];

  const partialActivationCount = results.filter(
    (r) =>
      !r.fullyActivated &&
      Object.values(r.criteria).some(Boolean),
  ).length;

  return {
    totals,
    rates,
    partialActivationCount,
    decisionReady,
    note: decisionReady
      ? `Cohort n=${signedUp} meets the ≥${ACTIVATION_MIN_COHORT_FOR_RATES} sample gate for rate decisions.`
      : `Cohort n=${signedUp} is under the ≥${ACTIVATION_MIN_COHORT_FOR_RATES} sample gate — treat rates as directional only.`,
  };
}

/** Median milliseconds from signup to criterion (null if fewer than 1 sample). */
export function medianMsToCriterion(
  results: readonly AthleteActivationResult[],
  criterion: ActivationCriterionId,
  signedUpAtByUserId: Map<string, Date>,
): number | null {
  const deltas: number[] = [];
  for (const r of results) {
    const at = r.satisfiedAt[criterion];
    const signup = signedUpAtByUserId.get(r.userId);
    if (!at || !signup) continue;
    const ms = new Date(at).getTime() - signup.getTime();
    if (ms >= 0) deltas.push(ms);
  }
  if (deltas.length === 0) return null;
  deltas.sort((a, b) => a - b);
  const mid = Math.floor(deltas.length / 2);
  return deltas.length % 2 === 0
    ? Math.round((deltas[mid - 1]! + deltas[mid]!) / 2)
    : deltas[mid]!;
}
