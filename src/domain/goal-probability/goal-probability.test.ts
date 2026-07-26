import { describe, expect, it } from "vitest";
import {
  assessGoalProgress,
  estimateKgPerWeek,
  inferLiftFromTitle,
  inferTargetDateFromTitle,
  inferTargetKgFromTitle,
} from "@/domain/goal-probability";

const NOW = new Date("2026-07-21T12:00:00.000Z");

function daysFromNow(n: number): Date {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000);
}

function daysAgo(n: number): Date {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
}

describe("parse goal hints", () => {
  it("infers lift, kg, and date from title", () => {
    const title = "Deadlift 320 kg by October 15";
    expect(inferLiftFromTitle(title)).toBe("deadlift");
    expect(inferTargetKgFromTitle(title)).toBe(320);
    const d = inferTargetDateFromTitle(title, NOW);
    expect(d?.getUTCMonth()).toBe(9);
    expect(d?.getUTCDate()).toBe(15);
  });
});

describe("estimateKgPerWeek", () => {
  it("returns null when samples are thin", () => {
    expect(
      estimateKgPerWeek([
        { at: daysAgo(10), estimateKg: 300 },
        { at: daysAgo(3), estimateKg: 305 },
      ]),
    ).toBeNull();
  });

  it("estimates positive slope from spaced samples", () => {
    const rate = estimateKgPerWeek([
      { at: daysAgo(50), estimateKg: 290 },
      { at: daysAgo(40), estimateKg: 292 },
      { at: daysAgo(30), estimateKg: 295 },
      { at: daysAgo(20), estimateKg: 298 },
      { at: daysAgo(10), estimateKg: 302 },
      { at: daysAgo(2), estimateKg: 305 },
    ]);
    expect(rate).not.toBeNull();
    expect(rate!).toBeGreaterThan(0);
  });
});

describe("assessGoalProgress", () => {
  it("shows on-track style fields without a probability percent", () => {
    const result = assessGoalProgress(
      {
        goal: {
          id: "g1",
          title: "Deadlift 320 kg by October 15",
          category: "strength",
          targetValue: 320,
          targetUnit: "kg",
          targetDate: daysFromNow(86),
          status: "active",
        },
        currentEstimateKg: { low: 305, high: 315 },
        trajectorySamples: [
          { at: daysAgo(50), estimateKg: 298 },
          { at: daysAgo(40), estimateKg: 300 },
          { at: daysAgo(30), estimateKg: 304 },
          { at: daysAgo(20), estimateKg: 308 },
          { at: daysAgo(10), estimateKg: 310 },
          { at: daysAgo(2), estimateKg: 312 },
        ],
      },
      NOW,
    );

    expect(result.targetKg).toBe(320);
    expect(result.currentEstimateKg).toEqual({ low: 305, high: 315 });
    expect(result.requiredImprovementKg?.vsHigh).toBe(5);
    expect(result.timeRemaining).not.toBeNull();
    expect(result.timeRemaining!.weeks).toBeGreaterThan(10);
    expect(result.statusLabel).not.toMatch(/%/);
    expect(result.honestyNote).toMatch(/no precise probability/i);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(["on_track", "possible_but_aggressive", "below_target"]).toContain(
      result.status,
    );
  });

  it("flags below target when required rate is unrealistic", () => {
    const result = assessGoalProgress(
      {
        goal: {
          id: "g2",
          title: "Deadlift 320 kg",
          category: "strength",
          targetValue: 320,
          targetUnit: "kg",
          targetDate: daysFromNow(21),
          status: "active",
        },
        currentEstimateKg: { low: 280, high: 290 },
        trajectorySamples: [
          { at: daysAgo(50), estimateKg: 285 },
          { at: daysAgo(40), estimateKg: 284 },
          { at: daysAgo(30), estimateKg: 285 },
          { at: daysAgo(20), estimateKg: 286 },
          { at: daysAgo(10), estimateKg: 285 },
          { at: daysAgo(2), estimateKg: 286 },
        ],
      },
      NOW,
    );
    expect(result.status).toBe("below_target");
    expect(result.statusLabel).toBe("Current trajectory below target");
  });

  it("marks possible but aggressive when gap needs faster than history", () => {
    const result = assessGoalProgress(
      {
        goal: {
          id: "g3",
          title: "Bench 150 kg",
          category: "strength",
          targetValue: 150,
          targetUnit: "kg",
          targetDate: daysFromNow(56),
          status: "active",
        },
        currentEstimateKg: { low: 138, high: 142 },
        trajectorySamples: [
          { at: daysAgo(50), estimateKg: 136 },
          { at: daysAgo(40), estimateKg: 137 },
          { at: daysAgo(30), estimateKg: 138 },
          { at: daysAgo(20), estimateKg: 139 },
          { at: daysAgo(10), estimateKg: 140 },
          { at: daysAgo(2), estimateKg: 140 },
        ],
      },
      NOW,
    );
    expect(result.status).toBe("possible_but_aggressive");
    expect(result.statusLabel).toBe("Possible but aggressive");
  });

  it("withholds when current estimate is missing", () => {
    const result = assessGoalProgress(
      {
        goal: {
          id: "g4",
          title: "Deadlift 320 kg by October 15",
          category: "strength",
          targetValue: 320,
          targetUnit: "kg",
          targetDate: daysFromNow(80),
          status: "active",
        },
        currentEstimateKg: null,
        trajectorySamples: [],
      },
      NOW,
    );
    expect(result.status).toBe("insufficient_data");
  });

  it("never includes a numeric probability claim in labels", () => {
    const result = assessGoalProgress(
      {
        goal: {
          id: "g5",
          title: "Squat 200 kg",
          category: "strength",
          targetValue: 200,
          targetUnit: "kg",
          targetDate: daysFromNow(90),
          status: "active",
        },
        currentEstimateKg: { low: 190, high: 195 },
        trajectorySamples: [
          { at: daysAgo(45), estimateKg: 188 },
          { at: daysAgo(30), estimateKg: 190 },
          { at: daysAgo(15), estimateKg: 192 },
          { at: daysAgo(5), estimateKg: 193 },
        ],
      },
      NOW,
    );
    const blob = [
      result.statusLabel,
      result.honestyNote,
      ...result.reasons,
      result.trajectory.summary,
    ].join(" ");
    expect(blob).not.toMatch(/\d+\s*%\s*(chance|probability|likely)/i);
  });
});
