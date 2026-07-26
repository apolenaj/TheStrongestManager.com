import type {
  PowerliftingDashboardPriority,
  PowerliftingLift,
  PowerliftingTrainingFocus,
} from "@/domain/powerlifting-mode/constants";

export type PowerliftingLiftCard = {
  lift: PowerliftingLift;
  label: string;
  /** Best reported / targeted load in kg when known. */
  loadKg: number | null;
  source: "target" | "reported_pr" | "estimate" | "missing";
  href: string;
};

export type PowerliftingPriorityCard = {
  id: PowerliftingDashboardPriority;
  label: string;
  headline: string;
  detail: string;
  href: string | null;
  /** Numeric display when honest (kg or days). */
  metricValue: number | null;
  metricUnit: string | null;
  available: boolean;
  missingNote: string | null;
};

export type PowerliftingTrainingCard = {
  id: PowerliftingTrainingFocus;
  label: string;
  headline: string;
  detail: string;
  href: string;
  cues?: string[];
};

export type PowerliftingTechniqueEntry = {
  slug: string;
  label: string;
  lift: PowerliftingLift;
  href: string;
};

export type PowerliftingModePayload = {
  engineVersion: string;
  generatedAtIso: string;
  /** Federation intentionally unset until selection ships. */
  federation: {
    selectedId: null;
    selectionAvailableLater: true;
    note: string;
  };
  lifts: PowerliftingLiftCard[];
  /** Raw total = sum of known lift loads when all three present; else null. */
  totalKg: number | null;
  totalSource: "complete" | "partial" | "missing";
  relativeScore: {
    /** True when a cited calculator exists (DOTS). Still no invented inline score. */
    available: boolean;
    systemsDeferred: readonly string[];
    reason: string;
  };
  priorities: PowerliftingPriorityCard[];
  training: PowerliftingTrainingCard[];
  techniqueLibrary: PowerliftingTechniqueEntry[];
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
    weightClassLabel: string | null;
    weightClassLimitKg: number | null;
    phaseLabel: string | null;
  };
  honesty: readonly string[];
};

export type PowerliftingModeSignals = {
  now: Date;
  lifts: {
    squatKg: number | null;
    benchKg: number | null;
    deadliftKg: number | null;
    squatSource: PowerliftingLiftCard["source"];
    benchSource: PowerliftingLiftCard["source"];
    deadliftSource: PowerliftingLiftCard["source"];
  };
  competition: {
    hasPrep: boolean;
    name: string | null;
    dateIso: string | null;
    daysUntil: number | null;
    weightClassLabel: string | null;
    weightClassLimitKg: number | null;
    phaseLabel: string | null;
  };
};
