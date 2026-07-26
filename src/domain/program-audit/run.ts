/**
 * Run free program audit: parse → deterministic findings → limited guest view.
 * Never invents a numeric Program Score for the marketing funnel.
 */

import {
  PROGRAM_AUDIT_LOCKED_SECTIONS,
  PROGRAM_AUDIT_MAX_FREE_FINDINGS,
  PROGRAM_AUDIT_MAX_PASTE_CHARS,
  PROGRAM_AUDIT_PRIVACY_COPY,
} from "@/domain/program-audit/constants";
import {
  findProgramAuditExtraIssues,
} from "@/domain/program-audit/deterministic";
import {
  findTrainingAuditIssues,
  parseTrainingAuditPaste,
} from "@/domain/training-audit";
import { draftToProgramStructureSignals } from "@/domain/training-audit/signals";
import type { TrainingAuditFinding } from "@/domain/training-audit/types";

export type LimitedProgramAuditFinding = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "watch" | "attention";
  evidence: string[];
  /** Always rule-based for this funnel. */
  kind: "deterministic";
};

export type LimitedProgramAuditResult = {
  ok: true;
  lineCount: number;
  dayCount: number;
  estimatedWeeklySets: number | null;
  parseWarningCount: number;
  headline: string;
  summary: string;
  findingsShown: LimitedProgramAuditFinding[];
  findingsWithheldCount: number;
  structuralCounts: {
    trainingDays: number;
    exerciseLines: number;
    linesWithSets: number;
    linesWithIntensity: number;
  };
  /** Explicit: free funnel never fabricates a score. */
  programScore: {
    shown: false;
    reason: string;
  };
  lockedSections: readonly string[];
  privacyNote: string;
  honestyNote: string;
};

export type ProgramAuditRunFailure = {
  ok: false;
  error: string;
};

function severityRank(s: TrainingAuditFinding["severity"]): number {
  if (s === "attention") return 0;
  if (s === "watch") return 1;
  return 2;
}

/**
 * Deterministic free audit from pasted text.
 */
export function runFreeProgramAudit(
  paste: string,
): LimitedProgramAuditResult | ProgramAuditRunFailure {
  const trimmed = paste.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste a program week (Day 1 … exercises) first." };
  }
  if (trimmed.length > PROGRAM_AUDIT_MAX_PASTE_CHARS) {
    return {
      ok: false,
      error: `Paste is too long (max ${PROGRAM_AUDIT_MAX_PASTE_CHARS} characters).`,
    };
  }

  const draft = parseTrainingAuditPaste(trimmed);
  const core = findTrainingAuditIssues(draft);
  const extras = findProgramAuditExtraIssues(draft, trimmed);

  const merged: LimitedProgramAuditFinding[] = [
    ...core.map((f) => ({
      id: f.id,
      title: f.title,
      detail: f.detail,
      severity: f.severity,
      evidence: f.evidence,
      kind: "deterministic" as const,
    })),
    ...extras.map((f) => ({
      id: f.id,
      title: f.title,
      detail: f.detail,
      severity: f.severity,
      evidence: f.evidence,
      kind: "deterministic" as const,
    })),
  ].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  // Drop the empty "Nothing to audit" duplicate if extras already cover empty
  const deduped: LimitedProgramAuditFinding[] = [];
  const seen = new Set<string>();
  for (const f of merged) {
    const key = `${f.title}:${f.detail.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(f);
  }

  const signals = draftToProgramStructureSignals(draft);
  const days = new Set(draft.lines.map((l) => l.dayIndex));

  if (deduped.length === 0 && draft.lines.length > 0) {
    deduped.push({
      id: "clean-snapshot",
      title: "No structural red flags",
      detail:
        "Deterministic checks did not flag duplicate stress, missing patterns, or unmeasurable volume on this paste. That is not a grade — create an account for deeper recommendations and Program Score when enough components are observed.",
      severity: "info",
      evidence: [
        `${draft.lines.length} lines`,
        `${days.size} days`,
        "rules only",
      ],
      kind: "deterministic",
    });
  }

  const shown = deduped.slice(0, PROGRAM_AUDIT_MAX_FREE_FINDINGS);
  const withheld = Math.max(0, deduped.length - shown.length);

  const linesWithSets = draft.lines.filter((l) => l.sets != null).length;
  const linesWithIntensity = draft.lines.filter(
    (l) => l.rpe != null || l.percent != null || l.loadKg != null,
  ).length;

  const setsNote =
    linesWithSets > 0
      ? `~${signals.estimatedWeeklySets} estimated sets from lines that include set counts`
      : "set counts missing — volume not invented";

  const headline =
    draft.lines.length === 0
      ? "Basic audit incomplete"
      : withheld > 0
        ? "Basic audit ready — more findings locked"
        : "Basic audit ready";

  const summary = `Parsed ${draft.lines.length} exercise line(s) across ${days.size || 0} day(s). ${setsNote}. Checks are deterministic rules only — no fake Program Score.`;

  return {
    ok: true,
    lineCount: draft.lines.length,
    dayCount: days.size,
    estimatedWeeklySets: linesWithSets > 0 ? signals.estimatedWeeklySets : null,
    parseWarningCount: draft.parseWarnings.length,
    headline,
    summary,
    findingsShown: shown,
    findingsWithheldCount: withheld,
    structuralCounts: {
      trainingDays: days.size,
      exerciseLines: draft.lines.length,
      linesWithSets,
      linesWithIntensity,
    },
    programScore: {
      shown: false,
      reason:
        "This free page never shows a fabricated score. Create an account to open Training Audit / Program Score — overallScore stays null until enough components are observed.",
    },
    lockedSections: PROGRAM_AUDIT_LOCKED_SECTIONS,
    privacyNote: PROGRAM_AUDIT_PRIVACY_COPY,
    honestyNote:
      "Deterministic checks first. Unresolved names and missing loads stay unresolved.",
  };
}
