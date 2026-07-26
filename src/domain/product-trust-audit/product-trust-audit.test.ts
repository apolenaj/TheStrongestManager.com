import { describe, expect, it } from "vitest";
import {
  PRODUCT_TRUST_AI_FEATURES,
  PRODUCT_TRUST_CRITERIA,
  PRODUCT_TRUST_CRITERION_QUESTIONS,
  PRODUCT_TRUST_CERTAINTY_DISCLAIMER,
  buildProductTrustAuditSnapshot,
  listProductTrustOpenFailures,
} from "@/domain/product-trust-audit";

describe("Product Trust Audit", () => {
  it("asks the four Prompt 182 questions", () => {
    expect([...PRODUCT_TRUST_CRITERIA]).toEqual([
      "provenance",
      "confidence",
      "certainty_risk",
      "challenge",
    ]);
    expect(PRODUCT_TRUST_CRITERION_QUESTIONS.provenance).toMatch(/where/i);
    expect(PRODUCT_TRUST_CRITERION_QUESTIONS.confidence).toMatch(/confidence/i);
    expect(PRODUCT_TRUST_CRITERION_QUESTIONS.certainty_risk).toMatch(
      /medical|scientific/i,
    );
    expect(PRODUCT_TRUST_CRITERION_QUESTIONS.challenge).toMatch(/challenge/i);
  });

  it("reviews every registered AI feature on all criteria", () => {
    expect(PRODUCT_TRUST_AI_FEATURES.length).toBeGreaterThanOrEqual(15);
    for (const f of PRODUCT_TRUST_AI_FEATURES) {
      for (const c of PRODUCT_TRUST_CRITERIA) {
        expect(f.criteria[c].status).toMatch(/^(pass|partial|fail)$/);
        expect(f.criteria[c].note.length).toBeGreaterThan(5);
      }
    }
  });

  it("has no open overall failures after fixes", () => {
    expect(listProductTrustOpenFailures()).toEqual([]);
    const snap = buildProductTrustAuditSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.counts.fail).toBe(0);
    expect(snap.docPath).toBe("docs/PRODUCT_TRUST_AUDIT.md");
    expect(PRODUCT_TRUST_CERTAINTY_DISCLAIMER).toMatch(/not medical/i);
  });

  it("documents gaps that were fixed on high-risk surfaces", () => {
    const pr = PRODUCT_TRUST_AI_FEATURES.find((f) => f.id === "pr_prediction");
    expect(pr?.documentedGaps.length).toBeGreaterThan(0);
    expect(pr?.fixesApplied.length).toBeGreaterThan(0);
    expect(pr?.overall).toBe("pass");

    const chat = PRODUCT_TRUST_AI_FEATURES.find((f) => f.id === "coach_chat");
    expect(chat?.criteria.challenge.status).toBe("pass");
  });
});
