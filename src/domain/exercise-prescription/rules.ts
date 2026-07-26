import type { EquipmentKey } from "@/domain/exercises/types";
import type {
  ExercisePrescriptionCandidate,
  ExercisePrescriptionInputs,
} from "@/domain/exercise-prescription/types";

export type PrescriptionRuleEffect = {
  /** Catalog slug only — effects targeting unknown slugs are ignored at score time. */
  slug: string;
  weight: number;
  reason: string;
};

export type PrescriptionRule = {
  id: string;
  label: string;
  description: string;
  when: (input: ExercisePrescriptionInputs) => boolean;
  effects: PrescriptionRuleEffect[];
};

function hasEquipment(
  input: ExercisePrescriptionInputs,
  key: EquipmentKey,
): boolean {
  if (input.equipment.length === 0) return true; // unknown → don't hard-block
  return input.equipment.includes(key);
}

/**
 * Multi-rule exercise prescription effects (Prompt 59).
 * Deterministic coaching heuristics — not a single auto-prescribe shortcut.
 */
export const PRESCRIPTION_RULES: readonly PrescriptionRule[] = [
  {
    id: "weak-deadlift-lockout",
    label: "Deadlift lockout weak point",
    description:
      "Lockout-limited deadlifts often benefit from hip-extension and posterior-chain accessories.",
    when: (i) => i.weakPoint === "deadlift_lockout",
    effects: [
      {
        slug: "romanian-deadlift",
        weight: 5,
        reason:
          "Posterior-chain hypertrophy and hip-extension strength support lockout.",
      },
      {
        slug: "hip-thrust",
        weight: 4,
        reason: "Trains hip extension with a shorter ROM emphasis near lockout.",
      },
      {
        slug: "deadlift",
        weight: 2,
        reason: "Competition deadlift remains specific practice for lockout timing.",
      },
    ],
  },
  {
    id: "weak-deadlift-off-floor",
    label: "Deadlift off-floor weak point",
    description: "Slow off the floor often needs stronger start positions and quads/upper back.",
    when: (i) => i.weakPoint === "deadlift_off_floor",
    effects: [
      {
        slug: "deadlift",
        weight: 3,
        reason: "Specific practice from the floor remains primary.",
      },
      {
        slug: "front-squat",
        weight: 3,
        reason: "Quadriceps and upright torso strength can help the first pull.",
      },
      {
        slug: "barbell-row",
        weight: 2,
        reason: "Upper-back strength supports a stronger start position.",
      },
    ],
  },
  {
    id: "weak-squat",
    label: "Squat strength weak point",
    description: "Squat progress usually needs squat variants plus supporting patterns.",
    when: (i) => i.weakPoint === "squat_strength",
    effects: [
      {
        slug: "back-squat",
        weight: 5,
        reason: "Specific squat practice is the primary driver.",
      },
      {
        slug: "front-squat",
        weight: 3,
        reason: "Upright squat variation that challenges quads and torso.",
      },
      {
        slug: "leg-press",
        weight: 2,
        reason: "Lower-skill quad volume when recovery or skill is limited.",
      },
    ],
  },
  {
    id: "weak-bench",
    label: "Bench press weak point",
    description: "Bench progress pairs the competition lift with pressing and upper-back work.",
    when: (i) => i.weakPoint === "bench_press",
    effects: [
      {
        slug: "bench-press",
        weight: 5,
        reason: "Specific bench practice.",
      },
      {
        slug: "overhead-press",
        weight: 2,
        reason: "General pressing strength transfer.",
      },
      {
        slug: "barbell-row",
        weight: 2,
        reason: "Upper-back balance for pressing volume.",
      },
    ],
  },
  {
    id: "weak-posterior-chain",
    label: "Posterior-chain focus",
    description: "Hinge and hip-extension work for hamstrings/glutes/erectors.",
    when: (i) => i.weakPoint === "posterior_chain",
    effects: [
      {
        slug: "romanian-deadlift",
        weight: 5,
        reason: "Primary hinge accessory for posterior-chain hypertrophy.",
      },
      {
        slug: "hip-thrust",
        weight: 4,
        reason: "Glute-biased hip extension.",
      },
      {
        slug: "deadlift",
        weight: 2,
        reason: "Heavy hinge specificity when appropriate.",
      },
    ],
  },
  {
    id: "weak-upper-back",
    label: "Upper-back focus",
    description: "Horizontal and vertical pulls build upper-back capacity.",
    when: (i) => i.weakPoint === "upper_back",
    effects: [
      {
        slug: "barbell-row",
        weight: 5,
        reason: "Horizontal pull for upper-back thickness and strength.",
      },
      {
        slug: "pull-up",
        weight: 4,
        reason: "Vertical pull for lats and upper-back endurance.",
      },
    ],
  },
  {
    id: "goal-strength",
    label: "Strength / powerlifting goal",
    description: "Strength goals favor competition lifts and close variants.",
    when: (i) =>
      i.goal === "strength" ||
      i.goal === "powerlifting" ||
      i.sport === "powerlifting",
    effects: [
      {
        slug: "back-squat",
        weight: 3,
        reason: "Core strength lift for lower-body force production.",
      },
      {
        slug: "bench-press",
        weight: 3,
        reason: "Core strength lift for upper-body pressing.",
      },
      {
        slug: "deadlift",
        weight: 3,
        reason: "Core strength lift for hinge force production.",
      },
      {
        slug: "romanian-deadlift",
        weight: 2,
        reason: "Hinge accessory that supports deadlift strength.",
      },
    ],
  },
  {
    id: "goal-hypertrophy",
    label: "Hypertrophy goal",
    description: "Muscle-focused goals boost accessories with clear local stimulus.",
    when: (i) => i.goal === "hypertrophy" || i.weakPoint === "hypertrophy",
    effects: [
      {
        slug: "romanian-deadlift",
        weight: 3,
        reason: "Efficient posterior-chain hypertrophy tool.",
      },
      {
        slug: "hip-thrust",
        weight: 3,
        reason: "Glute hypertrophy with manageable skill demand.",
      },
      {
        slug: "leg-press",
        weight: 2,
        reason: "Quad volume with lower skill cost than free-bar squats.",
      },
      {
        slug: "pull-up",
        weight: 2,
        reason: "Lat and upper-back hypertrophy.",
      },
    ],
  },
  {
    id: "equipment-barbell",
    label: "Barbell available",
    description: "When barbell is listed, prefer barbell catalog lifts.",
    when: (i) => hasEquipment(i, "barbell"),
    effects: [
      {
        slug: "back-squat",
        weight: 1,
        reason: "Barbell squat matches available equipment.",
      },
      {
        slug: "bench-press",
        weight: 1,
        reason: "Barbell bench matches available equipment.",
      },
      {
        slug: "deadlift",
        weight: 1,
        reason: "Barbell deadlift matches available equipment.",
      },
      {
        slug: "romanian-deadlift",
        weight: 1,
        reason: "Barbell RDL matches available equipment.",
      },
      {
        slug: "barbell-row",
        weight: 1,
        reason: "Barbell row matches available equipment.",
      },
      {
        slug: "overhead-press",
        weight: 1,
        reason: "Barbell press matches available equipment.",
      },
    ],
  },
  {
    id: "equipment-minimal-bodyweight",
    label: "Limited equipment → bodyweight options",
    description: "When equipment is sparse, prefer bodyweight-capable catalog items.",
    when: (i) =>
      i.equipment.length > 0 &&
      !i.equipment.includes("barbell") &&
      !i.equipment.includes("dumbbell") &&
      !i.equipment.includes("machine"),
    effects: [
      {
        slug: "pull-up",
        weight: 4,
        reason: "Bodyweight vertical pull when barbell tools are unavailable.",
      },
    ],
  },
  {
    id: "experience-beginner-simple",
    label: "Beginners need lower skill demand",
    description: "Penalize advanced catalog items; boost simpler patterns.",
    when: (i) => i.experience === "beginner",
    effects: [
      {
        slug: "leg-press",
        weight: 3,
        reason: "Lower skill demand for lower-body volume as a beginner.",
      },
      {
        slug: "hip-thrust",
        weight: 2,
        reason: "Manageable hip-extension pattern for early trainees.",
      },
      {
        slug: "romanian-deadlift",
        weight: 1,
        reason: "Useful hinge teaching tool when coached carefully.",
      },
      // Soft penalties applied in recommend via difficulty filter; small positive for basics:
      {
        slug: "back-squat",
        weight: 1,
        reason: "Fundamental squat pattern — keep loads conservative.",
      },
    ],
  },
  {
    id: "pain-prefer-controlled",
    label: "Pain / movement flags → controlled options",
    description:
      "When movement caution notes exist, prefer lower-skill, more controlled catalog items.",
    when: (i) => i.painFlags,
    effects: [
      {
        slug: "leg-press",
        weight: 3,
        reason: "More controlled ROM than free-bar squats when caution notes exist.",
      },
      {
        slug: "hip-thrust",
        weight: 2,
        reason: "Supported hip extension with adjustable ROM.",
      },
      {
        slug: "romanian-deadlift",
        weight: 1,
        reason: "Hinge accessory that can stay submaximal — still requires judgment.",
      },
    ],
  },
  {
    id: "technique-limitations-regressions",
    label: "Technique limitations → accessible variants",
    description: "When technique notes exist, boost simpler or accessory patterns.",
    when: (i) =>
      Boolean(i.techniqueLimitations && i.techniqueLimitations.trim().length > 0),
    effects: [
      {
        slug: "romanian-deadlift",
        weight: 2,
        reason: "Often used to train hinge positions with lighter absolute loads.",
      },
      {
        slug: "front-squat",
        weight: 1,
        reason: "Can reinforce upright torso positions when back-squat technique is limited.",
      },
      {
        slug: "leg-press",
        weight: 2,
        reason: "Lower technical demand for leg volume while technique is rebuilt.",
      },
    ],
  },
  {
    id: "program-missing-hinge",
    label: "Current program missing hinge",
    description: "If the active program lacks hinge work, boost hinge catalog items.",
    when: (i) =>
      i.currentProgramPatterns.length > 0 &&
      !i.currentProgramPatterns.includes("hinge"),
    effects: [
      {
        slug: "romanian-deadlift",
        weight: 3,
        reason: "Adds missing hinge stimulus to the current program.",
      },
      {
        slug: "deadlift",
        weight: 2,
        reason: "Competition hinge if appropriate for the athlete.",
      },
      {
        slug: "hip-thrust",
        weight: 2,
        reason: "Hip-extension hinge alternative.",
      },
    ],
  },
  {
    id: "program-missing-pull",
    label: "Current program missing pull",
    description: "If the active program lacks pull work, boost pull catalog items.",
    when: (i) =>
      i.currentProgramPatterns.length > 0 &&
      !i.currentProgramPatterns.includes("pull"),
    effects: [
      {
        slug: "barbell-row",
        weight: 3,
        reason: "Adds missing horizontal pull.",
      },
      {
        slug: "pull-up",
        weight: 3,
        reason: "Adds missing vertical pull.",
      },
    ],
  },
];

/** Soft equipment compatibility — used as a gate, not a single prescribe heuristic. */
export function candidateMatchesEquipment(
  candidate: ExercisePrescriptionCandidate,
  available: EquipmentKey[],
): boolean {
  if (available.length === 0) return true;
  if (candidate.equipment.length === 0) return true;
  return candidate.equipment.some((eq) => available.includes(eq));
}
