import type {
  BodybuildingDashboardPriority,
  BodybuildingSupportModule,
} from "@/domain/bodybuilding-mode/constants";

export type MuscleWorkloadRow = {
  muscleKey: string;
  label: string;
  /** Sets whose primary muscles include this key (observed). */
  setCount: number;
  volumeKg: number;
};

export type ExerciseProgressionRow = {
  exerciseId: string;
  exerciseName: string;
  setCount: number;
  volumeKg: number;
  /** Latest logged top set load when known. */
  latestLoadKg: number | null;
  priorLoadKg: number | null;
  /** Qualitative only — never a growth %. */
  trend: "up" | "stable" | "down" | "insufficient";
  href: string | null;
};

export type BodybuildingPriorityCard = {
  id: BodybuildingDashboardPriority;
  label: string;
  headline: string;
  detail: string;
  href: string | null;
  metricValue: number | null;
  metricUnit: string | null;
  available: boolean;
  missingNote: string | null;
};

export type BodybuildingSupportCard = {
  id: BodybuildingSupportModule;
  label: string;
  headline: string;
  detail: string;
  href: string | null;
  available: boolean;
};

export type BodybuildingModePayload = {
  engineVersion: string;
  lookbackDays: number;
  generatedAtIso: string;
  priorities: BodybuildingPriorityCard[];
  muscleWorkload: MuscleWorkloadRow[];
  exerciseProgression: ExerciseProgressionRow[];
  support: BodybuildingSupportCard[];
  weeklyVolume: {
    volumeKg: number;
    setCount: number;
    hardSetCount: number;
    sessionCount: number;
  };
  bodyweight: {
    latestKg: number | null;
    priorKg: number | null;
    sampleCount: number;
  };
  photos: {
    enabled: false;
    privateByDefault: true;
    bodyFatFromPhotos: false;
    note: string;
  };
  /** Explicit: no fake growth metric. */
  muscleGrowthScore: {
    available: false;
    reason: string;
  };
  honesty: readonly string[];
};

export type BodybuildingModeSignals = {
  now: Date;
  lookbackDays: number;
  /** Sets attributed to primary muscles in the window. */
  muscleSets: Array<{
    muscleKey: string;
    setCount: number;
    volumeKg: number;
  }>;
  exercises: Array<{
    exerciseId: string;
    exerciseName: string;
    slug: string | null;
    setCount: number;
    volumeKg: number;
    latestLoadKg: number | null;
    priorLoadKg: number | null;
  }>;
  weeklyVolume: {
    volumeKg: number;
    setCount: number;
    hardSetCount: number;
    sessionCount: number;
  };
  bodyweight: {
    latestKg: number | null;
    priorKg: number | null;
    sampleCount: number;
  };
  recovery: {
    hasRecentEntry: boolean;
    latestReadiness: number | null;
  };
};
