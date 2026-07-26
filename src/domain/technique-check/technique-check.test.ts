import { describe, expect, it } from "vitest";
import { runMovementPipeline } from "@/domain/movement/pipeline";
import type { PoseFrame } from "@/domain/movement/types";
import {
  TECHNIQUE_CHECK_FUNNEL_STEPS,
  TECHNIQUE_CHECK_HONESTY,
  TECHNIQUE_CHECK_PRIVACY_COPY,
  TECHNIQUE_CHECK_SIGNUP_HREF,
  buildLimitedTechniqueInsight,
  evaluateTechniqueCheckQuality,
} from "@/domain/technique-check";

function sideViewDeadliftFrames(): PoseFrame[] {
  const frames: PoseFrame[] = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 12;
    const hipY = 0.55 - Math.min(t, 1) * 0.12;
    frames.push({
      index: i,
      timeSeconds: t,
      landmarks: [
        { name: "nose", x: 0.5, y: 0.2, visibility: 0.9 },
        { name: "left_shoulder", x: 0.48, y: 0.35, visibility: 0.9 },
        { name: "right_shoulder", x: 0.52, y: 0.35, visibility: 0.9 },
        { name: "left_hip", x: 0.48, y: hipY, visibility: 0.9 },
        { name: "right_hip", x: 0.52, y: hipY, visibility: 0.9 },
        { name: "left_knee", x: 0.48, y: 0.7, visibility: 0.9 },
        { name: "right_knee", x: 0.52, y: 0.7, visibility: 0.9 },
        { name: "left_ankle", x: 0.48, y: 0.9, visibility: 0.9 },
        { name: "right_ankle", x: 0.52, y: 0.9, visibility: 0.9 },
        { name: "left_wrist", x: 0.45, y: hipY + 0.05, visibility: 0.85 },
        { name: "right_wrist", x: 0.55, y: hipY + 0.05, visibility: 0.85 },
      ],
    });
  }
  return frames;
}

describe("technique check funnel", () => {
  it("requires value before signup and guest privacy", () => {
    const q = evaluateTechniqueCheckQuality();
    expect(q.passed).toBe(true);
    expect(TECHNIQUE_CHECK_FUNNEL_STEPS.map((s) => s.id)).toEqual([
      "consent_upload",
      "claim_ticket",
      "analyze",
      "limited_insight",
      "signup_to_save",
    ]);
    expect(TECHNIQUE_CHECK_PRIVACY_COPY.toLowerCase()).toMatch(/not uploaded/);
    expect(TECHNIQUE_CHECK_SIGNUP_HREF).toContain("/signup");
    expect(TECHNIQUE_CHECK_HONESTY.join(" ")).toMatch(/before signup/i);
  });

  it("builds limited insight without exposing locked sections as free content", () => {
    const report = runMovementPipeline({
      exerciseSlug: "deadlift",
      cameraAngle: "side",
      frames: sideViewDeadliftFrames(),
      poseProvider: "test_fixture",
    });
    const limited = buildLimitedTechniqueInsight(report);
    expect(limited.bullets.length).toBeGreaterThan(0);
    expect(limited.bullets.every((b) =>
      ["observed", "estimated", "recommended"].includes(b.evidence),
    )).toBe(true);
    expect(limited.score.lockedBreakdown).toBe(true);
    expect(limited.lockedSections.length).toBeGreaterThan(2);
    expect(limited.privacyNote.toLowerCase()).toMatch(/not uploaded/);
    // Full report disclaimers preserved at least partially
    expect(limited.disclaimers.length).toBeGreaterThan(0);
  });
});
