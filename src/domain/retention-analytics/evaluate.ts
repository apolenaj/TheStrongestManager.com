/**
 * Pure retention evaluation (Prompt 161).
 */

import {
  RETENTION_CORRELATION_ACTIONS,
  RETENTION_FEATURE_EARLY_DAYS,
  RETENTION_FEATURE_LATE_END_DAY,
  RETENTION_FEATURE_LATE_START_DAY,
  RETENTION_FEATURES,
  RETENTION_MIN_CELL_FOR_CORRELATION,
  RETENTION_MIN_COHORT_FOR_RATES,
  RETENTION_PAID_PLANS,
  RETENTION_WINDOWS,
  type RetentionCorrelationActionId,
  type RetentionFeatureId,
  type RetentionWindowId,
} from "@/domain/retention-analytics/constants";

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function inHalfOpenDayWindow(
  signedUpAt: Date,
  ts: Date,
  startDayInclusive: number,
  endDayInclusive: number,
): boolean {
  const start = addDays(signedUpAt, startDayInclusive);
  const end = addDays(signedUpAt, endDayInclusive);
  return ts.getTime() >= start.getTime() && ts.getTime() <= end.getTime();
}

/**
 * Window retention: activity after signup UTC day and within `days` of signedUpAt.
 */
export function isRetainedInWindow(
  signedUpAt: Date,
  activityTimestamps: readonly Date[],
  days: number,
): boolean {
  const signupDay = utcDayKey(signedUpAt);
  const windowEnd = addDays(signedUpAt, days);
  for (const ts of activityTimestamps) {
    if (ts.getTime() > windowEnd.getTime()) continue;
    if (ts.getTime() < signedUpAt.getTime()) continue;
    if (utcDayKey(ts) === signupDay) continue;
    return true;
  }
  return false;
}

export type RetentionAthleteInput = {
  userId: string;
  signedUpAt: Date;
  onboardingCompletedAt: Date | null;
  workoutCompletedAts: Date[];
  techniqueUploadedAts: Date[];
  subscription: {
    plan: string;
    status: string;
    createdAt: Date;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
  } | null;
};

export type RetentionAthleteResult = {
  userId: string;
  windows: Record<RetentionWindowId, boolean>;
  earlyActions: Record<RetentionCorrelationActionId, boolean>;
  featureEarly: Record<RetentionFeatureId, boolean>;
  featureReuse: Record<RetentionFeatureId, boolean>;
  /** Eligible for subscription retention math (had paid plan). */
  subscriptionPaid: boolean;
  subscriptionStillEntitled: boolean;
  subscriptionCancelAtPeriodEnd: boolean;
};

function activityAll(input: RetentionAthleteInput): Date[] {
  return [...input.workoutCompletedAts, ...input.techniqueUploadedAts];
}

function countInEarly(
  signedUpAt: Date,
  timestamps: readonly Date[],
  earlyDays: number = RETENTION_FEATURE_EARLY_DAYS,
): number {
  return timestamps.filter((ts) =>
    inHalfOpenDayWindow(signedUpAt, ts, 0, earlyDays),
  ).length;
}

function anyInLate(
  signedUpAt: Date,
  timestamps: readonly Date[],
): boolean {
  return timestamps.some((ts) =>
    inHalfOpenDayWindow(
      signedUpAt,
      ts,
      RETENTION_FEATURE_LATE_START_DAY,
      RETENTION_FEATURE_LATE_END_DAY,
    ),
  );
}

export function evaluateRetentionAthlete(
  input: RetentionAthleteInput,
): RetentionAthleteResult {
  const activity = activityAll(input);
  const windows = {
    d1: isRetainedInWindow(input.signedUpAt, activity, 1),
    d7: isRetainedInWindow(input.signedUpAt, activity, 7),
    d30: isRetainedInWindow(input.signedUpAt, activity, 30),
  } as Record<RetentionWindowId, boolean>;

  const earlyWorkouts = countInEarly(
    input.signedUpAt,
    input.workoutCompletedAts,
  );
  const earlyTechnique = countInEarly(
    input.signedUpAt,
    input.techniqueUploadedAts,
  );
  const onboardEarly =
    input.onboardingCompletedAt != null &&
    inHalfOpenDayWindow(
      input.signedUpAt,
      input.onboardingCompletedAt,
      0,
      RETENTION_FEATURE_EARLY_DAYS,
    );

  const earlyActions: Record<RetentionCorrelationActionId, boolean> = {
    onboarding_completed: onboardEarly,
    first_workout: earlyWorkouts >= 1,
    first_technique: earlyTechnique >= 1,
    two_plus_workouts: earlyWorkouts >= 2,
    workout_and_technique: earlyWorkouts >= 1 && earlyTechnique >= 1,
  };

  const featureEarly: Record<RetentionFeatureId, boolean> = {
    workouts: earlyWorkouts >= 1,
    technique: earlyTechnique >= 1,
  };
  const featureReuse: Record<RetentionFeatureId, boolean> = {
    workouts:
      featureEarly.workouts &&
      anyInLate(input.signedUpAt, input.workoutCompletedAts),
    technique:
      featureEarly.technique &&
      anyInLate(input.signedUpAt, input.techniqueUploadedAts),
  };

  const plan = input.subscription?.plan ?? "free";
  const status = input.subscription?.status ?? "active";
  const subscriptionPaid = (RETENTION_PAID_PLANS as readonly string[]).includes(
    plan,
  );
  const subscriptionStillEntitled =
    subscriptionPaid &&
    (status === "active" || status === "trialing" || status === "past_due");

  return {
    userId: input.userId,
    windows,
    earlyActions,
    featureEarly,
    featureReuse,
    subscriptionPaid,
    subscriptionStillEntitled,
    subscriptionCancelAtPeriodEnd:
      subscriptionPaid && (input.subscription?.cancelAtPeriodEnd ?? false),
  };
}

export type RetentionWindowSummary = {
  id: RetentionWindowId;
  label: string;
  days: number;
  retained: number;
  eligible: number;
  rate: number | null;
  decisionReady: boolean;
};

export type FeatureRetentionSummary = {
  id: RetentionFeatureId;
  label: string;
  earlyUsers: number;
  reuseUsers: number;
  rate: number | null;
  decisionReady: boolean;
  note: string;
};

export type SubscriptionRetentionSummary = {
  paidUsers: number;
  stillEntitled: number;
  cancelAtPeriodEnd: number;
  entitledRate: number | null;
  cancelAtPeriodEndRate: number | null;
  decisionReady: boolean;
  note: string;
};

export type ActionCorrelationRow = {
  actionId: RetentionCorrelationActionId;
  actionLabel: string;
  /** Retention outcome used (always D30 for primary correlations). */
  outcome: "d30";
  withAction: { n: number; retained: number; rate: number | null };
  withoutAction: { n: number; retained: number; rate: number | null };
  /** with rate − without rate; null if either cell underpowered. */
  rateDelta: number | null;
  status: "insufficient_sample" | "estimate_only";
  causationNote: string;
};

export type RetentionCohortSummary = {
  cohortSize: number;
  windows: RetentionWindowSummary[];
  features: FeatureRetentionSummary[];
  subscription: SubscriptionRetentionSummary;
  correlations: ActionCorrelationRow[];
  decisionReady: boolean;
  note: string;
};

function rateOrNull(n: number, d: number): number | null {
  if (d === 0) return null;
  return n / d;
}

export function summarizeRetentionCohort(
  results: readonly RetentionAthleteResult[],
): RetentionCohortSummary {
  const cohortSize = results.length;
  const decisionReady = cohortSize >= RETENTION_MIN_COHORT_FOR_RATES;

  const windows: RetentionWindowSummary[] = RETENTION_WINDOWS.map((w) => {
    const retained = results.filter((r) => r.windows[w.id]).length;
    return {
      id: w.id,
      label: w.label,
      days: w.days,
      retained,
      eligible: cohortSize,
      rate: rateOrNull(retained, cohortSize),
      decisionReady,
    };
  });

  const features: FeatureRetentionSummary[] = RETENTION_FEATURES.map((f) => {
    const earlyUsers = results.filter((r) => r.featureEarly[f.id]).length;
    const reuseUsers = results.filter((r) => r.featureReuse[f.id]).length;
    const ready = earlyUsers >= RETENTION_MIN_COHORT_FOR_RATES;
    return {
      id: f.id,
      label: f.label,
      earlyUsers,
      reuseUsers,
      rate: rateOrNull(reuseUsers, earlyUsers),
      decisionReady: ready,
      note: ready
        ? `Among early ${f.label.toLowerCase()} users, reuse in days ${RETENTION_FEATURE_LATE_START_DAY}–${RETENTION_FEATURE_LATE_END_DAY}. Association only.`
        : `Early ${f.label.toLowerCase()} n=${earlyUsers} under sample gate — directional only.`,
    };
  });

  const paid = results.filter((r) => r.subscriptionPaid);
  const stillEntitled = paid.filter((r) => r.subscriptionStillEntitled).length;
  const cancelAtPeriodEnd = paid.filter(
    (r) => r.subscriptionCancelAtPeriodEnd,
  ).length;
  const subReady = paid.length >= RETENTION_MIN_COHORT_FOR_RATES;
  const subscription: SubscriptionRetentionSummary = {
    paidUsers: paid.length,
    stillEntitled,
    cancelAtPeriodEnd,
    entitledRate: rateOrNull(stillEntitled, paid.length),
    cancelAtPeriodEndRate: rateOrNull(cancelAtPeriodEnd, paid.length),
    decisionReady: subReady,
    note: subReady
      ? "Among users currently on a paid plan in this cohort snapshot — not a longitudinal billing survival curve."
      : `Paid n=${paid.length} under sample gate — directional only.`,
  };

  const correlations: ActionCorrelationRow[] = RETENTION_CORRELATION_ACTIONS.map(
    (action) => {
      const withGroup = results.filter((r) => r.earlyActions[action.id]);
      const withoutGroup = results.filter((r) => !r.earlyActions[action.id]);
      const withRetained = withGroup.filter((r) => r.windows.d30).length;
      const withoutRetained = withoutGroup.filter((r) => r.windows.d30).length;
      const withRate = rateOrNull(withRetained, withGroup.length);
      const withoutRate = rateOrNull(withoutRetained, withoutGroup.length);
      const cellsOk =
        withGroup.length >= RETENTION_MIN_CELL_FOR_CORRELATION &&
        withoutGroup.length >= RETENTION_MIN_CELL_FOR_CORRELATION;
      const rateDelta =
        cellsOk && withRate != null && withoutRate != null
          ? withRate - withoutRate
          : null;

      return {
        actionId: action.id,
        actionLabel: action.label,
        outcome: "d30",
        withAction: {
          n: withGroup.length,
          retained: withRetained,
          rate: withRate,
        },
        withoutAction: {
          n: withoutGroup.length,
          retained: withoutRetained,
          rate: withoutRate,
        },
        rateDelta,
        status: cellsOk ? "estimate_only" : "insufficient_sample",
        causationNote:
          "Correlation only — do not interpret as causation automatically. Confounders (motivation, sport, season) are uncontrolled.",
      };
    },
  );

  return {
    cohortSize,
    windows,
    features,
    subscription,
    correlations,
    decisionReady,
    note: decisionReady
      ? `Cohort n=${cohortSize} meets the ≥${RETENTION_MIN_COHORT_FOR_RATES} sample gate for headline D-window rates.`
      : `Cohort n=${cohortSize} is under the ≥${RETENTION_MIN_COHORT_FOR_RATES} sample gate — treat rates as directional only.`,
  };
}
