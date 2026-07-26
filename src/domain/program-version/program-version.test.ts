import { describe, expect, it } from "vitest";
import {
  PROGRAM_VERSION_ENGINE_VERSION,
  PROGRAM_VERSION_HONESTY,
  formatProgramVersionLabel,
  parseProgramVersionLabel,
  planProgramVersionRestore,
  restorePlanProtectsCompletedHistory,
  type ProgramVersionSnapshot,
} from "@/domain/program-version";

const sampleSnapshot = (): ProgramVersionSnapshot => ({
  engineVersion: PROGRAM_VERSION_ENGINE_VERSION,
  capturedAt: new Date().toISOString(),
  program: {
    name: "Test",
    description: null,
    status: "active",
    kind: "athlete",
  },
  blocks: [],
  weeks: [],
  progressionRules: [],
  exercises: [
    {
      workoutExerciseId: "we_1",
      workoutId: "w_locked",
      exerciseId: "ex_1",
      sortOrder: 0,
      notes: null,
      targetSets: 3,
      targetReps: "5",
      targetRpe: 8,
      targetRir: null,
      targetPercent: null,
      targetLoadKg: 100,
      targetTempo: null,
      restSeconds: 180,
    },
    {
      workoutExerciseId: "we_2",
      workoutId: "w_open",
      exerciseId: "ex_2",
      sortOrder: 0,
      notes: null,
      targetSets: 3,
      targetReps: "5",
      targetRpe: 7,
      targetRir: null,
      targetPercent: null,
      targetLoadKg: 60,
      targetTempo: null,
      restSeconds: 120,
    },
  ],
});

describe("program-version", () => {
  it("labels versions as v1, v2, v3", () => {
    expect(formatProgramVersionLabel(1)).toBe("v1");
    expect(formatProgramVersionLabel(2)).toBe("v2");
    expect(formatProgramVersionLabel(3)).toBe("v3");
    expect(parseProgramVersionLabel("v3")).toBe(3);
  });

  it("plans restore without targeting completed session ledgers", () => {
    const plan = planProgramVersionRestore({
      targetVersionNumber: 2,
      snapshot: sampleSnapshot(),
      sessions: [
        {
          id: "ts_completed",
          status: "completed",
          prescriptionLockedAt: new Date().toISOString(),
          workoutId: "w_locked",
        },
        {
          id: "ts_planned",
          status: "planned",
          prescriptionLockedAt: null,
          workoutId: "w_open",
        },
      ],
      liveExerciseIds: ["we_1", "we_2"],
    });

    expect(plan.targetLabel).toBe("v2");
    expect(plan.protectedSessionIds).toContain("ts_completed");
    expect(plan.protectedSessionCount).toBe(1);
    expect(
      restorePlanProtectsCompletedHistory(plan, []),
    ).toBe(true);
    expect(
      restorePlanProtectsCompletedHistory(plan, ["ts_completed"]),
    ).toBe(false);
  });

  it("states honesty about who/why/date and completed history protection", () => {
    const blob = PROGRAM_VERSION_HONESTY.join(" ");
    expect(blob).toMatch(/who changed/i);
    expect(blob).toMatch(/v1, v2, v3/i);
    expect(blob).toMatch(/completed training sessions/i);
  });
});
