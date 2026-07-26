import {
  SESSION_CHECKIN_FIELDS,
  SESSION_CHECKIN_FIELD_LABELS,
  SESSION_READINESS_ENGINE_VERSION,
  SESSION_READINESS_FORBIDDEN,
  SESSION_READINESS_HONESTY,
  SESSION_READINESS_RECOMMENDATIONS,
  SESSION_READINESS_RECOMMENDATION_DETAILS,
  SESSION_READINESS_RECOMMENDATION_LABELS,
  SESSION_REVIEW_LOAD_MIN_CONCERNS,
} from "@/domain/session-readiness-adjuster/constants";
import type { SessionReadinessAdjusterSnapshot } from "@/domain/session-readiness-adjuster/types";

export function buildSessionReadinessAdjusterSnapshot(
  generatedAt: string = new Date().toISOString(),
): SessionReadinessAdjusterSnapshot {
  return {
    engineVersion: SESSION_READINESS_ENGINE_VERSION,
    honesty: SESSION_READINESS_HONESTY,
    recommendations: SESSION_READINESS_RECOMMENDATIONS.map((id) => ({
      id,
      label: SESSION_READINESS_RECOMMENDATION_LABELS[id],
      detail: SESSION_READINESS_RECOMMENDATION_DETAILS[id],
    })),
    checkInFields: SESSION_CHECKIN_FIELDS.map((id) => ({
      id,
      label: SESSION_CHECKIN_FIELD_LABELS[id],
    })),
    forbidden: SESSION_READINESS_FORBIDDEN,
    reviewLoadMinConcerns: SESSION_REVIEW_LOAD_MIN_CONCERNS,
    docPath: "docs/SESSION_READINESS_ADJUSTER.md",
    generatedAt,
  };
}
