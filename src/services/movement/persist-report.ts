import {
  MOVEMENT_MAX_POSE_FRAMES,
  buildDeadliftFixtureFrames,
  runMovementPipeline,
  type LandmarkName,
  type MovementReport,
  type PoseFrame,
} from "@/domain/movement";
import { prisma } from "@/lib/db";
import { isCameraAngleId } from "@/domain/technique/validation";
import { refundAnalysisCredit } from "@/services/billing/credit-service";

const LANDMARK_NAMES = new Set<LandmarkName>([
  "nose",
  "left_shoulder",
  "right_shoulder",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_wrist",
  "right_wrist",
]);

export type PersistMovementInput = {
  userId: string;
  analysisId: string;
  frames: PoseFrame[];
  poseProvider: string;
  fixture?: boolean;
};

function parsePoseFrames(raw: unknown): PoseFrame[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > MOVEMENT_MAX_POSE_FRAMES) return null;

  const frames: PoseFrame[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    if (typeof row.index !== "number" || typeof row.timeSeconds !== "number") {
      return null;
    }
    if (!Array.isArray(row.landmarks)) return null;
    const landmarks: PoseFrame["landmarks"] = [];
    for (const lm of row.landmarks) {
      if (!lm || typeof lm !== "object") return null;
      const point = lm as Record<string, unknown>;
      if (
        typeof point.name !== "string" ||
        typeof point.x !== "number" ||
        typeof point.y !== "number" ||
        typeof point.visibility !== "number"
      ) {
        return null;
      }
      if (!LANDMARK_NAMES.has(point.name as LandmarkName)) {
        return null;
      }
      landmarks.push({
        name: point.name as LandmarkName,
        x: point.x,
        y: point.y,
        visibility: point.visibility,
      });
    }
    frames.push({
      index: row.index,
      timeSeconds: row.timeSeconds,
      landmarks,
    });
  }
  return frames;
}

export function validatePoseFramesPayload(raw: unknown): PoseFrame[] | null {
  return parsePoseFrames(raw);
}

export async function persistMovementReport(
  input: PersistMovementInput,
): Promise<
  | { ok: true; report: MovementReport }
  | { ok: false; error: string }
> {
  if (input.fixture && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Diagnostics fixture is not available in production.",
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const analysis = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.analysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    include: {
      exercise: { select: { slug: true, name: true } },
    },
  });
  if (!analysis) {
    return { ok: false, error: "Analysis not found." };
  }

  const frames =
    input.fixture && input.frames.length === 0
      ? buildDeadliftFixtureFrames()
      : input.frames;

  if (frames.length === 0) {
    return { ok: false, error: "No pose frames provided." };
  }

  const cameraAngle =
    analysis.cameraAngle && isCameraAngleId(analysis.cameraAngle)
      ? analysis.cameraAngle
      : analysis.cameraAngle;

  await prisma.techniqueAnalysis.update({
    where: { id: analysis.id },
    data: {
      status: "processing",
      analysisBackendStatus: "processing",
    },
  });

  const report = runMovementPipeline({
    exerciseSlug: analysis.exercise?.slug ?? "unknown",
    cameraAngle: cameraAngle ?? null,
    frames,
    poseProvider: input.fixture
      ? "diagnostics_fixture"
      : input.poseProvider,
    fixture: Boolean(input.fixture),
  });

  // Persist Technique Score only when the documented deadlift scorer produced one.
  if (
    report.overallTechniqueScore != null &&
    (report.overallTechniqueScore < 0 || report.overallTechniqueScore > 100)
  ) {
    await prisma.techniqueAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "failed",
        analysisBackendStatus: "failed",
        summary:
          "Analysis failed due to a system honesty-contract error. No score was stored.",
      },
    });
    await refundAnalysisCredit({
      userId: input.userId,
      analysisId: analysis.id,
      reason: `Refund: system honesty-contract failure on analysis ${analysis.id}`,
    });
    const { obs } = await import("@/services/observability");
    obs.error({
      category: "technique_failures",
      message: "technique_honesty_contract_failure",
      props: { analysisId: analysis.id },
    });
    return {
      ok: false,
      error: "Pipeline violated honesty contract (Technique Score out of range).",
    };
  }

  const backendStatus = !report.cameraSuitability.suitable
    ? "unsuitable_camera"
    : report.supportedExercise
      ? "completed"
      : "unsupported_exercise";

  await prisma.$transaction(async (tx) => {
    await tx.techniqueMetric.deleteMany({
      where: { techniqueAnalysisId: analysis.id },
    });

    if (report.metrics.length > 0) {
      await tx.techniqueMetric.createMany({
        data: report.metrics.map((metric) => ({
          techniqueAnalysisId: analysis.id,
          metricKey: metric.key,
          value: metric.value,
          unit: metric.unit,
          source: "observed",
          scoreLevel: null,
          note: JSON.stringify({
            label: metric.label,
            confidence: metric.confidence,
            confidenceScore: metric.confidenceScore,
            basis: metric.basis,
            caveats: metric.caveats,
            phase: metric.phase ?? null,
          }),
        })),
      });
    }

    await tx.techniqueAnalysis.update({
      where: { id: analysis.id },
      data: {
        status: "completed",
        analysisBackendStatus: backendStatus,
        overallScore: report.overallTechniqueScore,
        confidenceBasis: report.diagnostics.fixture
          ? "heuristic"
          : report.techniqueAssessment?.confidence === "none"
            ? null
            : "observed",
        summary: report.summary,
        movementReportJson: JSON.stringify(report),
        poseProvider: report.diagnostics.poseProvider,
        poseFrameCount: report.diagnostics.frameCount,
      },
    });
  });

  const { trackProductEventSafe } = await import("@/services/analytics/track");
  trackProductEventSafe({
    name: "technique_analysis_completed",
    props: {
      analysisId: analysis.id,
      backendStatus,
      supportedExercise: report.supportedExercise,
    },
    userId: input.userId,
  });

  const { enqueueDomainEventSafe } = await import("@/services/event-driven");
  enqueueDomainEventSafe({
    name: "technique.analysis_completed",
    payload: {
      userId: input.userId,
      analysisId: analysis.id,
      athleteProfileId: profile.id,
    },
    dedupeParts: [analysis.id],
  });

  return { ok: true, report };
}

export function parseStoredMovementReport(
  raw: string | null | undefined,
): MovementReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MovementReport;
  } catch {
    return null;
  }
}
