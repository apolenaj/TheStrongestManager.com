import type {
  FatigueLevel,
  SkillDemandLevel,
} from "@/domain/exercise-prescription/constants";
import type { ExercisePrescriptionCandidate } from "@/domain/exercise-prescription/types";
import type { WeakPointId } from "@/domain/exercise-prescription/constants";

const PURPOSE_BY_SLUG: Record<string, string> = {
  "romanian-deadlift":
    "Posterior-chain hypertrophy and hip-extension strength",
  "hip-thrust": "Glute-biased hip extension and lockout support",
  deadlift: "Competition hinge strength and specificity",
  "back-squat": "Lower-body strength and squat specificity",
  "front-squat": "Upright squat strength and quad emphasis",
  "bench-press": "Horizontal pressing strength and specificity",
  "dumbbell-bench-press": "Chest-focused horizontal press with independent arms",
  "machine-chest-press": "Guided chest press with lower skill demand",
  "push-up": "Bodyweight horizontal push — scalable chest strength practice",
  "overhead-press": "Vertical pressing strength",
  "barbell-row": "Horizontal pull and upper-back strength",
  "pull-up": "Vertical pull and lat strength",
  "leg-press": "Lower-skill quad and lower-body volume",
};

const PLACEMENT_BY_PATTERN: Record<string, string> = {
  hinge: "After a lighter lower day, or as the main hinge on a pull/posterior day — not stacked immediately after a heavy conventional deadlift.",
  squat: "As the primary lower-body lift early in the session on a squat day.",
  push: "Early in an upper session when pressing is the priority.",
  pull: "After main presses, or on a dedicated pull day.",
  accessory: "After main compounds, 2–4 working sets.",
  olympic: "Fresh, early in the session — high skill demand.",
  carry: "End of session or dedicated conditioning block.",
  other: "After main lifts, once technique quality is available.",
};

export function skillDemandFor(
  candidate: ExercisePrescriptionCandidate,
): SkillDemandLevel {
  if (candidate.difficulty === "advanced") return "high";
  if (candidate.difficulty === "beginner") return "low";
  if (candidate.category === "olympic") return "high";
  if (candidate.category === "accessory" || candidate.category === "isolation") {
    return "low";
  }
  return "moderate";
}

export function expectedFatigueFor(
  candidate: ExercisePrescriptionCandidate,
): FatigueLevel {
  if (
    candidate.category === "compound" &&
    ["squat", "hinge", "olympic"].includes(candidate.movementPattern)
  ) {
    return "high";
  }
  if (candidate.category === "compound") return "moderate";
  if (candidate.slug === "leg-press" || candidate.slug === "hip-thrust") {
    return "moderate";
  }
  return "low";
}

export function primaryPurposeFor(
  candidate: ExercisePrescriptionCandidate,
  weakPoint: WeakPointId,
): string {
  if (PURPOSE_BY_SLUG[candidate.slug]) return PURPOSE_BY_SLUG[candidate.slug]!;
  if (weakPoint === "deadlift_lockout" && candidate.movementPattern === "hinge") {
    return "Hip-extension and posterior-chain support for lockout";
  }
  return (
    candidate.description?.slice(0, 120) ||
    `${candidate.movementPattern} pattern — ${candidate.category}`
  );
}

export function bestPlacementFor(
  candidate: ExercisePrescriptionCandidate,
): string {
  return (
    PLACEMENT_BY_PATTERN[candidate.movementPattern] ??
    PLACEMENT_BY_PATTERN.other!
  );
}
