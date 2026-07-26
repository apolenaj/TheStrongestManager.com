import { describe, expect, it } from "vitest";
import {
  applyVoteDelta,
  buildDiscussionAiSummary,
  canAcceptAnswer,
  isHumanAnswerAuthorship,
  nextAnswerStatusAfterModeration,
  QA_CATEGORIES,
  shouldShowExpertBadge,
} from "@/domain/community-qa";

describe("community knowledge Q&A", () => {
  it("covers required categories", () => {
    expect(QA_CATEGORIES).toEqual([
      "technique",
      "programming",
      "powerlifting",
      "bodybuilding",
      "strongman",
      "nutrition",
      "recovery",
    ]);
  });

  it("never treats AI as human answer authorship", () => {
    expect(isHumanAnswerAuthorship("human_athlete")).toBe(true);
    expect(isHumanAnswerAuthorship("human_coach")).toBe(true);
    expect(isHumanAnswerAuthorship("ai_engine")).toBe(false);
  });

  it("labels AI summaries as AI-generated", () => {
    const summary = buildDiscussionAiSummary({
      questionTitle: "Cue for hip hinge?",
      questionBody: "Losing lumbar position.",
      answers: [
        { body: "Film from the side and brace before the pull.", isExpert: true, score: 3 },
      ],
    });
    expect(summary.isAiGenerated).toBe(true);
    expect(summary.label).toBe("AI summary");
    expect(summary.body).toMatch(/AI overview/i);
  });

  it("shows Expert badge only with verified Expert Contributor role", () => {
    expect(
      shouldShowExpertBadge({ hasVerifiedExpertContributor: false }),
    ).toBe(false);
    expect(
      shouldShowExpertBadge({ hasVerifiedExpertContributor: true }),
    ).toBe(true);
  });

  it("applies vote deltas and accept rules", () => {
    expect(applyVoteDelta(0, null, 1)).toBe(1);
    expect(applyVoteDelta(1, 1, -1)).toBe(-1);
    expect(
      canAcceptAnswer({
        questionAuthorProfileId: "a",
        actorProfileId: "a",
        answerStatus: "published",
        answerAuthorship: "human_athlete",
      }),
    ).toBe(true);
    expect(
      canAcceptAnswer({
        questionAuthorProfileId: "a",
        actorProfileId: "b",
        answerStatus: "published",
        answerAuthorship: "human_athlete",
      }),
    ).toBe(false);
  });

  it("supports moderation hide/restore", () => {
    expect(nextAnswerStatusAfterModeration("hide", "published")).toBe("hidden");
    expect(nextAnswerStatusAfterModeration("restore", "hidden")).toBe(
      "published",
    );
  });
});
