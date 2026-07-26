import { describe, expect, it } from "vitest";
import {
  PAIN_SAFE_FORBIDDEN_PHRASES,
  PAIN_SAFE_RESPONSE_HONESTY,
  PAIN_SAFE_SEEK_CARE_MESSAGE,
  adaptiveKindToAggressive,
  analyzePainSafeResponse,
  applyPainSafeGuard,
  classifyPainSafeText,
  detectionsFromExplicitReports,
  detectionsFromText,
  painSafeAdaptationHold,
} from "@/domain/pain-safe-response-system";

describe("pain-safe-response-system", () => {
  it("never diagnoses and points to qualified medical evaluation", () => {
    const honesty = PAIN_SAFE_RESPONSE_HONESTY.join(" ");
    expect(honesty).toMatch(/not a diagnosis/i);
    expect(honesty).toMatch(/qualified medical/i);
    expect(honesty).toMatch(/never diagnose/i);
    expect(PAIN_SAFE_SEEK_CARE_MESSAGE).toMatch(/qualified medical/i);
    expect(PAIN_SAFE_SEEK_CARE_MESSAGE).toMatch(/does not diagnose/i);
    for (const phrase of PAIN_SAFE_FORBIDDEN_PHRASES) {
      expect(honesty.toLowerCase()).not.toContain(phrase);
      expect(PAIN_SAFE_SEEK_CARE_MESSAGE.toLowerCase()).not.toContain(phrase);
    }
  });

  it("classifies sharp pain, neurological symptoms, and serious injury", () => {
    expect(classifyPainSafeText("sharp stabbing knee pain today")).toContain(
      "sharp_pain",
    );
    expect(
      classifyPainSafeText("numbness and tingling down my leg"),
    ).toContain("neurological");
    expect(classifyPainSafeText("torn ACL — ER visit last week")).toEqual(
      expect.arrayContaining(["serious_injury"]),
    );
  });

  it("does not activate on DOMS / normal muscle soreness alone", () => {
    expect(classifyPainSafeText("normal DOMS muscle soreness after squats")).toEqual(
      [],
    );
    const analysis = analyzePainSafeResponse({
      detections: detectionsFromText({
        text: "delayed onset muscle soreness from training",
        source: "inferred",
      }),
    });
    expect(analysis.active).toBe(false);
  });

  it("activates pain-safe mode from explicit user reports", () => {
    const analysis = analyzePainSafeResponse({
      detections: detectionsFromExplicitReports([
        {
          category: "sharp_pain",
          notes: "Sharp pain in shoulder on press",
          source: "user_report",
          active: true,
        },
      ]),
    });
    expect(analysis.active).toBe(true);
    expect(analysis.neverDiagnose).toBe(true);
    expect(analysis.categoriesActive).toContain("sharp_pain");
    expect(analysis.seekCareMessage).toBe(PAIN_SAFE_SEEK_CARE_MESSAGE);
  });

  it("stops aggressive training recommendations via the central guard", () => {
    const analysis = analyzePainSafeResponse({
      detections: detectionsFromText({
        text: "sharp pain when locking out",
        source: "user_report",
      }),
    });

    expect(adaptiveKindToAggressive("increase_load")).toBe("increase_load");
    expect(adaptiveKindToAggressive("deload")).toBeNull();

    const guarded = applyPainSafeGuard({
      analysis,
      recommendation: {
        changeKind: "increase_load",
        recommendedChange: "Add 2.5 kg",
      },
      surface: "adaptations",
      aggressiveKind: "increase_load",
    });
    expect(guarded.suppressed).toBe(true);
    expect(guarded.recommendation).toBeNull();
    expect(guarded.seekCareMessage).toMatch(/does not diagnose/i);

    const hold = painSafeAdaptationHold("Squat");
    expect(hold.changeKind).toBe("keep_load");
    expect(hold.reason).toMatch(/qualified medical/i);
    expect(hold.reason).toMatch(/does not diagnose/i);
    expect(hold.reason.toLowerCase()).not.toMatch(
      /\b(you have a tear|you are diagnosed|medical diagnosis:|i diagnose)\b/,
    );

    const allowed = applyPainSafeGuard({
      analysis,
      recommendation: { changeKind: "deload", recommendedChange: "Deload" },
      surface: "adaptations",
      aggressiveKind: null,
    });
    expect(allowed.suppressed).toBe(false);
    expect(allowed.recommendation).not.toBeNull();
  });

  it("does not suppress when pain-safe mode is inactive", () => {
    const analysis = analyzePainSafeResponse({ detections: [] });
    const guarded = applyPainSafeGuard({
      analysis,
      recommendation: { changeKind: "increase_load" },
      surface: "adaptations",
      aggressiveKind: "increase_load",
    });
    expect(guarded.suppressed).toBe(false);
    expect(guarded.recommendation).toEqual({ changeKind: "increase_load" });
  });
});
