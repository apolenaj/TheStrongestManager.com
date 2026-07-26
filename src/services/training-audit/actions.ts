"use server";

import { requireSession } from "@/services/auth/session";
import {
  runTrainingAudit,
  type RunTrainingAuditInput,
} from "@/services/training-audit/training-audit-service";
import type { TrainingAuditResult } from "@/domain/training-audit";

export type TrainingAuditActionResult =
  | {
      ok: true;
      result: TrainingAuditResult;
      pdfImageEnabled: boolean;
    }
  | { ok: false; error: string };

export async function runTrainingAuditAction(
  source: RunTrainingAuditInput,
): Promise<TrainingAuditActionResult> {
  const session = await requireSession();
  return runTrainingAudit({ userId: session.user.id, source });
}
