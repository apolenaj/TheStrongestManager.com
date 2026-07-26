import { describe, expect, it } from "vitest";
import {
  canPublishExpertArticle,
  expertArticleJsonLd,
  expertPersonJsonLd,
  isVerifiedExpertContributor,
  resolveContributorRoles,
  shouldShowExpertContributorBadge,
} from "@/domain/expert-contributor";

describe("expert contributor system", () => {
  it("never auto-labels Expert from coach or verified credentials alone", () => {
    expect(
      resolveContributorRoles({
        isCoach: true,
        hasVerifiedCoachCredential: true,
        expertVerificationStatus: "none",
      }),
    ).toEqual(["coach", "verified_coach"]);

    expect(
      shouldShowExpertContributorBadge({
        expertVerificationStatus: "none",
      }),
    ).toBe(false);
    expect(
      shouldShowExpertContributorBadge({
        expertVerificationStatus: "pending_review",
      }),
    ).toBe(false);
    expect(isVerifiedExpertContributor("verified")).toBe(true);
  });

  it("adds Expert Contributor only after explicit verification", () => {
    expect(
      resolveContributorRoles({
        isCoach: true,
        hasVerifiedCoachCredential: true,
        expertVerificationStatus: "verified",
      }),
    ).toEqual(["coach", "verified_coach", "expert_contributor"]);
  });

  it("gates publishing and Person SEO on verified status", () => {
    expect(
      canPublishExpertArticle({ expertVerificationStatus: "pending_review" }),
    ).toBe(false);
    expect(
      canPublishExpertArticle({ expertVerificationStatus: "verified" }),
    ).toBe(true);

    expect(
      expertPersonJsonLd({
        displayName: "Alex",
        profilePath: "/experts/alex",
        expertVerificationStatus: "pending_review",
      }),
    ).toBeNull();

    const article = expertArticleJsonLd({
      headline: "Cue the brace",
      description: "Technique note",
      path: "/experts/alex/articles/brace",
      author: {
        displayName: "Alex",
        profilePath: "/experts/alex",
        expertVerificationStatus: "verified",
        specializations: ["powerlifting"],
      },
    });
    expect((article.author as { "@type": string })["@type"]).toBe("Person");
  });

  it("falls back to Organization author when not verified", () => {
    const article = expertArticleJsonLd({
      headline: "Draft",
      description: "x",
      path: "/experts/x/articles/y",
      author: {
        displayName: "X",
        profilePath: "/experts/x",
        expertVerificationStatus: "none",
      },
    });
    expect((article.author as { "@type": string })["@type"]).toBe(
      "Organization",
    );
  });
});
