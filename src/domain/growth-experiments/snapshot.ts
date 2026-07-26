import {
  GROWTH_DENYLIST_EXAMPLES,
  GROWTH_EXPERIMENT_ENGINE_VERSION,
  GROWTH_EXPERIMENT_HONESTY,
  GROWTH_EXPERIMENTS,
  GROWTH_MIN_SAMPLE_PER_ARM,
  GROWTH_ALLOWLIST_SURFACES,
  GROWTH_DENYLIST_CATEGORIES,
} from "@/domain/growth-experiments/constants";
import {
  listRunningGrowthExperiments,
  summarizeExperimentOutcomes,
  type ExperimentOutcomeReport,
} from "@/domain/growth-experiments/assign";

export type GrowthExperimentSnapshot = {
  engineVersion: typeof GROWTH_EXPERIMENT_ENGINE_VERSION;
  honesty: typeof GROWTH_EXPERIMENT_HONESTY;
  allowlist: typeof GROWTH_ALLOWLIST_SURFACES;
  denylist: typeof GROWTH_DENYLIST_CATEGORIES;
  denylistExamples: typeof GROWTH_DENYLIST_EXAMPLES;
  experiments: typeof GROWTH_EXPERIMENTS;
  minSamplePerArm: number;
  runningCount: number;
  outcomeReports: ExperimentOutcomeReport[];
  generatedAt: string;
};

export function buildGrowthExperimentSnapshot(
  armCounts: Array<{
    experimentId: string;
    arms: Array<{ armId: string; exposures: number; conversions: number }>;
  }> = [],
  generatedAt: string = new Date().toISOString(),
): GrowthExperimentSnapshot {
  const reports = listRunningGrowthExperiments().map((exp) => {
    const counts = armCounts.find((c) => c.experimentId === exp.id);
    return summarizeExperimentOutcomes({
      experimentId: exp.id,
      arms:
        counts?.arms ??
        exp.arms.map((a) => ({
          armId: a.id,
          exposures: 0,
          conversions: 0,
        })),
    });
  });

  return {
    engineVersion: GROWTH_EXPERIMENT_ENGINE_VERSION,
    honesty: GROWTH_EXPERIMENT_HONESTY,
    allowlist: GROWTH_ALLOWLIST_SURFACES,
    denylist: GROWTH_DENYLIST_CATEGORIES,
    denylistExamples: GROWTH_DENYLIST_EXAMPLES,
    experiments: GROWTH_EXPERIMENTS,
    minSamplePerArm: GROWTH_MIN_SAMPLE_PER_ARM,
    runningCount: listRunningGrowthExperiments().length,
    outcomeReports: reports,
    generatedAt,
  };
}
