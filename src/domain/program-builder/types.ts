import type {
  FitDays,
  FitEquipment,
  FitExperience,
  FitGoal,
  FitSession,
} from "@/domain/fit/types";
import type { ProgressionRuleKind } from "@/domain/programming/constants";
import type {
  ProgramBuilderPriorityLift,
} from "@/domain/program-builder/constants";

export type ProgramBuilderInputs = {
  goal: FitGoal;
  days: FitDays;
  session: FitSession;
  equipment: FitEquipment;
  experience: FitExperience;
  priorityLifts: ProgramBuilderPriorityLift[];
};

export type ProgramBuilderExerciseRole =
  | "priority"
  | "secondary"
  | "accessory";

export type ProgramBuilderDraftExercise = {
  slug: string;
  name: string;
  role: ProgramBuilderExerciseRole;
  targetSets: number;
  /** Structured rep prescription from tables — not free-form AI. */
  targetReps: string;
  rpeTarget: number | null;
  whyChosen: string;
};

export type ProgramBuilderDraftDay = {
  dayIndex: number;
  name: string;
  focus: string;
  exercises: ProgramBuilderDraftExercise[];
};

export type ProgramBuilderDraftWeek = {
  weekNumber: number;
  isDeload: boolean;
  days: ProgramBuilderDraftDay[];
};

export type ProgramBuilderWhyEntry = {
  slug: string;
  name: string;
  reason: string;
  ruleIds: string[];
};

export type ProgramBuilderProgression = {
  ruleKind: ProgressionRuleKind;
  scope: "program" | "exercise";
  exerciseSlug: string | null;
  summary: string;
  params: Record<string, string | number | boolean>;
};

export type ProgramBuilderDeloadStrategy = {
  cadenceWeeks: number;
  loadReductionPct: number;
  setsDelta: number;
  summary: string;
};

export type ProgramBuilderAdjustmentRule = {
  id: string;
  when: string;
  action: string;
  summary: string;
};

export type ProgramBuilderDraft = {
  engineVersion: string;
  status: "draft" | "user_edited";
  autoApply: false;
  inputs: ProgramBuilderInputs;
  title: string;
  weeks: ProgramBuilderDraftWeek[];
  whyExercises: ProgramBuilderWhyEntry[];
  progression: ProgramBuilderProgression[];
  deloadStrategy: ProgramBuilderDeloadStrategy;
  adjustmentRules: ProgramBuilderAdjustmentRule[];
  volumeSource: {
    tableId: string;
    band: FitExperience;
    weeklyHardSetBudget: number;
    weeklyHardSetsPlanned: number;
  };
  missingInformation: string[];
  disclaimers: readonly string[];
};

export type ProgramBuilderExerciseEdit = {
  dayIndex: number;
  exerciseSlug: string;
  targetSets?: number;
  targetReps?: string;
};
