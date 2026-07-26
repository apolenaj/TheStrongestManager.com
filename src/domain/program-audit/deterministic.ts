/**
 * Extra deterministic checks for the free program-audit funnel.
 * Complements findTrainingAuditIssues — still rule-based, never invents scores.
 */

import { draftToProgramStructureSignals } from "@/domain/training-audit/signals";
import type {
  TrainingAuditDraft,
  TrainingAuditFinding,
} from "@/domain/training-audit/types";

export type ProgramAuditExtraFinding = {
  id: string;
  code:
    | "missing_deload_cue"
    | "few_rest_days"
    | "sparse_structure"
    | "parse_limited";
  title: string;
  detail: string;
  severity: "info" | "watch" | "attention";
  evidence: string[];
};

/**
 * Rule-based extras on top of training-audit findings.
 */
export function findProgramAuditExtraIssues(
  draft: TrainingAuditDraft,
  rawPaste: string,
): ProgramAuditExtraFinding[] {
  const extras: ProgramAuditExtraFinding[] = [];
  const signals = draftToProgramStructureSignals(draft);
  const days = new Set(draft.lines.map((l) => l.dayIndex));
  const trainingDays = days.size;
  const lower = rawPaste.toLowerCase();

  if (draft.lines.length === 0) {
    extras.push({
      id: "sparse-empty",
      code: "sparse_structure",
      title: "Nothing parsed",
      detail:
        "No exercise lines matched the paste format. Use “Day N” headers and lines like “Back squat 4x5 @RPE8”.",
      severity: "info",
      evidence: ["0 lines"],
    });
    return extras;
  }

  if (draft.lines.length < 3) {
    extras.push({
      id: "sparse-few",
      code: "sparse_structure",
      title: "Sparse program snapshot",
      detail:
        "Only a few lines parsed — basic checks run, but balance and volume judgments stay weak until more of the week is pasted.",
      severity: "info",
      evidence: [`${draft.lines.length} lines`],
    });
  }

  if (trainingDays >= 6) {
    extras.push({
      id: "rest-days",
      code: "few_rest_days",
      title: "Few rest days in snapshot",
      detail: `About ${trainingDays} training days appear in this paste (~${Math.max(0, 7 - trainingDays)} rest day(s) if this is a 7-day week). Recovery space may be tight.`,
      severity: "watch",
      evidence: [`${trainingDays} training days`],
    });
  }

  const mentionsDeload = /\bdeload\b|\bunload\b|\blight week\b/.test(lower);
  if (
    !mentionsDeload &&
    trainingDays >= 3 &&
    (signals.estimatedWeeklySets >= 50 || draft.lines.length >= 12)
  ) {
    extras.push({
      id: "deload-cue",
      code: "missing_deload_cue",
      title: "No deload cue in paste",
      detail:
        "This snapshot looks like a full training week with no “deload / unload / light week” label. That may be fine for a single week — just note that recovery planning is not visible here.",
      severity: "info",
      evidence: [
        `${trainingDays} days`,
        `~${signals.estimatedWeeklySets} sets`,
        "no deload keyword",
      ],
    });
  }

  if (draft.parseWarnings.length >= 3) {
    extras.push({
      id: "parse-limited",
      code: "parse_limited",
      title: "Some lines could not be parsed",
      detail: `${draft.parseWarnings.length} line(s) were left out rather than guessed. Fix formatting to audit more of the plan.`,
      severity: "info",
      evidence: draft.parseWarnings.slice(0, 3),
    });
  }

  return extras;
}

export function toAuditShapedFinding(
  extra: ProgramAuditExtraFinding,
): TrainingAuditFinding {
  return {
    id: extra.id,
    code: "unclear_progression",
    title: extra.title,
    detail: extra.detail,
    severity: extra.severity,
    confidence: "medium",
    evidence: extra.evidence,
  };
}
