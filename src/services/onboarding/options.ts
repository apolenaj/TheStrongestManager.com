/**
 * Onboarding option catalogs and deterministic mapping helpers.
 * No AI inference — only explicit athlete input.
 */

import type { OnboardingPathId } from "@/domain/onboarding-paths";

export const PRIMARY_GOALS = [
  {
    id: "strength",
    label: "Strength",
    category: "strength",
    discipline: "general",
  },
  {
    id: "muscle_gain",
    label: "Muscle gain",
    category: "physique",
    discipline: "bodybuilding",
  },
  {
    id: "powerlifting",
    label: "Powerlifting competition",
    category: "performance",
    discipline: "powerlifting",
  },
  {
    id: "strongman",
    label: "Strongman",
    category: "performance",
    discipline: "strongman",
  },
  {
    id: "recomp",
    label: "Weight loss while preserving strength",
    category: "body_comp",
    discipline: "general",
  },
  {
    id: "general_fitness",
    label: "General fitness",
    category: "other",
    discipline: "general",
  },
] as const;

export type PrimaryGoalId = (typeof PRIMARY_GOALS)[number]["id"];

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", hint: "Under ~1 year of consistent training" },
  { id: "intermediate", label: "Intermediate", hint: "Consistent training with progressing loads" },
  { id: "advanced", label: "Advanced", hint: "Multi-year structured training" },
  { id: "elite", label: "Elite", hint: "Competitive high-level performance" },
] as const;

export type ExperienceLevelId = (typeof EXPERIENCE_LEVELS)[number]["id"];

export const SPORTS = [
  { id: "powerlifting", label: "Powerlifting" },
  { id: "bodybuilding", label: "Bodybuilding" },
  { id: "strongman", label: "Strongman" },
  { id: "weightlifting", label: "Weightlifting" },
  { id: "general_strength", label: "General strength" },
  { id: "hybrid", label: "Hybrid athlete" },
] as const;

export type SportId = (typeof SPORTS)[number]["id"];

export const FREQUENCY_OPTIONS = [
  { id: 2, label: "1–2 days / week" },
  { id: 3, label: "3 days / week" },
  { id: 4, label: "4 days / week" },
  { id: 5, label: "5 days / week" },
  { id: 6, label: "6+ days / week" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { id: "barbell", label: "Barbell" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "rack", label: "Squat rack / cages" },
  { id: "bench", label: "Bench" },
  { id: "machines", label: "Machines" },
  { id: "cables", label: "Cables" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "specialty", label: "Strongman / specialty implements" },
] as const;

export type EquipmentId = (typeof EQUIPMENT_OPTIONS)[number]["id"];

export const MAJOR_LIFTS = [
  { id: "squat", label: "Back squat", metricKey: "lift_squat" },
  { id: "bench", label: "Bench press", metricKey: "lift_bench" },
  { id: "deadlift", label: "Deadlift", metricKey: "lift_deadlift" },
  { id: "press", label: "Overhead press", metricKey: "lift_press" },
] as const;

export type MajorLiftId = (typeof MAJOR_LIFTS)[number]["id"];

export type OnboardingDraft = {
  /** Path from advanced onboarding personalization (Prompt 103). */
  pathId: OnboardingPathId | null;
  primaryGoalId: PrimaryGoalId | null;
  experienceLevelId: ExperienceLevelId | null;
  sports: SportId[];
  daysPerWeek: number | null;
  equipment: EquipmentId[];
  bodyweightKg: number | null;
  heightCm: number | null;
  lifts: Partial<Record<MajorLiftId, number | null>>;
  /** Optional meet / show date (yyyy-mm-dd) for advanced paths. */
  competitionDate: string | null;
  /** Optional free-text current program for advanced paths. */
  currentProgramNote: string | null;
  recentHistory: string | null;
  recoveryHabits: string | null;
  painCautionAcknowledged: boolean;
  movementNotes: string | null;
};

export const emptyOnboardingDraft = (): OnboardingDraft => ({
  pathId: null,
  primaryGoalId: null,
  experienceLevelId: null,
  sports: [],
  daysPerWeek: null,
  equipment: [],
  bodyweightKg: null,
  heightCm: null,
  lifts: {},
  competitionDate: null,
  currentProgramNote: null,
  recentHistory: null,
  recoveryHabits: null,
  painCautionAcknowledged: false,
  movementNotes: null,
});

export function resolvePrimaryDiscipline(
  draft: Pick<OnboardingDraft, "primaryGoalId" | "sports">,
): string {
  if (draft.sports.length === 1) {
    const sport = draft.sports[0];
    if (sport === "general_strength") return "general";
    return sport;
  }
  if (draft.sports.length > 1) {
    return "hybrid";
  }
  const goal = PRIMARY_GOALS.find((item) => item.id === draft.primaryGoalId);
  return goal?.discipline ?? "general";
}

export function resolveGoalMeta(goalId: PrimaryGoalId) {
  const goal = PRIMARY_GOALS.find((item) => item.id === goalId);
  if (!goal) {
    throw new Error("Unknown primary goal");
  }
  return goal;
}

/** Deterministic next-step copy from provided fields only. */
export function buildInitialRecommendation(draft: OnboardingDraft): {
  category: string;
  title: string;
  body: string;
} {
  if (draft.pathId === "coach") {
    return {
      category: "assessment",
      title: "Open Coach Mode",
      body: "Coach Mode is enabled. Invite athletes from Settings when ready — nothing was assumed about their programs.",
    };
  }

  if (draft.competitionDate) {
    return {
      category: "training",
      title: "Review competition prep",
      body: "A competition date is on file from onboarding. Open Competition to refine targets — no invented openers.",
    };
  }

  if (draft.currentProgramNote?.trim()) {
    return {
      category: "programming",
      title: "Link your current program",
      body: "You noted a current program during setup. Open Programs to formalize it when ready — nothing was auto-built.",
    };
  }

  const goal = draft.primaryGoalId
    ? PRIMARY_GOALS.find((item) => item.id === draft.primaryGoalId)
    : null;

  // First-session wow: push toward a logged workout once basics exist.
  if (draft.daysPerWeek && draft.equipment.length > 0) {
    return {
      category: "training",
      title: "Log your first workout",
      body: goal
        ? `Goal on file: “${goal.label}”. Open Today or Training and log a session — that is the fastest path to useful progress. No invented workout was created for you.`
        : "Open Today or Training and log a session — that is the fastest path to useful progress. No invented workout was created for you.",
    };
  }

  if (!draft.daysPerWeek) {
    return {
      category: "assessment",
      title: "Add weekly training frequency",
      body: "Frequency is still empty. Add it in Profile when ready so programming can match your schedule — nothing was assumed.",
    };
  }

  return {
    category: "assessment",
    title: "Add available equipment",
    body: "No equipment listed yet. Record what you can access in Profile so exercise choices stay realistic.",
  };
}
