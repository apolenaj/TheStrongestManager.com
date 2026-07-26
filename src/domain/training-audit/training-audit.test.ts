import { describe, expect, it } from "vitest";
import {
  assembleTrainingAudit,
  findTrainingAuditIssues,
  parseTrainingAuditCsv,
  parseTrainingAuditPaste,
  parseExercisePrescriptionLine,
} from "@/domain/training-audit";

describe("training audit parsers", () => {
  it("parses CSV without inventing missing loads", () => {
    const draft = parseTrainingAuditCsv(`day,exercise,sets,reps,rpe,percent,load_kg
1,Back squat,4,5,8,80,
1,Curl,3,12,,,`);
    expect(draft.lines).toHaveLength(2);
    expect(draft.lines[0]?.loadKg).toBeNull();
    expect(draft.lines[0]?.percent).toBe(80);
    expect(draft.lines[0]?.movementPattern).toBe("squat");
    expect(draft.lines[1]?.rpe).toBeNull();
    expect(draft.lines[1]?.patternResolved).toBe(false);
  });

  it("parses structured paste lines", () => {
    const draft = parseTrainingAuditPaste(`Day 1
Back squat 4x5 @RPE8 80%
Day 3
Bench press 4x5`);
    expect(draft.lines).toHaveLength(2);
    expect(draft.lines[0]?.dayIndex).toBe(1);
    expect(draft.lines[0]?.sets).toBe(4);
    expect(draft.lines[0]?.rpe).toBe(8);
    expect(draft.lines[1]?.dayIndex).toBe(3);
    expect(draft.lines[1]?.percent).toBeNull();
  });

  it("leaves unparseable paste lines as warnings — not fabricated", () => {
    const draft = parseTrainingAuditPaste(`Day 1
??? not a real prescription`);
    expect(draft.lines.length).toBeLessThanOrEqual(1);
    expect(draft.parseWarnings.length).toBeGreaterThan(0);
  });

  it("parses a single prescription line", () => {
    const line = parseExercisePrescriptionLine(
      "Deadlift 3x3 @RPE8.5 85%",
      5,
    );
    expect(line?.exerciseName).toBe("Deadlift");
    expect(line?.sets).toBe(3);
    expect(line?.rpe).toBe(8.5);
    expect(line?.percent).toBe(85);
    expect(line?.loadKg).toBeNull();
  });
});

describe("training audit findings", () => {
  it("flags missing pull when push is present", () => {
    const draft = parseTrainingAuditPaste(`Day 1
Bench press 4x5 @RPE8
Incline press 3x8`);
    const findings = findTrainingAuditIssues(draft);
    expect(
      findings.some((f) => f.code === "missing_movement_pattern"),
    ).toBe(true);
  });

  it("flags unclear progression when no intensity anchors", () => {
    const draft = parseTrainingAuditPaste(`Day 1
Back squat 4x5
Day 3
Bench press 4x5`);
    const findings = findTrainingAuditIssues(draft);
    expect(findings.some((f) => f.code === "unclear_progression")).toBe(true);
  });

  it("flags potentially unrealistic volume from high set totals", () => {
    const draft = parseTrainingAuditCsv(`day,exercise,sets,reps
1,Back squat,20,5
1,RDL,20,8
2,Bench press,20,5
2,Row,20,10
3,Deadlift,20,3`);
    const findings = findTrainingAuditIssues(draft);
    expect(findings.some((f) => f.code === "unrealistic_volume")).toBe(true);
  });

  it("assembles full upload→understand→improve payload", () => {
    const draft = parseTrainingAuditPaste(`Day 1
Back squat 4x5 @RPE8
Romanian deadlift 3x8
Day 2
Bench press 5x5 @RPE9
Day 3
Deadlift 3x3 @RPE9`);
    const result = assembleTrainingAudit({ draft });
    expect(result.understanding.lineCount).toBeGreaterThan(0);
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.improvements.length).toBeGreaterThan(0);
    expect(result.honesty[0]).toMatch(/never fabricates/i);
    // No fabricated load on RDL
    expect(result.draft.lines.find((l) => /rdl|romanian/i.test(l.exerciseName))?.loadKg).toBeNull();
  });
});
