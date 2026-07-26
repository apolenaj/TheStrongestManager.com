import {
  assembleTrainingAudit,
  buildManualAuditDraft,
  parseTrainingAuditCsv,
  parseTrainingAuditPaste,
  type TrainingAuditDraft,
  type TrainingAuditResult,
} from "@/domain/training-audit";
import type { ProgramReviewAthleteContext } from "@/domain/program-review/types";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export type RunTrainingAuditInput =
  | {
      mode: "csv";
      csv: string;
      programName?: string;
    }
  | {
      mode: "paste";
      text: string;
      programName?: string;
    }
  | {
      mode: "manual";
      programName?: string;
      lines: Array<{
        dayIndex: number;
        exerciseName: string;
        sets: number | null;
        reps: string | null;
        rpe: number | null;
        percent: number | null;
        loadKg: number | null;
      }>;
    };

async function loadLightContext(
  userId: string,
): Promise<ProgramReviewAthleteContext | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
      trainingExperience: true,
      recoveryEntries: {
        where: { readiness: { not: null } },
        orderBy: { recordedAt: "desc" },
        take: 5,
        select: { readiness: true },
      },
    },
  });
  if (!profile) return null;

  const exp = profile.trainingExperience;
  const readiness = profile.recoveryEntries
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);
  const avg =
    readiness.length >= 3
      ? readiness.reduce((a, b) => a + b, 0) / readiness.length
      : null;

  let recoveryCapacity: ProgramReviewAthleteContext["recoveryCapacity"] =
    "unknown";
  if (avg != null) {
    if (avg < 55) recoveryCapacity = "limited";
    else if (avg >= 75) recoveryCapacity = "high";
    else recoveryCapacity = "moderate";
  }

  return {
    goalTitle: profile.goals[0]?.title ?? null,
    goalCategory: profile.goals[0]?.category ?? null,
    experienceLevel: exp?.level ?? null,
    daysPerWeek: exp?.daysPerWeek ?? null,
    sessionLengthMinutes: exp?.sessionLengthMinutes ?? null,
    availableEquipment: [],
    recoveryCapacity,
    primaryDiscipline: profile.primaryDiscipline,
  };
}

function draftFromInput(input: RunTrainingAuditInput): TrainingAuditDraft {
  if (input.mode === "csv") {
    const draft = parseTrainingAuditCsv(input.csv);
    if (input.programName?.trim()) draft.name = input.programName.trim();
    return draft;
  }
  if (input.mode === "paste") {
    const draft = parseTrainingAuditPaste(input.text);
    if (input.programName?.trim()) draft.name = input.programName.trim();
    return draft;
  }
  return buildManualAuditDraft(input.programName ?? "Manual program", input.lines);
}

/**
 * Run Automatic Training Audit from CSV, paste, or manual lines.
 * PDF/image is not accepted here — gated by featureFlags.trainingAuditPdfImage.
 */
export async function runTrainingAudit(input: {
  userId: string;
  source: RunTrainingAuditInput;
}): Promise<
  | { ok: true; result: TrainingAuditResult; pdfImageEnabled: boolean }
  | { ok: false; error: string }
> {
  if (input.source.mode === "csv" && !input.source.csv.trim()) {
    return { ok: false, error: "Paste CSV content before analyzing." };
  }
  if (input.source.mode === "paste" && !input.source.text.trim()) {
    return { ok: false, error: "Paste program text before analyzing." };
  }
  if (input.source.mode === "manual" && input.source.lines.length === 0) {
    return { ok: false, error: "Add at least one exercise row." };
  }

  const draft = draftFromInput(input.source);
  const context = await loadLightContext(input.userId);
  const result = assembleTrainingAudit({ draft, context });

  return {
    ok: true,
    result,
    pdfImageEnabled: featureFlags.trainingAuditPdfImage,
  };
}

export function trainingAuditCapabilities() {
  return {
    manual: true,
    csv: true,
    paste: true,
    pdfImage: featureFlags.trainingAuditPdfImage,
  };
}
