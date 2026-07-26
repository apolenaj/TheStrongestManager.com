import { describe, expect, it } from "vitest";
import {
  getRecordingGuide,
  RECORDING_GUIDE_ENGINE_VERSION,
  DEADLIFT_RECORDING_GUIDE,
  SQUAT_RECORDING_GUIDE,
  BENCH_RECORDING_GUIDE,
} from "@/domain/recording-guide";

describe("Smart Video Recording Guide", () => {
  it("exports engine version", () => {
    expect(RECORDING_GUIDE_ENGINE_VERSION).toBe("recording_guide.v1");
  });

  it("recommends 45° front-side for deadlift general analysis", () => {
    const { guide } = getRecordingGuide("deadlift");
    expect(guide).toBe(DEADLIFT_RECORDING_GUIDE);
    expect(guide.recommendedAngleId).toBe("forty_five");
    expect(guide.recommendationSummary).toMatch(/45°/i);
    expect(guide.distance).toBeTruthy();
    expect(guide.height).toBeTruthy();
    expect(guide.mustBeVisible.length).toBeGreaterThan(0);
  });

  it("notes side or 45° for squat depending on goal", () => {
    const { guide } = getRecordingGuide("back-squat");
    expect(guide).toBe(SQUAT_RECORDING_GUIDE);
    expect(guide.recommendationSummary).toMatch(/Side or 45/i);
    expect(guide.angleOptions.some((a) => a.angleId === "side")).toBe(true);
    expect(guide.angleOptions.some((a) => a.angleId === "forty_five")).toBe(
      true,
    );
  });

  it("recommends side view for bench bar path", () => {
    const { guide } = getRecordingGuide("bench-press");
    expect(guide).toBe(BENCH_RECORDING_GUIDE);
    expect(guide.recommendedAngleId).toBe("side");
    expect(guide.recommendationSummary).toMatch(/bar path/i);
  });

  it("does not claim one angle captures all metrics", () => {
    for (const slug of ["deadlift", "back-squat", "bench-press"]) {
      const { guide } = getRecordingGuide(slug);
      expect(guide.angleOptions.every((o) => o.limitedFor.length > 0)).toBe(
        true,
      );
      expect(
        guide.angleOptions.some((o) =>
          /all metrics|captures every/i.test(o.bestFor),
        ),
      ).toBe(false);
    }
  });
});
