import type {
  MovementPattern,
  SportKey,
  SportRelevanceMap,
} from "@/domain/exercises/types";

export type ExerciseNavSection = {
  id: string;
  label: string;
};

/** Compact section map for sticky / mobile nav. */
export const EXERCISE_DETAIL_SECTIONS: ExerciseNavSection[] = [
  { id: "overview", label: "Overview" },
  { id: "technique", label: "Technique" },
  { id: "setup", label: "Setup" },
  { id: "execution", label: "Execution" },
  { id: "media", label: "Media" },
  { id: "muscles", label: "Muscles" },
  { id: "mistakes", label: "Mistakes" },
  { id: "variations", label: "Variations" },
  { id: "programming", label: "Programming" },
  { id: "useful-for", label: "Useful for" },
  { id: "avoid-modify", label: "Avoid / modify" },
  { id: "related-exercises", label: "Related" },
  { id: "related-methods", label: "Methods" },
];

export type CoachingContextCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type RelatedMethodRef = {
  slug: string;
  name: string;
  note: string;
};

/**
 * Coaching associations only — not a methods database and not evidence.
 * Links point at reserved /methods/[slug] routes.
 */
const METHODS_BY_PATTERN: Partial<
  Record<MovementPattern, RelatedMethodRef[]>
> = {
  squat: [
    {
      slug: "linear-periodization",
      name: "Linear periodization",
      note: "Often used when progressing squat intensity across a block.",
    },
    {
      slug: "volume-accumulation",
      name: "Volume accumulation",
      note: "Higher-rep squat work for hypertrophy phases.",
    },
  ],
  hinge: [
    {
      slug: "posterior-chain-emphasis",
      name: "Posterior-chain emphasis",
      note: "Programming focus pairing hinges with recovery management.",
    },
    {
      slug: "strength-peaking",
      name: "Strength peaking",
      note: "Lower-rep hinge specificity near a strength test or meet.",
    },
  ],
  push: [
    {
      slug: "upper-push-pull-balance",
      name: "Push–pull balance",
      note: "Pair pressing volume with horizontal/vertical pulling.",
    },
    {
      slug: "intensity-techniques",
      name: "Intensity techniques",
      note: "Pauses and controlled eccentrics for press weak points.",
    },
  ],
  pull: [
    {
      slug: "upper-push-pull-balance",
      name: "Push–pull balance",
      note: "Pulling volume to support shoulder and back development.",
    },
    {
      slug: "relative-strength",
      name: "Relative strength",
      note: "Bodyweight pulling progressions and added load standards.",
    },
  ],
};

const SPORT_LABELS: Record<SportKey, string> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  general_strength: "General strength",
  hybrid: "Hybrid training",
};

export function relatedMethodsForPattern(
  pattern: string,
): RelatedMethodRef[] {
  return METHODS_BY_PATTERN[pattern as MovementPattern] ?? [];
}

export function usefulForFromSportRelevance(
  sportRelevance: SportRelevanceMap,
  difficulty: string,
): string[] {
  const lines: string[] = [];
  for (const [sport, level] of Object.entries(sportRelevance) as [
    SportKey,
    string,
  ][]) {
    if (level === "high" || level === "moderate") {
      lines.push(
        `${SPORT_LABELS[sport] ?? sport} (${level} relevance in catalog tagging)`,
      );
    }
  }
  if (difficulty === "beginner") {
    lines.push("Athletes building foundational pattern competence");
  } else if (difficulty === "advanced") {
    lines.push("Lifters with established technique under fatigue");
  }
  return lines;
}

/**
 * Coaching-context cards for the overview rail.
 * Explicitly not scientific validation scores.
 */
export function buildCoachingContextCards(input: {
  difficulty: string;
  movementPattern: string;
  equipment: string[];
  laterality: string | null;
}): CoachingContextCard[] {
  const skill =
    input.difficulty === "beginner"
      ? "Lower"
      : input.difficulty === "advanced"
        ? "Higher"
        : "Moderate";

  const axial =
    input.movementPattern === "squat" || input.movementPattern === "hinge"
      ? "Often higher"
      : input.movementPattern === "push" || input.movementPattern === "pull"
        ? "Situation-dependent"
        : "Varies";

  return [
    {
      id: "skill-demand",
      label: "Skill demand",
      value: skill,
      detail: "Coaching estimate from catalog difficulty — not a lab metric.",
    },
    {
      id: "equipment",
      label: "Equipment",
      value: input.equipment[0] ?? "Varies",
      detail:
        input.equipment.length > 1
          ? `Also: ${input.equipment.slice(1).join(", ")}. Catalog tags only — not a lab inventory.`
          : "Primary implement tagged in the catalog — not a lab inventory.",
    },
    {
      id: "loading-context",
      label: "Loading context",
      value: axial,
      detail:
        "Practical coaching context for programming fatigue — not biomechanical validation.",
    },
    {
      id: "laterality",
      label: "Laterality",
      value: input.laterality ?? "—",
      detail: "Catalog classification only.",
    },
  ];
}
