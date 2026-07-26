import type { EquipmentKey } from "@/domain/exercises/types";
import type {
  FatigueLevel,
  SkillDemandLevel,
} from "@/domain/exercise-prescription/constants";
import type { ExerciseSubstitutionGoal } from "@/domain/exercise-substitutions/constants";

export type ExerciseSubstitutionCandidate = {
  slug: string;
  name: string;
  description: string | null;
  movementPattern: string;
  category: string;
  difficulty: string;
  equipment: EquipmentKey[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  sportRelevance: Record<string, string>;
  relatedSlugs: string[];
};

export type ExerciseSubstitutionContext = {
  /** Athlete fatigue pressure — elevates preference for lower-fatigue swaps. */
  fatiguePressure: "normal" | "elevated" | "high";
  /** Athlete skill / experience — beginners prefer lower skill demand. */
  skillContext: "beginner" | "intermediate" | "advanced" | "elite" | null;
  painSafeActive: boolean;
  /** User-declared injury modification (Prompt 130) — prefer regressions / lower skill. */
  injuryModificationActive: boolean;
};

export type SubstitutionTradeoff = {
  dimension:
    | "goal"
    | "movement_pattern"
    | "fatigue"
    | "skill"
    | "equipment"
    | "specificity";
  vsUnavailable: "better" | "similar" | "worse" | "different";
  summary: string;
};

export type ExerciseSubstitutionRecommendation = {
  slug: string;
  name: string;
  rank: number;
  score: number;
  reason: string;
  primaryPurpose: string;
  expectedFatigue: FatigueLevel;
  skillDemand: SkillDemandLevel;
  tradeoffs: SubstitutionTradeoff[];
  href: string;
};

export type ExerciseSubstitutionResult = {
  engineVersion: string;
  unavailable: {
    slug: string;
    name: string;
    movementPattern: string;
    primaryMuscles: string[];
  };
  goal: ExerciseSubstitutionGoal;
  goalLabel: string;
  equipment: EquipmentKey[];
  recommendations: ExerciseSubstitutionRecommendation[];
  missingInformation: string[];
  emptyReason: string | null;
  honesty: readonly string[];
};
