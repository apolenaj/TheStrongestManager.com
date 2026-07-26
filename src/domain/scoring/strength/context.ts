/**
 * Experience- and sport-aware bodyweight-relative reference multiples.
 *
 * These are educational “solid for this level” anchors — NOT elite standards
 * applied to every athlete. Beginners are scored against beginner references.
 */

export type ExperienceContext =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "competition";

export type SportContext =
  | "powerlifting"
  | "bodybuilding"
  | "strongman"
  | "weightlifting"
  | "general"
  | "hybrid"
  | "coach";

export type MajorLiftMetricKey =
  | "lift_squat"
  | "lift_bench"
  | "lift_deadlift"
  | "lift_press";

/** Reference = bodyweight multiple considered solid for that context (ratio → score 100 at reference). */
export type LiftReferenceBand = Record<MajorLiftMetricKey, number>;

const BEGINNER: LiftReferenceBand = {
  lift_squat: 1.0,
  lift_bench: 0.7,
  lift_deadlift: 1.25,
  lift_press: 0.5,
};

const INTERMEDIATE: LiftReferenceBand = {
  lift_squat: 1.5,
  lift_bench: 1.0,
  lift_deadlift: 1.75,
  lift_press: 0.7,
};

const ADVANCED: LiftReferenceBand = {
  lift_squat: 2.0,
  lift_bench: 1.35,
  lift_deadlift: 2.25,
  lift_press: 0.9,
};

/** Competition athlete — still not “world elite”; a competitive local/regional anchor. */
const COMPETITION: LiftReferenceBand = {
  lift_squat: 2.25,
  lift_bench: 1.5,
  lift_deadlift: 2.5,
  lift_press: 1.0,
};

const BY_EXPERIENCE: Record<ExperienceContext, LiftReferenceBand> = {
  beginner: BEGINNER,
  intermediate: INTERMEDIATE,
  advanced: ADVANCED,
  competition: COMPETITION,
};

/** Sport adjusts which lifts are prioritized (weights sum to 1). */
export const SPORT_LIFT_WEIGHTS: Record<
  SportContext,
  Partial<Record<MajorLiftMetricKey, number>>
> = {
  powerlifting: {
    lift_squat: 0.35,
    lift_bench: 0.3,
    lift_deadlift: 0.35,
  },
  weightlifting: {
    lift_squat: 0.35,
    lift_press: 0.25,
    lift_deadlift: 0.2,
    lift_bench: 0.2,
  },
  strongman: {
    lift_deadlift: 0.4,
    lift_squat: 0.3,
    lift_press: 0.2,
    lift_bench: 0.1,
  },
  bodybuilding: {
    lift_squat: 0.25,
    lift_bench: 0.3,
    lift_deadlift: 0.25,
    lift_press: 0.2,
  },
  general: {
    lift_squat: 0.3,
    lift_bench: 0.25,
    lift_deadlift: 0.3,
    lift_press: 0.15,
  },
  hybrid: {
    lift_squat: 0.3,
    lift_bench: 0.25,
    lift_deadlift: 0.3,
    lift_press: 0.15,
  },
  coach: {
    lift_squat: 0.3,
    lift_bench: 0.25,
    lift_deadlift: 0.3,
    lift_press: 0.15,
  },
};

export function normalizeExperienceContext(
  level: string | null | undefined,
): ExperienceContext {
  switch (level) {
    case "beginner":
      return "beginner";
    case "advanced":
      return "advanced";
    case "elite":
      return "competition";
    case "intermediate":
    default:
      // Unspecified → intermediate anchors (not competition/elite).
      return level === "intermediate" ? "intermediate" : "intermediate";
  }
}

export function experienceContextLabel(ctx: ExperienceContext): string {
  switch (ctx) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    case "competition":
      return "Competition athlete";
  }
}

export function normalizeSportContext(
  discipline: string | null | undefined,
): SportContext {
  switch (discipline) {
    case "powerlifting":
    case "bodybuilding":
    case "strongman":
    case "weightlifting":
    case "hybrid":
    case "coach":
      return discipline;
    case "general":
    default:
      return "general";
  }
}

export function referenceMultiple(
  experience: ExperienceContext,
  metricKey: MajorLiftMetricKey,
): number {
  return BY_EXPERIENCE[experience][metricKey];
}

/**
 * Map lift/bodyweight ratio onto 0–100 using the athlete's own level reference.
 * ratio == reference → 100. Never uses elite standards for beginners.
 */
export function contextScoreFromRatio(
  ratio: number,
  reference: number,
): number {
  if (!(reference > 0) || !(ratio >= 0)) return 0;
  return Math.max(0, Math.min(100, (100 * ratio) / reference));
}
