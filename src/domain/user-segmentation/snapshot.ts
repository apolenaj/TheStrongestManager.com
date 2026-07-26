import {
  USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
  USER_SEGMENTATION_ENGINE_VERSION,
  USER_SEGMENTATION_HONESTY,
  USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS,
  USER_SEGMENTATION_SENSITIVE_DENYLIST,
  USER_SEGMENTS,
} from "@/domain/user-segmentation/constants";
import {
  summarizeUserSegmentationCohort,
  type UserSegmentationCohortSummary,
  type UserSegmentationResult,
} from "@/domain/user-segmentation/evaluate";

export type UserSegmentationSnapshot = {
  engineVersion: typeof USER_SEGMENTATION_ENGINE_VERSION;
  honesty: typeof USER_SEGMENTATION_HONESTY;
  segments: typeof USER_SEGMENTS;
  sensitiveDenylist: typeof USER_SEGMENTATION_SENSITIVE_DENYLIST;
  cohortDays: number;
  engagementWindowDays: number;
  cohort: UserSegmentationCohortSummary;
  sampleAthletes: UserSegmentationResult[];
  generatedAt: string;
};

export function buildUserSegmentationSnapshot(input: {
  cohortDays?: number;
  results: UserSegmentationResult[];
  generatedAt?: string;
}): UserSegmentationSnapshot {
  return {
    engineVersion: USER_SEGMENTATION_ENGINE_VERSION,
    honesty: USER_SEGMENTATION_HONESTY,
    segments: USER_SEGMENTS,
    sensitiveDenylist: USER_SEGMENTATION_SENSITIVE_DENYLIST,
    cohortDays: input.cohortDays ?? USER_SEGMENTATION_DEFAULT_COHORT_DAYS,
    engagementWindowDays: USER_SEGMENTATION_HIGH_ENGAGEMENT_WINDOW_DAYS,
    cohort: summarizeUserSegmentationCohort(input.results),
    sampleAthletes: input.results.slice(0, 25),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
  };
}
