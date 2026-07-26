import { describe, expect, it } from "vitest";
import {
  CREATOR_CAPABILITIES,
  CREATOR_HONESTY,
  CREATOR_NO_PARTNERSHIP_PROMISE,
  creatorRoleLabel,
  hasCreatorCapability,
  isCreatorPartnershipApproved,
  resolveCreatorCapabilities,
} from "@/domain/creator-program";

describe("creator program domain", () => {
  it("catalogs technique score, programs, content, and referral revenue", () => {
    expect(CREATOR_CAPABILITIES).toEqual([
      "share_technique_score",
      "publish_programs",
      "share_content",
      "earn_referral_revenue",
    ]);
  });

  it("does not imply partnership until approved", () => {
    expect(creatorRoleLabel("pending")).toBe("Creator applicant");
    expect(creatorRoleLabel("approved")).toBe("Creator partner");
    expect(CREATOR_NO_PARTNERSHIP_PROMISE).toMatch(/does not mean/i);
    expect(CREATOR_HONESTY[0]).toMatch(/does not mean you are a partner/i);
  });

  it("unlocks capabilities only when approved", () => {
    expect(isCreatorPartnershipApproved("pending")).toBe(false);
    expect(isCreatorPartnershipApproved("approved")).toBe(true);
    expect(resolveCreatorCapabilities("pending")).toEqual([]);
    expect(resolveCreatorCapabilities("rejected")).toEqual([]);
    expect(resolveCreatorCapabilities("approved")).toEqual([
      ...CREATOR_CAPABILITIES,
    ]);
    expect(hasCreatorCapability("pending", "share_technique_score")).toBe(
      false,
    );
    expect(hasCreatorCapability("approved", "earn_referral_revenue")).toBe(
      true,
    );
  });
});
