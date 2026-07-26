import { describe, expect, it } from "vitest";
import {
  HUMAN_ANALYSIS_HONESTY,
  HUMAN_ANALYSIS_PRODUCT_SKUS,
  buildHumanAnalysisTimeline,
  canTransitionHumanAnalysisStatus,
  formatTurnaroundPromise,
  getHumanAnalysisCapacity,
  getHumanAnalysisCatalog,
  nextStatusAfterPurchase,
} from "@/domain/human-analysis";

describe("human analysis product architecture", () => {
  it("catalogs the three paid products", () => {
    expect(HUMAN_ANALYSIS_PRODUCT_SKUS).toEqual([
      "single_lift_review",
      "full_training_review",
      "competition_prep_review",
    ]);
    const catalog = getHumanAnalysisCatalog();
    expect(catalog).toHaveLength(3);
    expect(catalog.every((p) => p.sku)).toBe(true);
  });

  it("never invents prices when env unpublished", () => {
    const catalog = getHumanAnalysisCatalog();
    for (const p of catalog) {
      if (p.amountCents == null) {
        expect(p.purchasable).toBe(false);
        expect(p.formattedPrice).toBeNull();
        expect(p.availabilityNote).toMatch(/not published/i);
      }
    }
  });

  it("does not promise turnaround without published capacity days", () => {
    const capacity = getHumanAnalysisCapacity();
    // Default env: intake closed → no promise
    if (!capacity.intakeOpen) {
      expect(formatTurnaroundPromise(capacity)).toBeNull();
      expect(capacity.athleteMessage).toMatch(/no turnaround time is promised/i);
    }
    expect(HUMAN_ANALYSIS_HONESTY.join(" ")).toMatch(
      /never promised unless operational capacity/i,
    );
  });

  it("tracks Purchase → Upload → Queue → Review → Report", () => {
    expect(canTransitionHumanAnalysisStatus("awaiting_purchase", "purchased")).toBe(
      true,
    );
    expect(
      canTransitionHumanAnalysisStatus("awaiting_purchase", "awaiting_upload"),
    ).toBe(true);
    expect(canTransitionHumanAnalysisStatus("purchased", "awaiting_upload")).toBe(
      true,
    );
    expect(canTransitionHumanAnalysisStatus("awaiting_upload", "queued")).toBe(
      true,
    );
    expect(canTransitionHumanAnalysisStatus("queued", "in_review")).toBe(true);
    expect(canTransitionHumanAnalysisStatus("in_review", "report_ready")).toBe(
      true,
    );
    expect(canTransitionHumanAnalysisStatus("report_ready", "queued")).toBe(
      false,
    );

    expect(nextStatusAfterPurchase(false)).toBe("awaiting_upload");
    expect(nextStatusAfterPurchase(true)).toBe("queued");

    const timeline = buildHumanAnalysisTimeline("queued");
    expect(timeline.find((s) => s.status === "queued")?.state).toBe("current");
    expect(timeline.find((s) => s.status === "purchased")?.state).toBe("done");
    expect(timeline.find((s) => s.status === "report_ready")?.state).toBe(
      "upcoming",
    );
  });
});
