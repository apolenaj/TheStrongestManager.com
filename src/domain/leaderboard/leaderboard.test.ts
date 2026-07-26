import { describe, expect, it } from "vitest";
import {
  buildConsistencyBoard,
  buildRepPrsBoard,
  buildTechniqueImprovementBoard,
  buildVerifiedLiftsBoard,
  LEADERBOARD_FORBIDDEN_CATEGORIES,
  resolveVerificationTier,
  type LeaderboardAthleteRef,
} from "@/domain/leaderboard";

const emptyFilters = {
  bodyweightClassMaxKg: null,
  countryCode: null,
  sport: null,
  verification: null,
};

function athlete(
  id: string,
  name: string,
  extra: Partial<LeaderboardAthleteRef> = {},
): LeaderboardAthleteRef {
  return {
    athleteProfileId: id,
    displayName: name,
    anonymousLabel: `Athlete ${id.slice(0, 4)}`,
    showDisplayName: true,
    countryCode: "US",
    bodyweightClassMaxKg: 83,
    sport: "powerlifting",
    ...extra,
  };
}

describe("resolveVerificationTier", () => {
  it("maps sources honestly", () => {
    expect(resolveVerificationTier("reported")).toBe("self_reported");
    expect(resolveVerificationTier("observed")).toBe("video_verified");
    expect(resolveVerificationTier("competition")).toBe(
      "competition_verified",
    );
  });
});

describe("buildVerifiedLiftsBoard", () => {
  it("ranks real entries and labels verification", () => {
    const board = buildVerifiedLiftsBoard(
      [
        {
          athlete: athlete("a1", "Ada"),
          liftLabel: "Deadlift",
          loadKg: 200,
          reps: 1,
          verification: "self_reported",
          recordedAt: new Date(),
        },
        {
          athlete: athlete("a2", "Bea"),
          liftLabel: "Deadlift",
          loadKg: 200,
          reps: 1,
          verification: "competition_verified",
          recordedAt: new Date(),
        },
        {
          athlete: athlete("a3", "Cara"),
          liftLabel: "Deadlift",
          loadKg: 210,
          reps: 1,
          verification: "video_verified",
          recordedAt: new Date(),
        },
      ],
      emptyFilters,
      ["safety"],
    );
    expect(board.rows[0]!.displayLabel).toBe("Cara");
    expect(board.rows[0]!.verificationLabel).toBe("Video verified");
    // Equal load: competition above self-reported
    expect(board.rows[1]!.displayLabel).toBe("Bea");
    expect(board.rows[1]!.verificationLabel).toBe("Competition verified");
    expect(board.rows[2]!.verificationLabel).toBe("Self-reported");
  });

  it("returns honest empty state — never fabricates", () => {
    const board = buildVerifiedLiftsBoard([], emptyFilters, []);
    expect(board.rows).toHaveLength(0);
    expect(board.emptyReason).toMatch(/never invented/i);
  });

  it("filters by country and class", () => {
    const board = buildVerifiedLiftsBoard(
      [
        {
          athlete: athlete("a1", "Ada", { countryCode: "US" }),
          liftLabel: "Squat",
          loadKg: 150,
          reps: 1,
          verification: "self_reported",
          recordedAt: new Date(),
        },
        {
          athlete: athlete("a2", "Bea", { countryCode: "DE" }),
          liftLabel: "Squat",
          loadKg: 180,
          reps: 1,
          verification: "self_reported",
          recordedAt: new Date(),
        },
      ],
      { ...emptyFilters, countryCode: "US" },
      [],
    );
    expect(board.rows).toHaveLength(1);
    expect(board.rows[0]!.displayLabel).toBe("Ada");
  });
});

describe("buildRepPrsBoard", () => {
  it("ranks by set volume", () => {
    const board = buildRepPrsBoard(
      [
        {
          athlete: athlete("a1", "Ada"),
          liftLabel: "Bench",
          loadKg: 100,
          reps: 8,
          verification: "self_reported",
          recordedAt: new Date(),
        },
        {
          athlete: athlete("a2", "Bea"),
          liftLabel: "Bench",
          loadKg: 100,
          reps: 10,
          verification: "video_verified",
          recordedAt: new Date(),
        },
      ],
      emptyFilters,
      [],
    );
    expect(board.rows[0]!.displayLabel).toBe("Bea");
    expect(board.rows[0]!.valueLabel).toBe("100 kg × 10");
  });
});

describe("technique + consistency", () => {
  it("only ranks positive technique deltas", () => {
    const board = buildTechniqueImprovementBoard(
      [
        {
          athlete: athlete("a1", "Ada"),
          deltaPoints: 8,
          latestScore: 86,
          sampleCount: 3,
        },
        {
          athlete: athlete("a2", "Bea"),
          deltaPoints: -2,
          latestScore: 70,
          sampleCount: 2,
        },
      ],
      emptyFilters,
      [],
    );
    expect(board.rows).toHaveLength(1);
  });

  it("consistency is sessions not recovery", () => {
    const board = buildConsistencyBoard(
      [
        {
          athlete: athlete("a1", "Ada"),
          completedSessions: 12,
          windowDays: 28,
        },
      ],
      emptyFilters,
      [],
    );
    expect(board.rows[0]!.meta).toMatch(/not a recovery/i);
  });
});

describe("forbidden categories", () => {
  it("documents recovery and weight-loss as forbidden", () => {
    expect(LEADERBOARD_FORBIDDEN_CATEGORIES).toContain("recovery");
    expect(LEADERBOARD_FORBIDDEN_CATEGORIES).toContain("weight_loss");
  });
});
