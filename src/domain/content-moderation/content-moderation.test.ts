import { describe, expect, it } from "vitest";
import {
  CONTENT_MODERATION_ACTIONS,
  CONTENT_MODERATION_HONESTY,
  CONTENT_MODERATION_TARGETS,
  nextReportStatusAfterAction,
  targetForRelatedType,
} from "@/domain/content-moderation";

describe("content moderation domain", () => {
  it("covers community, marketplace, coach profiles, and UGC", () => {
    expect(CONTENT_MODERATION_TARGETS).toEqual([
      "community",
      "marketplace",
      "coach_profile",
      "user_generated_content",
    ]);
  });

  it("supports report, review, remove, suspend", () => {
    expect(CONTENT_MODERATION_ACTIONS).toEqual(
      expect.arrayContaining(["report", "review", "remove", "suspend"]),
    );
  });

  it("maps related types to targets", () => {
    expect(targetForRelatedType("community_question")).toBe("community");
    expect(targetForRelatedType("program_listing")).toBe("marketplace");
    expect(targetForRelatedType("coach_marketplace_profile")).toBe(
      "coach_profile",
    );
    expect(targetForRelatedType("message")).toBe("user_generated_content");
  });

  it("advances report lifecycle honestly", () => {
    expect(nextReportStatusAfterAction("review", "open")).toBe("in_review");
    expect(nextReportStatusAfterAction("remove", "in_review")).toBe("resolved");
    expect(nextReportStatusAfterAction("suspend", "open")).toBe("resolved");
    expect(nextReportStatusAfterAction("dismiss", "open")).toBe("dismissed");
    expect(CONTENT_MODERATION_HONESTY[0]).toMatch(/never invents reports/i);
  });
});
