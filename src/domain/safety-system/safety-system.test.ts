import { describe, expect, it } from "vitest";
import {
  SAFETY_AUDIT_CASES,
  SAFETY_RULE_IDS,
  SAFETY_SYSTEM_HONESTY,
  buildSafetySystemSnapshot,
  runSafetyAuditSuite,
  validateRecommendationSafety,
  validateRecommendationSafetyBatch,
} from "@/domain/safety-system";

describe("Safety System 2.0", () => {
  it("covers the five central rule ids", () => {
    expect([...SAFETY_RULE_IDS]).toEqual([
      "unsafe_max_frequency",
      "extreme_volume",
      "dangerous_rapid_weight_loss",
      "medical_diagnosis",
      "pain_ignoring",
    ]);
  });

  it("passes the deterministic audit suite", () => {
    const report = runSafetyAuditSuite();
    expect(report.failures).toEqual([]);
    expect(report.passed).toBe(true);
    expect(report.total).toBe(SAFETY_AUDIT_CASES.length);
  });

  it("blocks medical diagnosis language", () => {
    const result = validateRecommendationSafety({
      id: "diag",
      text: "You have a herniated disc from yesterday’s squat.",
    });
    expect(result.action).toBe("block");
    expect(result.outputText).toBeNull();
    expect(result.findings.some((f) => f.ruleId === "medical_diagnosis")).toBe(
      true,
    );
  });

  it("blocks pain-ignoring and crash-cut advice", () => {
    const pain = validateRecommendationSafety({
      id: "pain",
      text: "No pain, no gain — push through the sharp pain.",
    });
    expect(pain.action).toBe("block");

    const cut = validateRecommendationSafety({
      id: "cut",
      text: "Use a water cut and dehydrate before weigh-in.",
      proposedWeightLossKgPerWeek: 2,
    });
    expect(cut.action).toBe("block");
  });

  it("modifies unsafe frequency and extreme volume language", () => {
    const freq = validateRecommendationSafety({
      id: "freq",
      text: "Do a competition deadlift max every day this peaking week.",
    });
    expect(freq.action).toBe("modify");
    expect(freq.outputText).toBeTruthy();
    expect(freq.outputText).not.toMatch(/every day/i);

    const vol = validateRecommendationSafety({
      id: "vol",
      text: "Double volume immediately for hypertrophy.",
    });
    expect(vol.action).toBe("modify");
  });

  it("batch gate drops blocked items and softens modified ones", () => {
    const batch = validateRecommendationSafetyBatch([
      {
        id: "ok",
        text: "Keep three hard sessions and one technique day.",
        sessionsPerWeek: 4,
      },
      {
        id: "bad",
        text: "I diagnose your ACL tear — keep training.",
      },
      {
        id: "soft",
        text: "Train the same lift daily with heavy singles.",
      },
    ]);
    expect(batch.blockedCount).toBe(1);
    expect(batch.modifiedCount).toBe(1);
    expect(batch.allowed).toHaveLength(2);
    expect(batch.allowed.find((a) => a.id === "bad")).toBeUndefined();
  });

  it("snapshot includes honesty and docs path", () => {
    const snapshot = buildSafetySystemSnapshot("2026-07-22T00:00:00.000Z");
    expect(snapshot.docPath).toBe("docs/SAFETY_SYSTEM.md");
    expect(snapshot.audit.passed).toBe(true);
    expect(SAFETY_SYSTEM_HONESTY.join(" ")).toMatch(/not a medical diagnosis/i);
  });
});
