import { featureFlags } from "@/config/feature-flags";
import {
  buildAthleteAssessmentSnapshot,
  buildPartialAthleteProfile,
  type AthleteAssessmentAnswers,
  type AthleteAssessmentSnapshot,
  type PartialAthleteProfile,
} from "@/domain/athlete-assessment";
import {
  createAthleteAssessmentTicket,
  verifyAthleteAssessmentTicket,
} from "@/services/athlete-assessment/ticket";

export function getAthleteAssessmentSnapshot(): AthleteAssessmentSnapshot {
  return buildAthleteAssessmentSnapshot();
}

export function isAthleteAssessmentEnabled(): boolean {
  return featureFlags.athleteAssessment;
}

export function claimAthleteAssessmentTicket() {
  return createAthleteAssessmentTicket();
}

export function validateAthleteAssessmentTicket(token: string) {
  return verifyAthleteAssessmentTicket(token);
}

export function partialProfileFromAnswers(
  answers: AthleteAssessmentAnswers,
): PartialAthleteProfile {
  return buildPartialAthleteProfile(answers);
}

export {
  createAthleteAssessmentTicket,
  verifyAthleteAssessmentTicket,
} from "@/services/athlete-assessment/ticket";
