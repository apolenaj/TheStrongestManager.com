import type { EquipmentKey } from "@/domain/exercises/types";
import type {
  FatigueLevel,
  SkillDemandLevel,
  WeakPointId,
} from "@/domain/exercise-prescription/constants";

export type ExercisePrescriptionGoal =
  | "strength"
  | "hypertrophy"
  | "powerlifting"
  | "general"
  | "other";

export type ExercisePrescriptionExperience =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

/** Catalog-backed candidate passed into the engine (never invented slugs). */
export type ExercisePrescriptionCandidate = {
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
  /** Regression / progression related slugs when known. */
  relatedSlugs: string[];
};

export type ExercisePrescriptionInputs = {
  goal: ExercisePrescriptionGoal;
  sport: string | null;
  weakPoint: WeakPointId;
  equipment: EquipmentKey[];
  experience: ExercisePrescriptionExperience | null;
  /** Free-text technique limitations (soft gate). */
  techniqueLimitations: string | null;
  /** True when athlete flagged pain/movement caution notes. */
  painFlags: boolean;
  /** Exercise names or slugs already in the current program. */
  currentProgramExerciseSlugs: string[];
  currentProgramPatterns: string[];
};

export type ExercisePrescriptionAlternative = {
  slug: string;
  name: string;
  reason: string;
  /** When true, this needs gear not in the athlete profile — must be labelled. */
  requiresUnavailableEquipment?: boolean;
  equipmentNote?: string | null;
};

export type ExercisePrescriptionRecommendation = {
  slug: string;
  name: string;
  /** Athlete-facing why (matches prompt “Why”). */
  reason: string;
  primaryPurpose: string;
  expectedFatigue: FatigueLevel;
  skillDemand: SkillDemandLevel;
  bestPlacementInWeek: string;
  alternatives: ExercisePrescriptionAlternative[];
  score: number;
  /** Distinct rule ids that contributed — must be ≥ MIN_RULE_HITS. */
  matchedRuleIds: string[];
  matchedRuleLabels: string[];
  href: string;
};

export type ExercisePrescriptionMatchedRule = {
  id: string;
  label: string;
  description: string;
};

export type ExercisePrescriptionResult = {
  engineVersion: string;
  inputs: ExercisePrescriptionInputs;
  recommendations: ExercisePrescriptionRecommendation[];
  matchedRules: ExercisePrescriptionMatchedRule[];
  missingInformation: string[];
  disclaimers: readonly string[];
  emptyReason: string | null;
};
