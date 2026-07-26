import { describe, expect, it } from "vitest";
import {
  buildAthleteAttentionItems,
  buildPrioritizedAttention,
  prioritizeAttentionQueue,
  type AthleteAttentionSignals,
} from "@/domain/coach-dashboard";

const base: AthleteAttentionSignals = {
  athleteProfileId: "a1",
  displayName: "Alex",
  canTraining: true,
  canTechnique: true,
  canRecovery: true,
  sessionsLast7d: 3,
  sessionsPrev7d: 3,
  sessionsLast28d: 10,
  daysSinceLastSession: 1,
  techniqueDelta: null,
  techniqueSampleCount: 0,
  meanRpeRecent: 7,
  daysUntilCompetition: null,
  competitionLabel: null,
  recentPrCount7d: 0,
  recentPrHeadline: null,
  daysSinceCheckin: 2,
  hadAnyCheckin: true,
};

describe("coach multi-athlete attention", () => {
  it("flags missed training with urgency by days idle", () => {
    const items = buildAthleteAttentionItems({
      ...base,
      sessionsLast7d: 0,
      sessionsLast28d: 4,
      daysSinceLastSession: 16,
    });
    const missed = items.find((i) => i.category === "missed_training");
    expect(missed?.urgency).toBe("critical");
  });

  it("detects technique regression and competition window", () => {
    const items = buildAthleteAttentionItems({
      ...base,
      techniqueDelta: -6,
      techniqueSampleCount: 4,
      daysUntilCompetition: 5,
      competitionLabel: "Local meet",
    });
    expect(items.some((i) => i.category === "technique_regression")).toBe(true);
    expect(items.some((i) => i.category === "competition_approaching")).toBe(
      true,
    );
  });

  it("caps queue and prefers urgency over new PR noise", () => {
    const candidates = [
      ...buildAthleteAttentionItems({
        ...base,
        athleteProfileId: "quiet",
        displayName: "Quiet",
        recentPrCount7d: 1,
        recentPrHeadline: "Squat PR",
      }),
      ...buildAthleteAttentionItems({
        ...base,
        athleteProfileId: "urgent",
        displayName: "Urgent",
        sessionsLast7d: 0,
        sessionsLast28d: 5,
        daysSinceLastSession: 12,
      }),
    ];
    const queue = prioritizeAttentionQueue(candidates, {
      maxItems: 3,
      maxPerAthlete: 2,
    });
    expect(queue.items[0]?.category).toBe("missed_training");
    expect(queue.items.length).toBeLessThanOrEqual(3);
  });

  it("does not invent incomplete check-in without recovery scope", () => {
    const items = buildAthleteAttentionItems({
      ...base,
      canRecovery: false,
      daysSinceCheckin: 30,
      hadAnyCheckin: false,
    });
    expect(items.some((i) => i.category === "incomplete_checkin")).toBe(false);
  });

  it("buildPrioritizedAttention merges roster", () => {
    const result = buildPrioritizedAttention([
      {
        ...base,
        athleteProfileId: "b",
        displayName: "Blake",
        sessionsLast7d: 0,
        sessionsLast28d: 3,
        daysSinceLastSession: 9,
      },
    ]);
    expect(result.totalCandidates).toBeGreaterThan(0);
    expect(result.items.length).toBeGreaterThan(0);
  });
});
