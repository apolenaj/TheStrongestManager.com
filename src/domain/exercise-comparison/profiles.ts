/**
 * Per-exercise qualitative comparison profiles (Prompt 166).
 */

import type { ExerciseFatigueBand } from "@/domain/exercise-comparison/constants";

export type ExerciseComparisonProfile = {
  slug: string;
  purpose: string;
  technique: string;
  muscles: string;
  fatigue: ExerciseFatigueBand;
  fatigueNote: string;
  programming: string;
  whoShouldChoose: string;
};

export const EXERCISE_COMPARISON_PROFILES: ExerciseComparisonProfile[] = [
  {
    slug: "romanian-deadlift",
    purpose:
      "Posterior-chain accessory hinge emphasizing controlled hip flexion with soft knees — hypertrophy and hinge practice without a floor dead stop.",
    technique:
      "Usually starts standing; knees stay soft and may travel slightly as you hinge. Depth is limited by hamstring and back position you can own — not a forced floor touch.",
    muscles:
      "Primary hamstrings and glutes; erectors and upper back support the braced trunk.",
    fatigue: "moderate",
    fatigueNote:
      "Meaningful local fatigue with lower systemic cost than heavy floor pulls for many athletes.",
    programming:
      "Accessory after primary pulls/squats, or technical hinge volume on lighter days. Log separately from floor deadlifts.",
    whoShouldChoose:
      "Choose RDL when you want a hinge with intentional soft knees and a standing start — especially for accessory volume.",
  },
  {
    slug: "stiff-leg-deadlift",
    purpose:
      "Hamstring-biased hinge with minimal knee bend — greater length demand than a typical RDL when positions are owned.",
    technique:
      "Knees stay nearly fixed (soft, not locked hard). Hinge at the hips with the bar close; do not chase depth by rounding the back.",
    muscles:
      "Strong hamstring emphasis with glutes; trunk extensors work hard to keep position — not a medical stretch prescription.",
    fatigue: "moderate_high",
    fatigueNote:
      "Range and tissue demand can climb quickly; often feels costlier than an RDL at similar loads.",
    programming:
      "Use sparingly as a targeted accessory. Prefer lighter loads and honest range before stacking volume.",
    whoShouldChoose:
      "Choose stiff-leg when you specifically want less knee bend than an RDL and can keep a back position you own.",
  },
  {
    slug: "deadlift",
    purpose:
      "Full floor pull to lockout — primary strength hinge and competition specificity for many strength sports.",
    technique:
      "Starts with plates on the floor; break the bar from a dead stop with a braced trunk and finish hips/shoulders together.",
    muscles:
      "Hamstrings, glutes, and erectors as primaries; quads, upper back, and grip share the work.",
    fatigue: "high",
    fatigueNote:
      "High systemic and axial cost when heavy — volume must respect recovery.",
    programming:
      "Primary pull in strength blocks or meet prep. Keep accessory hinges (RDL/SLDL) distinct in the log.",
    whoShouldChoose:
      "Choose conventional/floor deadlift when you need the full pull pattern or competition specificity.",
  },
  {
    slug: "back-squat",
    purpose:
      "Primary bilateral squat strength and hypertrophy with the bar on the upper back.",
    technique:
      "High-bar or low-bar placement; brace, squat to a depth you own, drive up with mid-foot pressure.",
    muscles: "Quads and glutes primary; adductors, erectors, and abs support.",
    fatigue: "high",
    fatigueNote: "Heavy axial loading — often the costliest lower-body session slot.",
    programming:
      "Main squat for strength sports and general lower-body strength. Dose intensity and volume deliberately.",
    whoShouldChoose:
      "Choose back squat when you need primary squat strength with a back-rack pattern you already train.",
  },
  {
    slug: "front-squat",
    purpose:
      "Upright-torso squat with front-rack demand — quad emphasis and weightlifting support.",
    technique:
      "Bar on the front of the shoulders; elbows up; more vertical torso than many low-bar back squats.",
    muscles: "Quads and glutes primary; upper back and abs work hard to keep the rack.",
    fatigue: "moderate_high",
    fatigueNote:
      "Loads are often lower than back squat, but rack and trunk demand can still fatigue quickly.",
    programming:
      "Main or accessory squat when upright posture or front-rack skill matters. Typically lighter than back squat.",
    whoShouldChoose:
      "Choose front squat for upright squat demand, weightlifting support, or when back-rack is a poor fit that day.",
  },
];

export function getExerciseComparisonProfile(
  slug: string,
): ExerciseComparisonProfile | undefined {
  return EXERCISE_COMPARISON_PROFILES.find((p) => p.slug === slug);
}
