import type {
  OnboardingDetailSection,
  OnboardingPathId,
} from "@/domain/onboarding-paths/constants";
import type {
  EquipmentId,
  ExperienceLevelId,
  MajorLiftId,
  PrimaryGoalId,
  SportId,
} from "@/services/onboarding/options";

export type OnboardingPathConfig = {
  id: OnboardingPathId;
  /** Goals shown on the goal step. */
  goalIds: readonly PrimaryGoalId[];
  /** Experience levels shown (empty = skip step and use seed). */
  experienceLevelIds: readonly ExperienceLevelId[];
  /** Optional detail sections for this path. */
  detailSections: readonly OnboardingDetailSection[];
  /** Lift inputs when lifts section is shown. */
  liftIds: readonly MajorLiftId[];
  /** Sports when sports section is shown. */
  sportIds: readonly SportId[];
  /** Equipment when equipment section is shown. */
  equipmentIds: readonly EquipmentId[];
  /** Deterministic seeds applied when the path is chosen. */
  seed: {
    primaryGoalId: PrimaryGoalId | null;
    experienceLevelId: ExperienceLevelId | null;
    sports: SportId[];
  };
  /** Skip athlete optional-details step entirely. */
  skipDetailsStep: boolean;
  /** Enable Coach Mode after profile build. */
  enableCoachMode: boolean;
  /** Post-onboarding redirect (default dashboard). */
  redirectAfter: "/app/dashboard" | "/app/coach";
};

export type OnboardingPathVisibility = {
  showGoalStep: boolean;
  showExperienceStep: boolean;
  showDetailsStep: boolean;
  detailSections: readonly OnboardingDetailSection[];
  goalIds: readonly PrimaryGoalId[];
  experienceLevelIds: readonly ExperienceLevelId[];
  liftIds: readonly MajorLiftId[];
  sportIds: readonly SportId[];
  equipmentIds: readonly EquipmentId[];
};
