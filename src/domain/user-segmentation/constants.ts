/**
 * User Segmentation (Prompt 163).
 * Behavior + product context only — never sensitive demographic axes.
 */

export const USER_SEGMENTATION_ENGINE_VERSION = "user_segmentation.v1" as const;

export const USER_SEGMENTATION_HONESTY = [
  "Segments use training level, sport/discipline context, coach role, paid plan, and engagement behavior.",
  "Never create sensitive demographic segmentation (sex, age, birth year, body metrics, race, ethnicity) unnecessarily.",
  "Athletes may belong to multiple segments (e.g. beginner + powerlifting + paid).",
  "High engagement is a recent activity proxy — not a personality or demographic label.",
] as const;

/** Characteristics that must never define a segment. */
export const USER_SEGMENTATION_SENSITIVE_DENYLIST = [
  "sex",
  "gender",
  "birthYear",
  "birth_year",
  "age",
  "race",
  "ethnicity",
  "bodyweight",
  "height",
  "body_metrics",
  "medical",
  "injury",
] as const;

export const USER_SEGMENTATION_DEFAULT_COHORT_DAYS = 90;
export const USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS = 14;
/** Completed workouts in the engagement window to qualify as high engagement. */
export const USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_WORKOUTS = 3;
/** Alternate: workouts + technique uploads in the window. */
export const USER_SEGMENTATION_HIGH_ENGAGEMENT_MIN_TECHNIQUE = 1;

export const USER_SEGMENTS = [
  {
    id: "beginner",
    label: "Beginner",
    kind: "experience" as const,
    description:
      "TrainingExperience.level is beginner — product experience context, not age.",
  },
  {
    id: "advanced",
    label: "Advanced",
    kind: "experience" as const,
    description:
      "TrainingExperience.level is advanced or elite — product experience context.",
  },
  {
    id: "powerlifting",
    label: "Powerlifting",
    kind: "sport" as const,
    description:
      "primaryDiscipline or preferred sports include powerlifting.",
  },
  {
    id: "bodybuilding",
    label: "Bodybuilding",
    kind: "sport" as const,
    description:
      "primaryDiscipline or preferred sports include bodybuilding.",
  },
  {
    id: "coach",
    label: "Coach",
    kind: "role" as const,
    description:
      "User.isCoach or primaryDiscipline is coach — product role context.",
  },
  {
    id: "paid",
    label: "Paid",
    kind: "billing" as const,
    description:
      "Active/trialing/past_due paid plan (pro, performance, elite_coaching).",
  },
  {
    id: "high_engagement",
    label: "High engagement",
    kind: "behavior" as const,
    description:
      "Recent completed workouts (and optionally technique) in the engagement window.",
  },
] as const;

export type UserSegmentId = (typeof USER_SEGMENTS)[number]["id"];

export const USER_SEGMENTATION_PAID_PLANS = [
  "pro",
  "performance",
  "elite_coaching",
] as const;
