export {
  ONBOARDING_PATH_ENGINE_VERSION,
  ONBOARDING_PATH_IDS,
  ONBOARDING_PATH_OPTIONS,
  ONBOARDING_DETAIL_SECTIONS,
  ONBOARDING_PATH_HONESTY,
  isOnboardingPathId,
} from "@/domain/onboarding-paths/constants";
export type {
  OnboardingPathId,
  OnboardingDetailSection,
} from "@/domain/onboarding-paths/constants";

export type {
  OnboardingPathConfig,
  OnboardingPathVisibility,
} from "@/domain/onboarding-paths/types";

export {
  ONBOARDING_PATH_CONFIGS,
  getOnboardingPathConfig,
  getOnboardingPathVisibility,
  isDetailSectionVisible,
  applyOnboardingPathSeed,
} from "@/domain/onboarding-paths/paths";
