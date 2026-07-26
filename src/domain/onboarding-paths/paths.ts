/**
 * Path configs + visibility helpers for personalized onboarding.
 */

import type {
  OnboardingDetailSection,
  OnboardingPathId,
} from "@/domain/onboarding-paths/constants";
import type {
  OnboardingPathConfig,
  OnboardingPathVisibility,
} from "@/domain/onboarding-paths/types";
import type {
  EquipmentId,
  ExperienceLevelId,
  MajorLiftId,
  PrimaryGoalId,
  SportId,
} from "@/services/onboarding/options";

const ALL_GOALS: readonly PrimaryGoalId[] = [
  "strength",
  "muscle_gain",
  "powerlifting",
  "strongman",
  "recomp",
  "general_fitness",
];

const BEGINNER_GOALS: readonly PrimaryGoalId[] = [
  "strength",
  "muscle_gain",
  "recomp",
  "general_fitness",
];

const BEGINNER_EQUIPMENT: readonly EquipmentId[] = [
  "barbell",
  "dumbbells",
  "rack",
  "bench",
  "machines",
  "bodyweight",
];

const POWERLIFTING_EQUIPMENT: readonly EquipmentId[] = [
  "barbell",
  "rack",
  "bench",
  "dumbbells",
];

const BODYBUILDING_EQUIPMENT: readonly EquipmentId[] = [
  "barbell",
  "dumbbells",
  "machines",
  "cables",
  "rack",
  "bench",
];

const STRONGMAN_EQUIPMENT: readonly EquipmentId[] = [
  "barbell",
  "specialty",
  "dumbbells",
  "kettlebells",
  "rack",
];

const SBD: readonly MajorLiftId[] = ["squat", "bench", "deadlift"];

export const ONBOARDING_PATH_CONFIGS: Record<
  OnboardingPathId,
  OnboardingPathConfig
> = {
  beginner: {
    id: "beginner",
    goalIds: BEGINNER_GOALS,
    experienceLevelIds: ["beginner"],
    detailSections: ["frequency", "equipment"],
    liftIds: [],
    sportIds: ["general_strength"],
    equipmentIds: BEGINNER_EQUIPMENT,
    seed: {
      primaryGoalId: null,
      experienceLevelId: "beginner",
      sports: [],
    },
    skipDetailsStep: false,
    enableCoachMode: false,
    redirectAfter: "/app/dashboard",
  },
  experienced: {
    id: "experienced",
    goalIds: ALL_GOALS,
    experienceLevelIds: ["intermediate", "advanced", "elite"],
    detailSections: [
      "sports",
      "frequency",
      "equipment",
      "lifts",
      "competition_date",
      "current_program",
      "history",
    ],
    liftIds: ["squat", "bench", "deadlift", "press"],
    sportIds: [
      "powerlifting",
      "bodybuilding",
      "strongman",
      "weightlifting",
      "general_strength",
      "hybrid",
    ],
    equipmentIds: [
      "barbell",
      "dumbbells",
      "rack",
      "bench",
      "machines",
      "cables",
      "kettlebells",
      "bodyweight",
      "specialty",
    ],
    seed: {
      primaryGoalId: null,
      experienceLevelId: null,
      sports: [],
    },
    skipDetailsStep: false,
    enableCoachMode: false,
    redirectAfter: "/app/dashboard",
  },
  powerlifter: {
    id: "powerlifter",
    goalIds: ["powerlifting", "strength"],
    experienceLevelIds: ["intermediate", "advanced", "elite", "beginner"],
    detailSections: [
      "frequency",
      "equipment",
      "lifts",
      "competition_date",
      "current_program",
      "history",
    ],
    liftIds: SBD,
    sportIds: ["powerlifting"],
    equipmentIds: POWERLIFTING_EQUIPMENT,
    seed: {
      primaryGoalId: "powerlifting",
      experienceLevelId: null,
      sports: ["powerlifting"],
    },
    skipDetailsStep: false,
    enableCoachMode: false,
    redirectAfter: "/app/dashboard",
  },
  bodybuilder: {
    id: "bodybuilder",
    goalIds: ["muscle_gain", "recomp", "strength"],
    experienceLevelIds: ["beginner", "intermediate", "advanced", "elite"],
    detailSections: [
      "frequency",
      "equipment",
      "current_program",
      "history",
      "body_metrics",
    ],
    liftIds: [],
    sportIds: ["bodybuilding"],
    equipmentIds: BODYBUILDING_EQUIPMENT,
    seed: {
      primaryGoalId: "muscle_gain",
      experienceLevelId: null,
      sports: ["bodybuilding"],
    },
    skipDetailsStep: false,
    enableCoachMode: false,
    redirectAfter: "/app/dashboard",
  },
  strongman: {
    id: "strongman",
    goalIds: ["strongman", "strength"],
    experienceLevelIds: ["beginner", "intermediate", "advanced", "elite"],
    detailSections: [
      "frequency",
      "equipment",
      "lifts",
      "competition_date",
      "current_program",
      "history",
    ],
    liftIds: ["deadlift", "press"],
    sportIds: ["strongman"],
    equipmentIds: STRONGMAN_EQUIPMENT,
    seed: {
      primaryGoalId: "strongman",
      experienceLevelId: null,
      sports: ["strongman"],
    },
    skipDetailsStep: false,
    enableCoachMode: false,
    redirectAfter: "/app/dashboard",
  },
  coach: {
    id: "coach",
    goalIds: ["general_fitness"],
    experienceLevelIds: [],
    detailSections: [],
    liftIds: [],
    sportIds: [],
    equipmentIds: [],
    seed: {
      primaryGoalId: "general_fitness",
      experienceLevelId: "advanced",
      sports: [],
    },
    skipDetailsStep: true,
    enableCoachMode: true,
    redirectAfter: "/app/coach",
  },
};

export function getOnboardingPathConfig(
  pathId: OnboardingPathId,
): OnboardingPathConfig {
  return ONBOARDING_PATH_CONFIGS[pathId];
}

export function getOnboardingPathVisibility(
  pathId: OnboardingPathId | null,
): OnboardingPathVisibility {
  if (!pathId) {
    return {
      showGoalStep: true,
      showExperienceStep: true,
      showDetailsStep: true,
      detailSections: [
        "sports",
        "frequency",
        "equipment",
        "body_metrics",
        "lifts",
        "history",
        "recovery",
      ],
      goalIds: ALL_GOALS,
      experienceLevelIds: [
        "beginner",
        "intermediate",
        "advanced",
        "elite",
      ],
      liftIds: ["squat", "bench", "deadlift", "press"],
      sportIds: [
        "powerlifting",
        "bodybuilding",
        "strongman",
        "weightlifting",
        "general_strength",
        "hybrid",
      ],
      equipmentIds: [
        "barbell",
        "dumbbells",
        "rack",
        "bench",
        "machines",
        "cables",
        "kettlebells",
        "bodyweight",
        "specialty",
      ],
    };
  }

  const config = getOnboardingPathConfig(pathId);
  return {
    showGoalStep: config.goalIds.length > 0 && !config.enableCoachMode,
    showExperienceStep: config.experienceLevelIds.length > 0,
    showDetailsStep: !config.skipDetailsStep && config.detailSections.length > 0,
    detailSections: config.detailSections,
    goalIds: config.goalIds,
    experienceLevelIds: config.experienceLevelIds,
    liftIds: config.liftIds,
    sportIds: config.sportIds,
    equipmentIds: config.equipmentIds,
  };
}

export function isDetailSectionVisible(
  pathId: OnboardingPathId | null,
  section: OnboardingDetailSection,
): boolean {
  return getOnboardingPathVisibility(pathId).detailSections.includes(section);
}

/**
 * Apply path seeds without inventing optional metrics.
 * Clears fields that become irrelevant for the new path.
 */
export function applyOnboardingPathSeed<T extends {
  pathId: OnboardingPathId | null;
  primaryGoalId: PrimaryGoalId | null;
  experienceLevelId: ExperienceLevelId | null;
  sports: SportId[];
  lifts: Partial<Record<MajorLiftId, number | null>>;
  competitionDate: string | null;
  currentProgramNote: string | null;
  recentHistory: string | null;
  recoveryHabits: string | null;
  bodyweightKg: number | null;
  heightCm: number | null;
  daysPerWeek: number | null;
  equipment: EquipmentId[];
}>(draft: T, pathId: OnboardingPathId): T {
  const config = getOnboardingPathConfig(pathId);
  const visibility = getOnboardingPathVisibility(pathId);

  const lifts: Partial<Record<MajorLiftId, number | null>> = {};
  if (visibility.detailSections.includes("lifts")) {
    for (const id of visibility.liftIds) {
      lifts[id] = draft.lifts[id] ?? null;
    }
  }

  return {
    ...draft,
    pathId,
    primaryGoalId: config.seed.primaryGoalId ?? draft.primaryGoalId,
    experienceLevelId:
      config.seed.experienceLevelId ??
      (visibility.experienceLevelIds.length === 1
        ? visibility.experienceLevelIds[0]!
        : draft.experienceLevelId),
    sports:
      config.seed.sports.length > 0
        ? [...config.seed.sports]
        : draft.sports.filter((s) => visibility.sportIds.includes(s)),
    equipment: draft.equipment.filter((e) =>
      visibility.equipmentIds.includes(e),
    ),
    lifts,
    competitionDate: visibility.detailSections.includes("competition_date")
      ? draft.competitionDate
      : null,
    currentProgramNote: visibility.detailSections.includes("current_program")
      ? draft.currentProgramNote
      : null,
    recentHistory: visibility.detailSections.includes("history")
      ? draft.recentHistory
      : null,
    recoveryHabits: visibility.detailSections.includes("recovery")
      ? draft.recoveryHabits
      : null,
    bodyweightKg: visibility.detailSections.includes("body_metrics")
      ? draft.bodyweightKg
      : null,
    heightCm: visibility.detailSections.includes("body_metrics")
      ? draft.heightCm
      : null,
    daysPerWeek: visibility.detailSections.includes("frequency")
      ? draft.daysPerWeek
      : null,
  };
}
