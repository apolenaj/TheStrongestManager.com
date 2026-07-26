import { describe, expect, it } from "vitest";
import {
  COOKIE_CATEGORIES,
  DEFAULT_COOKIE_CONSENT,
  GDPR_HONESTY,
  GDPR_WORKFLOW_AREAS,
  GDPR_WORKFLOWS,
  LEGAL_CONTENT_SURFACES,
  LEGAL_REVIEW_BANNER,
  buildGdprReadinessSnapshot,
  hasDecidedCookieConsent,
  parseCookieConsent,
  serializeCookieConsent,
} from "@/domain/gdpr-readiness";

describe("gdpr readiness", () => {
  it("covers required workflow areas", () => {
    expect([...GDPR_WORKFLOW_AREAS]).toEqual(
      expect.arrayContaining([
        "consent",
        "export",
        "deletion",
        "data_processing",
        "cookie_controls",
        "retention",
        "legal_review",
      ]),
    );
    for (const area of GDPR_WORKFLOW_AREAS) {
      expect(GDPR_WORKFLOWS.some((w) => w.area === area)).toBe(true);
    }
  });

  it("marks legal content for professional legal review", () => {
    expect(LEGAL_REVIEW_BANNER).toMatch(/professional legal review/i);
    expect(LEGAL_CONTENT_SURFACES.map((s) => s.path)).toEqual([
      "/privacy",
      "/terms",
      "/cookies",
    ]);
    expect(
      LEGAL_CONTENT_SURFACES.every(
        (s) => s.reviewStatus === "draft_for_legal_review",
      ),
    ).toBe(true);
    expect(GDPR_HONESTY.join(" ")).toMatch(/not a legal certification/i);
  });

  it("parses cookie consent with essential always on", () => {
    expect(COOKIE_CATEGORIES.find((c) => c.id === "essential")?.required).toBe(
      true,
    );
    const undecided = parseCookieConsent(null);
    expect(undecided.essential).toBe(true);
    expect(hasDecidedCookieConsent(undecided)).toBe(false);

    const raw = serializeCookieConsent({
      ...DEFAULT_COOKIE_CONSENT,
      functional: true,
      analytics: false,
      decidedAt: "2026-07-22T00:00:00.000Z",
    });
    const decided = parseCookieConsent(raw);
    expect(decided.functional).toBe(true);
    expect(decided.analytics).toBe(false);
    expect(hasDecidedCookieConsent(decided)).toBe(true);

    const snapshot = buildGdprReadinessSnapshot("2026-07-22T00:00:00.000Z");
    expect(snapshot.docPath).toBe("docs/GDPR_READINESS.md");
    expect(snapshot.counts.legalReviewRequired).toBeGreaterThan(0);
  });
});
