/**
 * Pure segment assignment from product + behavior signals (Prompt 163).
 */

import {
  USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_TECHNIQUE,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_WORKOUTS,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS,
  USER_SEGMENTATION_PAID_PLANS,
  USER_SEGMENTATION_SENSITIVE_DENYLIST,
  USER_SEGMENTS,
  type UserSegmentId,
} from "@/domain/user-segmentation/constants";

export type UserSegmentationInput = {
  userId: string;
  /** TrainingExperience.level */
  experienceLevel: string | null;
  /** AthleteProfile.primaryDiscipline */
  primaryDiscipline: string | null;
  /** Parsed preferred sports ids. */
  preferredSports: string[];
  isCoach: boolean;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
  /** Completed workout timestamps (for engagement window). */
  workoutCompletedAts: Date[];
  /** Technique upload timestamps. */
  techniqueUploadedAts: Date[];
  /** Evaluation "now" — injectable for tests. */
  now?: Date;
};

export type UserSegmentationResult = {
  userId: string;
  segments: UserSegmentId[];
  flags: Record<UserSegmentId, boolean>;
};

function parsePreferredSports(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export { parsePreferredSports };

function hasSportContext(
  primaryDiscipline: string | null,
  preferredSports: readonly string[],
  sport: "powerlifting" | "bodybuilding",
): boolean {
  if (primaryDiscipline === sport) return true;
  return preferredSports.includes(sport);
}

function countInWindow(
  timestamps: readonly Date[],
  now: Date,
  windowDays: number,
): number {
  const start = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  return timestamps.filter((t) => {
    const ms = t.getTime();
    return ms >= start && ms <= now.getTime();
  }).length;
}

export function isHighEngagement(input: {
  workoutCompletedAts: readonly Date[];
  techniqueUploadedAts: readonly Date[];
  now?: Date;
  windowDays?: number;
}): boolean {
  const now = input.now ?? new Date();
  const windowDays =
    input.windowDays ?? USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS;
  const workouts = countInWindow(input.workoutCompletedAts, now, windowDays);
  const technique = countInWindow(
    input.techniqueUploadedAts,
    now,
    windowDays,
  );
  if (workouts >= USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_WORKOUTS) return true;
  return (
    workouts >= 2 &&
    technique >= USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_TECHNIQUE
  );
}

export function isPaidSegment(
  plan: string | null,
  status: string | null,
): boolean {
  if (!plan || !status) return false;
  if (!(USER_SEGMENTATION_PAID_PLANS as readonly string[]).includes(plan)) {
    return false;
  }
  return (
    status === "active" || status === "trialing" || status === "past_due"
  );
}

/**
 * Refuse segment definitions that key off sensitive demographics.
 */
export function assertSegmentSignalAllowed(
  signalKey: string,
): { ok: true } | { ok: false; error: string } {
  if (
    (USER_SEGMENTATION_SENSITIVE_DENYLIST as readonly string[]).includes(
      signalKey,
    )
  ) {
    return {
      ok: false,
      error: `Signal "${signalKey}" is denied for user segmentation (sensitive demographic).`,
    };
  }
  return { ok: true };
}

export function assignUserSegments(
  input: UserSegmentationInput,
): UserSegmentationResult {
  const now = input.now ?? new Date();
  const flags: Record<UserSegmentId, boolean> = {
    beginner: input.experienceLevel === "beginner",
    advanced:
      input.experienceLevel === "advanced" ||
      input.experienceLevel === "elite",
    powerlifting: hasSportContext(
      input.primaryDiscipline,
      input.preferredSports,
      "powerlifting",
    ),
    bodybuilding: hasSportContext(
      input.primaryDiscipline,
      input.preferredSports,
      "bodybuilding",
    ),
    coach: input.isCoach || input.primaryDiscipline === "coach",
    paid: isPaidSegment(input.subscriptionPlan, input.subscriptionStatus),
    high_engagement: isHighEngagement({
      workoutCompletedAts: input.workoutCompletedAts,
      techniqueUploadedAts: input.techniqueUploadedAts,
      now,
    }),
  };

  const segments = USER_SEGMENTS.map((s) => s.id).filter((id) => flags[id]);

  return { userId: input.userId, segments, flags };
}

export type UserSegmentCohortRow = {
  id: UserSegmentId;
  label: string;
  kind: (typeof USER_SEGMENTS)[number]["kind"];
  count: number;
  rateOfCohort: number | null;
};

export type UserSegmentationCohortSummary = {
  cohortSize: number;
  rows: UserSegmentCohortRow[];
  /** Athletes with zero assigned segments. */
  unsegmentedCount: number;
  /** Athletes with 2+ segments. */
  multiSegmentCount: number;
  note: string;
};

export function summarizeUserSegmentationCohort(
  results: readonly UserSegmentationResult[],
): UserSegmentationCohortSummary {
  const cohortSize = results.length;
  const rows: UserSegmentCohortRow[] = USER_SEGMENTS.map((seg) => {
    const count = results.filter((r) => r.flags[seg.id]).length;
    return {
      id: seg.id,
      label: seg.label,
      kind: seg.kind,
      count,
      rateOfCohort: cohortSize === 0 ? null : count / cohortSize,
    };
  });

  return {
    cohortSize,
    rows,
    unsegmentedCount: results.filter((r) => r.segments.length === 0).length,
    multiSegmentCount: results.filter((r) => r.segments.length >= 2).length,
    note:
      cohortSize === 0
        ? "No athletes in cohort window."
        : `Multi-label assignment — counts can exceed cohort size when summed. n=${cohortSize}.`,
  };
}
