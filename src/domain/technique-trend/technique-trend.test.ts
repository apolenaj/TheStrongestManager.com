import { describe, expect, it } from "vitest";
import {
  areCameraAnglesComparable,
  assembleTechniqueTrends,
  TECHNIQUE_TREND_ENGINE_VERSION,
  type TechniqueTrendSample,
} from "@/domain/technique-trend";

function sample(
  partial: Partial<TechniqueTrendSample> &
    Pick<
      TechniqueTrendSample,
      "analysisId" | "createdAtIso" | "overallScore" | "cameraAngle"
    >,
): TechniqueTrendSample {
  return {
    exerciseSlug: "deadlift",
    exerciseName: "Deadlift",
    confidence: "medium",
    components: [],
    href: `/app/technique/${partial.analysisId}`,
    ...partial,
  };
}

describe("Technique Trend Engine", () => {
  it("exports engine version", () => {
    expect(TECHNIQUE_TREND_ENGINE_VERSION).toBe("technique_trend.v1");
  });

  it("does not compare incompatible camera angles", () => {
    expect(areCameraAnglesComparable("side", "front")).toBe(false);
    expect(areCameraAnglesComparable("side", "forty_five")).toBe(false);
    expect(areCameraAnglesComparable("side", "side")).toBe(true);
    expect(areCameraAnglesComparable("overhead", "overhead")).toBe(false);
  });

  it("builds a deadlift score series like 72 76 79 83", () => {
    const scores = [72, 76, 79, 83];
    const samples = scores.map((overallScore, i) =>
      sample({
        analysisId: `a${i}`,
        createdAtIso: `2026-0${i + 1}-01T12:00:00.000Z`,
        overallScore,
        cameraAngle: "side",
        components: [
          {
            id: "lockout",
            label: "Lockout",
            score: 50 + i * 8,
          },
          {
            id: "hip_rise_pattern",
            label: "Hip rise pattern",
            score: 48,
          },
          {
            id: "setup_consistency",
            label: "Setup consistency",
            score: 80,
          },
        ],
      }),
    );

    const result = assembleTechniqueTrends(samples);
    expect(result.emptyReason).toBeNull();
    expect(result.series).toHaveLength(1);
    const series = result.series[0];
    expect(series.overallScores.map((p) => p.score)).toEqual([
      72, 76, 79, 83,
    ]);
    expect(series.direction).toBe("up");
    expect(series.mostImproved?.id).toBe("lockout");
    expect(series.mostImproved?.detail).toMatch(/Most improved/i);
    expect(series.mostImproved?.detail).toMatch(/cause not attributed/i);
    expect(series.persistentIssue?.id).toBe("hip_rise_pattern");
    expect(series.improved.some((c) => c.id === "lockout")).toBe(true);
    expect(series.stable.some((c) => c.id === "setup_consistency")).toBe(true);
  });

  it("keeps side and front series separate — never merges incompatible angles", () => {
    const result = assembleTechniqueTrends([
      sample({
        analysisId: "s1",
        createdAtIso: "2026-01-01T00:00:00.000Z",
        overallScore: 70,
        cameraAngle: "side",
      }),
      sample({
        analysisId: "s2",
        createdAtIso: "2026-02-01T00:00:00.000Z",
        overallScore: 75,
        cameraAngle: "side",
      }),
      sample({
        analysisId: "f1",
        createdAtIso: "2026-01-15T00:00:00.000Z",
        overallScore: 60,
        cameraAngle: "front",
      }),
      sample({
        analysisId: "f2",
        createdAtIso: "2026-02-15T00:00:00.000Z",
        overallScore: 62,
        cameraAngle: "front",
      }),
    ]);
    expect(result.series).toHaveLength(2);
    expect(result.series.every((s) => s.overallScores.length === 2)).toBe(true);
    expect(
      result.series.find((s) => s.cameraAngle === "side")?.overallScores.map(
        (p) => p.score,
      ),
    ).toEqual([70, 75]);
    expect(
      result.series.find((s) => s.cameraAngle === "front")?.overallScores.map(
        (p) => p.score,
      ),
    ).toEqual([60, 62]);
  });

  it("returns empty when only one scored analysis exists", () => {
    const result = assembleTechniqueTrends([
      sample({
        analysisId: "only",
        createdAtIso: "2026-01-01T00:00:00.000Z",
        overallScore: 80,
        cameraAngle: "side",
      }),
    ]);
    expect(result.series).toEqual([]);
    expect(result.emptyReason).toBeTruthy();
  });

  it("skips overhead analyses even if scored twice", () => {
    const result = assembleTechniqueTrends([
      sample({
        analysisId: "o1",
        createdAtIso: "2026-01-01T00:00:00.000Z",
        overallScore: 70,
        cameraAngle: "overhead",
      }),
      sample({
        analysisId: "o2",
        createdAtIso: "2026-02-01T00:00:00.000Z",
        overallScore: 75,
        cameraAngle: "overhead",
      }),
    ]);
    expect(result.series).toEqual([]);
    expect(result.skippedSummary).toMatch(/ineligible|incompatible/i);
  });
});
