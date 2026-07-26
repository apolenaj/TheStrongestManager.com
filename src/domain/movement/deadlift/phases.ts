import {
  KNEE_CROSSING_TOLERANCE,
  KNEE_LEVEL_MIN_COVERAGE,
  KNEE_LEVEL_WINDOW_RADIUS,
} from "@/domain/movement/phases/constants";
import { MOVEMENT_MIN_FRAMES_FOR_PHASES } from "@/domain/movement/constants";
import {
  confidenceFromScore,
  midHip,
  midKnee,
  midWrist,
} from "@/domain/movement/geometry";
import type {
  MovementPhaseSegment,
  PoseFrame,
} from "@/domain/movement/types";

type HipSeriesRow = {
  frame: PoseFrame;
  y: number;
  visibility: number;
  seriesIndex: number;
};

/**
 * Deadlift phases from mid-hip (and optional knee/wrist) image-plane trajectory.
 *
 * Primary timeline when knee crossing is reliable:
 * Setup → Initial pull → Knee level → Lockout (+ optional Descent).
 *
 * When knees/wrists are insufficient: Setup → Pull (legacy blob) → Lockout —
 * never invents a knee-level segment.
 */
export function detectDeadliftPhases(
  frames: PoseFrame[],
): MovementPhaseSegment[] {
  const series: HipSeriesRow[] = [];
  frames.forEach((frame) => {
    const hip = midHip(frame);
    if (!hip) return;
    series.push({
      frame,
      y: hip.y,
      visibility: hip.visibility,
      seriesIndex: series.length,
    });
  });

  if (series.length < MOVEMENT_MIN_FRAMES_FOR_PHASES) {
    return [
      {
        phase: "unknown",
        startFrame: frames[0]?.index ?? 0,
        endFrame: frames[frames.length - 1]?.index ?? 0,
        startTimeSeconds: frames[0]?.timeSeconds ?? 0,
        endTimeSeconds: frames[frames.length - 1]?.timeSeconds ?? 0,
        confidence: "none",
        confidenceScore: 0,
        note: `Need ≥${MOVEMENT_MIN_FRAMES_FOR_PHASES} frames with visible hips for phase detection (have ${series.length}).`,
      },
    ];
  }

  const ys = series.map((s) => s.y);
  const minY = Math.min(...ys); // highest in frame (toward top)
  const maxY = Math.max(...ys); // lowest in frame (toward floor)
  const range = maxY - minY;

  if (range < 0.04) {
    return [
      {
        phase: "unknown",
        startFrame: series[0].frame.index,
        endFrame: series[series.length - 1].frame.index,
        startTimeSeconds: series[0].frame.timeSeconds,
        endTimeSeconds: series[series.length - 1].frame.timeSeconds,
        confidence: "low",
        confidenceScore: 0.25,
        note: "Hip height barely changed — cannot segment pull vs lockout from this view.",
      },
    ];
  }

  const setupCut = maxY - range * 0.15;
  const lockoutCut = minY + range * 0.2;

  let setupEnd = 0;
  while (setupEnd < series.length - 1 && series[setupEnd].y >= setupCut) {
    setupEnd += 1;
  }

  let lockoutStart = series.length - 1;
  while (lockoutStart > setupEnd && series[lockoutStart].y > lockoutCut) {
    lockoutStart -= 1;
  }

  let descentStart = lockoutStart;
  for (let i = lockoutStart; i < series.length - 1; i += 1) {
    if (series[i + 1].y - series[i].y > range * 0.05) {
      descentStart = i;
      break;
    }
  }

  const meanVis =
    series.reduce((acc, s) => acc + s.visibility, 0) / series.length;
  const phaseConfidence = confidenceFromScore(meanVis * 0.85);
  const confidenceScore = meanVis * 0.85;

  const segments: MovementPhaseSegment[] = [];

  const push = (
    phase: MovementPhaseSegment["phase"],
    from: number,
    to: number,
    note: string,
    conf = phaseConfidence,
    confScore = confidenceScore,
  ) => {
    if (to < from) return;
    segments.push({
      phase,
      startFrame: series[from].frame.index,
      endFrame: series[to].frame.index,
      startTimeSeconds: series[from].frame.timeSeconds,
      endTimeSeconds: series[to].frame.timeSeconds,
      confidence: conf,
      confidenceScore: confScore,
      note,
    });
  };

  push(
    "setup",
    0,
    Math.max(0, setupEnd - 1),
    "Image-plane: hips near lowest observed position before rising.",
  );

  const riseFrom = setupEnd;
  const riseTo = Math.max(setupEnd, lockoutStart - 1);
  const kneeSplit = findKneeLevelSplit(series, riseFrom, riseTo);

  if (kneeSplit) {
    const { kneeIndex, coverage, crossingConf } = kneeSplit;
    const kneeFrom = Math.max(
      riseFrom,
      kneeIndex - KNEE_LEVEL_WINDOW_RADIUS,
    );
    const kneeTo = Math.min(riseTo, kneeIndex + KNEE_LEVEL_WINDOW_RADIUS);

    push(
      "initial_pull",
      riseFrom,
      Math.max(riseFrom, kneeFrom - 1),
      "Image-plane: mid-hip rising from the floor toward the knee.",
    );
    push(
      "knee_level",
      kneeFrom,
      kneeTo,
      `Image-plane: wrist/bar proxy crossed mid-knee (knee coverage ${(coverage * 100).toFixed(0)}%).`,
      crossingConf.level,
      crossingConf.score,
    );
    // Post-knee rise folds into lockout start when there is room; else lockout peak only.
    const afterKnee = kneeTo + 1;
    if (afterKnee <= lockoutStart) {
      // Extend lockout region to begin after knee (second pull + finish).
      push(
        "lockout",
        afterKnee,
        Math.max(afterKnee, descentStart),
        "Image-plane: from above the knee through the highest hip position (second pull + finish).",
      );
    } else {
      push(
        "lockout",
        lockoutStart,
        Math.max(lockoutStart, descentStart),
        "Image-plane: mid-hip near highest observed position.",
      );
    }
  } else {
    // Honest fallback — do not invent knee_level.
    push(
      "pull",
      riseFrom,
      riseTo,
      "Image-plane: mid-hip rising (knee-level split unavailable — knees/wrists insufficient).",
    );
    push(
      "lockout",
      lockoutStart,
      Math.max(lockoutStart, descentStart),
      "Image-plane: mid-hip near highest observed position.",
    );
  }

  if (descentStart < series.length - 1) {
    push(
      "descent",
      Math.min(series.length - 1, descentStart + 1),
      series.length - 1,
      "Image-plane: mid-hip descending after lockout region.",
    );
  }

  return segments.length > 0
    ? segments
    : [
        {
          phase: "unknown",
          startFrame: series[0].frame.index,
          endFrame: series[series.length - 1].frame.index,
          startTimeSeconds: series[0].frame.timeSeconds,
          endTimeSeconds: series[series.length - 1].frame.timeSeconds,
          confidence: "low",
          confidenceScore: 0.2,
          note: "Phase segmentation failed.",
        },
      ];
}

/**
 * Find series index where wrist/bar proxy crosses mid-knee during the rise.
 * Returns null when coverage or crossing is unreliable.
 */
function findKneeLevelSplit(
  series: HipSeriesRow[],
  riseFrom: number,
  riseTo: number,
): {
  kneeIndex: number;
  coverage: number;
  crossingConf: { level: MovementPhaseSegment["confidence"]; score: number };
} | null {
  if (riseTo <= riseFrom) return null;

  let withKnee = 0;
  let withWrist = 0;
  let crossIndex: number | null = null;
  let bestVis = 0;

  for (let i = riseFrom; i <= riseTo; i += 1) {
    const frame = series[i].frame;
    const knee = midKnee(frame);
    const wrist = midWrist(frame);
    if (knee) {
      withKnee += 1;
      bestVis = Math.max(bestVis, knee.visibility);
    }
    if (wrist) withWrist += 1;
    if (!knee || !wrist) continue;

    // Rising: wrist starts below knee in frame (higher y) and crosses to lower y.
    const delta = wrist.y - knee.y;
    if (Math.abs(delta) <= KNEE_CROSSING_TOLERANCE && crossIndex == null) {
      crossIndex = i;
    }
    // Prefer first frame where wrist has risen to/above knee (wrist.y <= knee.y).
    if (crossIndex == null && wrist.y <= knee.y + KNEE_CROSSING_TOLERANCE) {
      crossIndex = i;
    }
  }

  const riseLen = riseTo - riseFrom + 1;
  const coverage = withKnee / riseLen;
  if (coverage < KNEE_LEVEL_MIN_COVERAGE) return null;
  if (withWrist / riseLen < KNEE_LEVEL_MIN_COVERAGE) return null;
  if (crossIndex == null) return null;
  // Crossing should not be at the extreme edges only (noise).
  if (crossIndex <= riseFrom || crossIndex >= riseTo) return null;

  const score = Math.min(0.9, coverage * 0.7 + bestVis * 0.3);
  return {
    kneeIndex: crossIndex,
    coverage,
    crossingConf: {
      score,
      level: confidenceFromScore(score),
    },
  };
}
