/**
 * Exercise Intelligence — shared catalogs and types.
 * Coaching practice ≠ evidence claims. Do not invent citations.
 */

export const EXERCISE_CATEGORIES = [
  "compound",
  "isolation",
  "olympic",
  "accessory",
  "other",
] as const;

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const MOVEMENT_PATTERNS = [
  "squat",
  "hinge",
  "push",
  "pull",
  "carry",
  "olympic",
  "accessory",
  "other",
] as const;

export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type ExerciseDifficulty = (typeof DIFFICULTY_LEVELS)[number];

export const MUSCLE_KEYS = [
  "quads",
  "glutes",
  "hamstrings",
  "adductors",
  "abductors",
  "calves",
  "erectors",
  "abs",
  "obliques",
  "chest",
  "upper_back",
  "lats",
  "traps",
  "rear_delts",
  "side_delts",
  "front_delts",
  "biceps",
  "triceps",
  "forearms",
  "hip_flexors",
] as const;

export type MuscleKey = (typeof MUSCLE_KEYS)[number];

export const EQUIPMENT_KEYS = [
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "cable",
  "bodyweight",
  "rack",
  "bench",
  "plates",
  "bands",
  "other",
] as const;

export type EquipmentKey = (typeof EQUIPMENT_KEYS)[number];

export const SPORT_KEYS = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "general_strength",
  "hybrid",
] as const;

export type SportKey = (typeof SPORT_KEYS)[number];

export const SPORT_RELEVANCE_LEVELS = [
  "high",
  "moderate",
  "low",
  "none",
] as const;

export type SportRelevanceLevel = (typeof SPORT_RELEVANCE_LEVELS)[number];

export type SportRelevanceMap = Partial<Record<SportKey, SportRelevanceLevel>>;

export type RelatedMoveRef = {
  label: string;
  note: string;
  relatedSlug?: string;
};

/** Seed / content authoring shape before persistence. */
export type ExerciseSeedRecord = {
  slug: string;
  name: string;
  aliases: string[];
  description: string;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  equipment: EquipmentKey[];
  difficulty: ExerciseDifficulty;
  laterality: "bilateral" | "unilateral";
  sportRelevance: SportRelevanceMap;
  executionOverview: string;
  setup: string;
  execution: string;
  breathingBracing: string;
  commonMistakes: string[];
  regressions: RelatedMoveRef[];
  progressions: RelatedMoveRef[];
  variations: RelatedMoveRef[];
  programmingUses: string;
  safetyNotes: string;
};

export type ExerciseRelationSeed = {
  fromSlug: string;
  toSlug: string;
  relationType: "regression" | "progression" | "variation";
  note: string;
};
