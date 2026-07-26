import { describe, expect, it } from "vitest";
import {
  detectWeakPoints,
  WEAK_POINT_ENGINE_VERSION,
  type WeakPointSignals,
  type WeakPointTechniqueSample,
} from "@/domain/weak-point-intelligence";

function emptySignals(
  overrides: Partial<WeakPointSignals> = {},
): WeakPointSignals {
  return {
    techniqueSamples: [],
    lifts: [],
    completedSessionsLast28Days: 5,
    skippedProgramSessionsLast28Days: 0,
    hasActiveProgram: true,
    recoveryCheckInsLast7Days: 0,
    latestReadiness: null,
    avgReadinessLast7Days: null,
    performanceTrendDirection: null,
    techniqueTrendDirection: null,
    loadSpikeFlagged: false,
    ...overrides,
  };
}

function techniqueSample(
  id: string,
  day: string,
  scores: {
    start?: number;
    hip?: number;
    lockout?: number;
  },
): WeakPointTechniqueSample {
  const components: WeakPointTechniqueSample["components"] = [];
  if (scores.start != null) {
    components.push({
      id: "start_position",
      label: "Start position",
      score: scores.start,
      status: "observed",
      confidence: "medium",
      evidence: "test",
    });
  }
  if (scores.hip != null) {
    components.push({
      id: "hip_rise_pattern",
      label: "Hip rise",
      score: scores.hip,
      status: "observed",
      confidence: "medium",
      evidence: "test",
    });
  }
  if (scores.lockout != null) {
    components.push({
      id: "lockout",
      label: "Lockout",
      score: scores.lockout,
      status: "observed",
      confidence: "medium",
      evidence: "test",
    });
  }
  return {
    analysisId: id,
    createdAtIso: `${day}T12:00:00.000Z`,
    overallScore: 70,
    components,
  };
}

describe("Weak Point Intelligence", () => {
  it("emits engine version and empty reason when no evidence-backed findings", () => {
    const result = detectWeakPoints(emptySignals());
    expect(result.engineVersion).toBe(WEAK_POINT_ENGINE_VERSION);
    expect(result.findings).toEqual([]);
    expect(result.emptyReason).toBeTruthy();
  });

  it("requires evidence — never emits findings with empty evidence arrays", () => {
    const result = detectWeakPoints(
      emptySignals({
        hasActiveProgram: false,
      }),
    );
    expect(result.findings.length).toBeGreaterThan(0);
    for (const f of result.findings) {
      expect(f.evidence.length).toBeGreaterThan(0);
    }
  });

  it("detects deadlift floor weakness when floor is weak and lockout is stable", () => {
    const samples = [
      techniqueSample("a1", "2026-07-01", {
        start: 40,
        hip: 45,
        lockout: 85,
      }),
      techniqueSample("a2", "2026-07-08", {
        start: 42,
        hip: 48,
        lockout: 88,
      }),
      techniqueSample("a3", "2026-07-15", {
        start: 38,
        hip: 44,
        lockout: 90,
      }),
    ];
    const result = detectWeakPoints(
      emptySignals({ techniqueSamples: samples }),
    );
    const floor = result.findings.find((f) => f.id === "technical-deadlift-floor");
    expect(floor).toBeDefined();
    expect(floor?.category).toBe("technical_weakness");
    expect(floor?.potentialWeakPoint).toBe("Deadlift floor position");
    expect(floor?.confidence).toBe("medium");
    expect(floor?.evidence.some((e) => /technique analyses/i.test(e.label))).toBe(
      true,
    );
    expect(floor?.evidence.some((e) => /lockout/i.test(e.label))).toBe(true);
    expect(
      floor?.recommendedValidation.some((v) => /paused deadlift/i.test(v)),
    ).toBe(true);
    expect(floor?.prescriptionWeakPoint).toBe("deadlift_off_floor");
  });

  it("does not claim muscular weakness from empty/appearance-like inputs", () => {
    const result = detectWeakPoints(
      emptySignals({
        // Bodyweight-only style: no paired lifts
        lifts: [],
        techniqueSamples: [],
      }),
    );
    expect(
      result.findings.every((f) => f.category !== "muscular_weakness"),
    ).toBe(true);
  });

  it("may propose muscular weakness only from lift-log imbalance", () => {
    const result = detectWeakPoints(
      emptySignals({
        lifts: [
          {
            metricKey: "lift_squat",
            label: "Back squat",
            valueKg: 180,
            recordedAtIso: "2026-07-01T00:00:00.000Z",
          },
          {
            metricKey: "lift_deadlift",
            label: "Deadlift",
            valueKg: 140,
            recordedAtIso: "2026-07-01T00:00:00.000Z",
          },
        ],
      }),
    );
    const muscular = result.findings.find(
      (f) => f.category === "muscular_weakness",
    );
    expect(muscular).toBeDefined();
    expect(muscular?.evidence.length).toBeGreaterThan(0);
    expect(muscular?.detail).toMatch(/log/i);
    expect(muscular?.detail).not.toMatch(/appearance|photo|visual look/i);
  });

  it("flags recovery limitation from readiness check-ins, not diagnosis language", () => {
    const result = detectWeakPoints(
      emptySignals({
        recoveryCheckInsLast7Days: 5,
        avgReadinessLast7Days: 48,
        latestReadiness: 45,
      }),
    );
    const recovery = result.findings.find(
      (f) => f.category === "recovery_limitation",
    );
    expect(recovery).toBeDefined();
    expect(recovery?.detail).toMatch(/not a medical diagnosis/i);
    expect(recovery?.detail).not.toMatch(/\binjury\b|\bdisease\b/i);
    expect(recovery?.evidence.some((e) => /readiness/i.test(e.label))).toBe(
      true,
    );
  });

  it("flags consistency when few sessions are completed", () => {
    const result = detectWeakPoints(
      emptySignals({
        completedSessionsLast28Days: 1,
        skippedProgramSessionsLast28Days: 2,
      }),
    );
    expect(
      result.findings.some((f) => f.category === "consistency_issue"),
    ).toBe(true);
  });
});
