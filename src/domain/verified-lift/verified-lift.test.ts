import { describe, expect, it } from "vitest";
import {
  canSubmitForManualReview,
  displayLevelLabel,
  isOfficiallyVerified,
  levelAfterApproval,
  meetsVideoSubmittedCriteria,
  resolveLiftVerificationBadges,
  type LiftClaimEvidenceInput,
} from "@/domain/verified-lift";

function base(
  overrides: Partial<LiftClaimEvidenceInput> = {},
): LiftClaimEvidenceInput {
  return {
    level: "self_reported",
    reviewStatus: "none",
    hasVideoEvidence: false,
    metadata: { performedAt: "2026-07-01" },
    loadKg: 180,
    reps: 1,
    ...overrides,
  };
}

describe("verified lift criteria", () => {
  it("never marks self-reported as officially verified", () => {
    expect(isOfficiallyVerified(base())).toBe(false);
    expect(displayLevelLabel(base())).toBe("Self-reported");
  });

  it("video submitted with evidence is not officially verified", () => {
    const input = base({
      level: "video_submitted",
      hasVideoEvidence: true,
    });
    expect(meetsVideoSubmittedCriteria(input)).toBe(true);
    expect(isOfficiallyVerified(input)).toBe(false);
    expect(displayLevelLabel(input)).toBe("Video submitted");
    const badges = resolveLiftVerificationBadges(input);
    expect(badges.map((b) => b.id)).toEqual(["video_submitted"]);
    expect(badges.some((b) => b.id === "officially_verified")).toBe(false);
  });

  it("requires meet metadata + approval for officially verified", () => {
    const incomplete = base({
      level: "competition_verified",
      reviewStatus: "approved",
      hasVideoEvidence: true,
      metadata: { performedAt: "2026-07-01", meetName: "Local Open" },
    });
    expect(isOfficiallyVerified(incomplete)).toBe(false);

    const complete = base({
      level: "competition_verified",
      reviewStatus: "approved",
      hasVideoEvidence: true,
      metadata: {
        performedAt: "2026-07-01",
        meetName: "Local Open",
        meetDate: "2026-06-15",
        federation: "IPF",
      },
    });
    expect(isOfficiallyVerified(complete)).toBe(true);
    expect(displayLevelLabel(complete)).toContain("Officially verified");
    const badges = resolveLiftVerificationBadges(complete);
    expect(badges.some((b) => b.id === "officially_verified")).toBe(true);
  });

  it("blocks competition review without meet metadata", () => {
    const result = canSubmitForManualReview(
      base({ hasVideoEvidence: true }),
      "competition_verified",
    );
    expect(result.ok).toBe(false);
  });

  it("allows competition review with video + meet metadata", () => {
    const result = canSubmitForManualReview(
      base({
        hasVideoEvidence: true,
        metadata: {
          performedAt: "2026-07-01",
          meetName: "State Champs",
          meetDate: "2026-05-01",
          federation: "USAPL",
        },
      }),
      "competition_verified",
    );
    expect(result).toEqual({ ok: true });
  });

  it("does not grant competition_verified on approve without criteria", () => {
    const level = levelAfterApproval(
      base({
        hasVideoEvidence: true,
        metadata: { performedAt: "2026-07-01" },
      }),
      "competition_verified",
    );
    expect(level).toBe("video_submitted");
  });

  it("grants competition_verified only when criteria hold on approve", () => {
    const level = levelAfterApproval(
      base({
        hasVideoEvidence: true,
        metadata: {
          performedAt: "2026-07-01",
          meetName: "Nationals",
          meetDate: "2026-04-01",
          federation: "IPF",
        },
      }),
      "competition_verified",
    );
    expect(level).toBe("competition_verified");
  });
});
