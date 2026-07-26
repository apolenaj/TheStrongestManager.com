import { describe, expect, it } from "vitest";
import {
  DATA_MOAT_HONESTY,
  DATA_MOAT_MIN_COHORT_SIZE,
  athleteEligibleForInsight,
  cohortPublishable,
  emptyConsentScopes,
  sanitizeMoatOutputProps,
  toAnonymizedCohortStat,
  type DataMoatConsentRecord,
} from "@/domain/data-moat";
import { DATA_MOAT_POLICY_VERSION } from "@/domain/data-moat/constants";

const optedIn: DataMoatConsentRecord = {
  optedIn: true,
  scopes: {
    ...emptyConsentScopes(),
    training_aggregates: true,
    technique_aggregates: true,
  },
  policyVersion: DATA_MOAT_POLICY_VERSION,
  consentedAt: new Date(),
  revokedAt: null,
};

describe("data moat consent & anonymization", () => {
  it("defaults to ineligible without consent", () => {
    expect(
      athleteEligibleForInsight({
        consent: null,
        insightKind: "technique_patterns",
      }),
    ).toBe(false);
    expect(
      athleteEligibleForInsight({
        consent: {
          ...optedIn,
          optedIn: false,
        },
        insightKind: "technique_patterns",
      }),
    ).toBe(false);
  });

  it("requires matching scopes per insight kind", () => {
    expect(
      athleteEligibleForInsight({
        consent: optedIn,
        insightKind: "technique_patterns",
      }),
    ).toBe(true);
    expect(
      athleteEligibleForInsight({
        consent: optedIn,
        insightKind: "exercise_response",
      }),
    ).toBe(false);
  });

  it("enforces k-anonymity floor", () => {
    expect(cohortPublishable(DATA_MOAT_MIN_COHORT_SIZE - 1)).toBe(false);
    expect(cohortPublishable(DATA_MOAT_MIN_COHORT_SIZE)).toBe(true);
    const row = toAnonymizedCohortStat({
      insightKind: "training_outcomes",
      cohortKey: "squat:week_2026_29",
      cohortSize: 3,
      stats: { meanAdherence: 0.7 },
    });
    expect(row.suppressed).toBe(true);
    expect(row.cohortSize).toBe(0);
  });

  it("rejects identifiable keys in outputs", () => {
    const bad = sanitizeMoatOutputProps({
      meanScore: 72,
      email: "x@y.com",
      athleteProfileId: "abc",
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.rejectedKeys).toContain("email");
      expect(bad.rejectedKeys).toContain("athleteProfileId");
    }
  });

  it("states non-surveillance honesty", () => {
    expect(DATA_MOAT_HONESTY.join(" ")).toMatch(/not surveillance/i);
  });
});
