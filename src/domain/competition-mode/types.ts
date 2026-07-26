/**
 * Competition Preparation Mode types (Prompt 70).
 */

export type CompetitionSport =
  | "powerlifting"
  | "deadlift_only"
  | "strongman";

export type CompetitionPhaseId =
  | "build"
  | "intensification"
  | "peaking"
  | "taper"
  | "meet_week"
  | "post_meet";

export type WeightCutStance =
  | "not_applicable"
  | "on_or_under"
  | "negligible_gap"
  | "discuss_gradual"
  | "high_risk_no_protocol"
  | "insufficient_data";

export type CompetitionTargetLifts = {
  squatKg: number | null;
  benchKg: number | null;
  deadliftKg: number | null;
  notes: string | null;
};

export type CompetitionDefinition = {
  id: string;
  sport: CompetitionSport;
  name: string | null;
  competitionDate: Date;
  weightClassLabel: string | null;
  weightClassLimitKg: number | null;
  targets: CompetitionTargetLifts;
  status: string;
};

export type LiftEstimateKg = {
  lift: "squat" | "bench" | "deadlift";
  rangeKg: { low: number; high: number } | null;
};

export type HeavySessionSignal = {
  at: Date;
  exerciseLabel: string;
  loadKg: number;
  reps: number;
  rpe: number | null;
};

export type BodyweightSignal = {
  latestKg: number | null;
  kgPerWeek: number | null;
  sampleCount: number;
};

export type ReadinessSignal = {
  latest: number | null;
  confidence: string | null;
  fatigue: number | null;
};

export type CompetitionModeSignals = {
  competition: CompetitionDefinition;
  liftEstimates: LiftEstimateKg[];
  lastHeavySession: HeavySessionSignal | null;
  bodyweight: BodyweightSignal;
  readiness: ReadinessSignal;
};

export type AttemptPlan = {
  lift: "squat" | "bench" | "deadlift";
  label: string;
  targetThirdKg: number | null;
  openerKg: number | null;
  secondKg: number | null;
  thirdKg: number | null;
  basis: string;
};

export type TaperGuidance = {
  phaseId: CompetitionPhaseId;
  headline: string;
  bullets: string[];
  /** Always true — taper notes are illustrative, never auto-applied. */
  illustrativeOnly: true;
};

export type WeightCutGuidance = {
  stance: WeightCutStance;
  headline: string;
  detail: string;
  gapKg: number | null;
  safetyWarnings: string[];
  /** Hard rule: never an automatic dehydration prescription. */
  autoPrescribesDehydration: false;
};

export type CompetitionModeView = {
  competition: {
    id: string;
    sport: CompetitionSport;
    sportLabel: string;
    name: string | null;
    competitionDate: string;
    weightClassLabel: string | null;
    weightClassLimitKg: number | null;
    targets: CompetitionTargetLifts;
  };
  countdown: {
    days: number;
    label: string;
    past: boolean;
  };
  trainingPhase: {
    id: CompetitionPhaseId;
    label: string;
    summary: string;
  };
  lastHeavySession: {
    at: string;
    exerciseLabel: string;
    summary: string;
  } | null;
  taper: TaperGuidance;
  attemptPlans: AttemptPlan[];
  bodyweightTrend: {
    latestKg: number | null;
    kgPerWeek: number | null;
    summary: string;
  };
  readiness: {
    latest: number | null;
    fatigue: number | null;
    summary: string;
  };
  weightCut: WeightCutGuidance;
  strongmanNotice: string | null;
  honestyNotes: string[];
  generatedAt: string;
};
