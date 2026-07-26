import { z } from "zod";
import { ONBOARDING_PATH_IDS } from "@/domain/onboarding-paths";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  MAJOR_LIFTS,
  PRIMARY_GOALS,
  SPORTS,
  type OnboardingDraft,
} from "@/services/onboarding/options";

const goalIds = PRIMARY_GOALS.map((item) => item.id) as [
  (typeof PRIMARY_GOALS)[number]["id"],
  ...(typeof PRIMARY_GOALS)[number]["id"][],
];
const experienceIds = EXPERIENCE_LEVELS.map((item) => item.id) as [
  (typeof EXPERIENCE_LEVELS)[number]["id"],
  ...(typeof EXPERIENCE_LEVELS)[number]["id"][],
];
const sportIds = SPORTS.map((item) => item.id) as [
  (typeof SPORTS)[number]["id"],
  ...(typeof SPORTS)[number]["id"][],
];
const equipmentIds = EQUIPMENT_OPTIONS.map((item) => item.id) as [
  (typeof EQUIPMENT_OPTIONS)[number]["id"],
  ...(typeof EQUIPMENT_OPTIONS)[number]["id"][],
];
const pathIds = ONBOARDING_PATH_IDS as unknown as [
  (typeof ONBOARDING_PATH_IDS)[number],
  ...(typeof ONBOARDING_PATH_IDS)[number][],
];

export const onboardingDraftSchema = z.object({
  pathId: z.enum(pathIds).nullable().optional(),
  primaryGoalId: z.enum(goalIds),
  experienceLevelId: z.enum(experienceIds),
  sports: z.array(z.enum(sportIds)).default([]),
  daysPerWeek: z.number().int().min(1).max(7).nullable(),
  equipment: z.array(z.enum(equipmentIds)).default([]),
  bodyweightKg: z.number().positive().max(400).nullable(),
  heightCm: z.number().positive().max(275).nullable(),
  lifts: z
    .object({
      squat: z.number().positive().max(1000).nullable().optional(),
      bench: z.number().positive().max(1000).nullable().optional(),
      deadlift: z.number().positive().max(1000).nullable().optional(),
      press: z.number().positive().max(1000).nullable().optional(),
    })
    .default({}),
  competitionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  currentProgramNote: z.string().max(2000).nullable().optional(),
  recentHistory: z.string().max(2000).nullable(),
  recoveryHabits: z.string().max(2000).nullable(),
  painCautionAcknowledged: z.literal(true),
  movementNotes: z.string().max(2000).nullable(),
});

export type OnboardingPayload = z.infer<typeof onboardingDraftSchema>;

export function toOnboardingDraft(payload: OnboardingPayload): OnboardingDraft {
  const lifts: OnboardingDraft["lifts"] = {};
  for (const lift of MAJOR_LIFTS) {
    const value = payload.lifts[lift.id];
    lifts[lift.id] = value ?? null;
  }

  return {
    pathId: payload.pathId ?? null,
    primaryGoalId: payload.primaryGoalId,
    experienceLevelId: payload.experienceLevelId,
    sports: payload.sports,
    daysPerWeek: payload.daysPerWeek,
    equipment: payload.equipment,
    bodyweightKg: payload.bodyweightKg,
    heightCm: payload.heightCm,
    lifts,
    competitionDate: payload.competitionDate ?? null,
    currentProgramNote: payload.currentProgramNote ?? null,
    recentHistory: payload.recentHistory,
    recoveryHabits: payload.recoveryHabits,
    painCautionAcknowledged: payload.painCautionAcknowledged,
    movementNotes: payload.movementNotes,
  };
}
