import {
  DIFFICULTY_LEVELS,
  EQUIPMENT_KEYS,
  MOVEMENT_PATTERNS,
  MUSCLE_KEYS,
  SPORT_KEYS,
  type ExerciseDifficulty,
  type EquipmentKey,
  type MovementPattern,
  type MuscleKey,
  type SportKey,
  type SportRelevanceMap,
} from "@/domain/exercises/types";

/** Curated popular set — not fake analytics. */
export const POPULAR_EXERCISE_SLUGS = [
  "back-squat",
  "bench-press",
  "deadlift",
  "overhead-press",
  "pull-up",
] as const;

export type ExerciseSearchFilters = {
  q: string;
  sport: SportKey | "";
  equipment: EquipmentKey | "";
  movement: MovementPattern | "";
  muscle: MuscleKey | "";
  difficulty: ExerciseDifficulty | "";
};

export type SearchableExercise = {
  slug: string;
  name: string;
  description: string | null;
  aliases: string[];
  category: string;
  movementPattern: string;
  difficulty: string;
  equipment: EquipmentKey[];
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  sportRelevance: SportRelevanceMap;
};

export const EMPTY_EXERCISE_FILTERS: ExerciseSearchFilters = {
  q: "",
  sport: "",
  equipment: "",
  movement: "",
  muscle: "",
  difficulty: "",
};

function asOneOf<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
): T | "" {
  if (!value) return "";
  return (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

/** Parse shareable URL search params into typed filters. */
export function parseExerciseSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ExerciseSearchFilters {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) {
      return params.get(key)?.trim() ?? "";
    }
    const raw = params[key];
    if (Array.isArray(raw)) return raw[0]?.trim() ?? "";
    return raw?.trim() ?? "";
  };

  return {
    q: get("q"),
    sport: asOneOf(get("sport"), SPORT_KEYS),
    equipment: asOneOf(get("equipment"), EQUIPMENT_KEYS),
    movement: asOneOf(get("movement"), MOVEMENT_PATTERNS),
    muscle: asOneOf(get("muscle"), MUSCLE_KEYS),
    difficulty: asOneOf(get("difficulty"), DIFFICULTY_LEVELS),
  };
}

/** Build query string for shareable links (omits empty values). */
export function exerciseFiltersToSearchParams(
  filters: ExerciseSearchFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.sport) params.set("sport", filters.sport);
  if (filters.equipment) params.set("equipment", filters.equipment);
  if (filters.movement) params.set("movement", filters.movement);
  if (filters.muscle) params.set("muscle", filters.muscle);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  return params;
}

export function exerciseFiltersToHref(
  filters: ExerciseSearchFilters,
  basePath = "/exercises",
): string {
  const params = exerciseFiltersToSearchParams(filters);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function hasActiveExerciseFilters(
  filters: ExerciseSearchFilters,
): boolean {
  return Boolean(
    filters.q ||
      filters.sport ||
      filters.equipment ||
      filters.movement ||
      filters.muscle ||
      filters.difficulty,
  );
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function matchesQuery(exercise: SearchableExercise, q: string): boolean {
  if (!q) return true;
  const terms = q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (terms.length === 0) return true;

  const haystacks = [
    exercise.name,
    exercise.slug.replace(/-/g, " "),
    ...exercise.aliases,
    exercise.movementPattern,
    ...exercise.equipment,
    ...exercise.primaryMuscles,
    ...exercise.secondaryMuscles,
    exercise.description ?? "",
  ].map((s) => s.toLowerCase());

  return terms.every((term) =>
    haystacks.some((hay) => hay.includes(term)),
  );
}

function matchesFilters(
  exercise: SearchableExercise,
  filters: ExerciseSearchFilters,
): boolean {
  if (filters.movement && exercise.movementPattern !== filters.movement) {
    return false;
  }
  if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
    return false;
  }
  if (
    filters.equipment &&
    !exercise.equipment.includes(filters.equipment)
  ) {
    return false;
  }
  if (filters.muscle) {
    const muscles = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];
    if (!muscles.includes(filters.muscle)) return false;
  }
  if (filters.sport) {
    const level = exercise.sportRelevance[filters.sport];
    if (level !== "high" && level !== "moderate") return false;
  }
  return matchesQuery(exercise, filters.q);
}

export function filterExercises<T extends SearchableExercise>(
  exercises: T[],
  filters: ExerciseSearchFilters,
): T[] {
  return exercises.filter((exercise) => matchesFilters(exercise, filters));
}

/**
 * Related discovery: same movement first, then shared primary muscle,
 * excluding the current slug and already-listed results when provided.
 */
export function findRelatedExercises<T extends SearchableExercise>(
  catalog: T[],
  seed: T | null,
  options: { excludeSlugs?: string[]; limit?: number } = {},
): T[] {
  if (!seed) return [];
  const exclude = new Set(options.excludeSlugs ?? []);
  exclude.add(seed.slug);
  const limit = options.limit ?? 4;

  const scored = catalog
    .filter((item) => !exclude.has(item.slug))
    .map((item) => {
      let score = 0;
      if (item.movementPattern === seed.movementPattern) score += 3;
      const sharedMuscles = item.primaryMuscles.filter((m) =>
        seed.primaryMuscles.includes(m),
      ).length;
      score += sharedMuscles;
      if (item.equipment.some((e) => seed.equipment.includes(e))) score += 1;
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));

  return scored.slice(0, limit).map((row) => row.item);
}

export function pickPopularExercises<T extends SearchableExercise>(
  catalog: T[],
  limit = 5,
): T[] {
  const bySlug = new Map(catalog.map((e) => [e.slug, e]));
  const popular = POPULAR_EXERCISE_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (e): e is T => Boolean(e),
  );
  if (popular.length >= limit) return popular.slice(0, limit);
  const rest = catalog.filter((e) => !popular.some((p) => p.slug === e.slug));
  return [...popular, ...rest].slice(0, limit);
}

export {
  includesInsensitive,
  DIFFICULTY_LEVELS,
  EQUIPMENT_KEYS,
  MOVEMENT_PATTERNS,
  MUSCLE_KEYS,
  SPORT_KEYS,
};
