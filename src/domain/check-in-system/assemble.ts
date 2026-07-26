/**
 * Deterministic AI summary of a weekly check-in — always labelled AI summary.
 */

import {
  CHECK_IN_AI_SUMMARY_DISCLAIMER,
  CHECK_IN_AI_SUMMARY_LABEL,
  CHECK_IN_CATEGORY_LABELS,
  CHECK_IN_ENGINE_VERSION,
  type CheckInQuestionDef,
} from "@/domain/check-in-system/constants";

export type CheckInAiSummaryResult = {
  source: "ai_summary";
  sourceLabel: typeof CHECK_IN_AI_SUMMARY_LABEL;
  isAiGenerated: true;
  body: string;
  disclaimer: typeof CHECK_IN_AI_SUMMARY_DISCLAIMER;
  engineVersion: string;
  generatedAt: string;
};

export function assembleCheckInAiSummary(input: {
  weekKey: string;
  questions: readonly CheckInQuestionDef[];
  responses: Record<string, string | number | boolean | null>;
  now?: Date;
}): CheckInAiSummaryResult {
  const now = input.now ?? new Date();
  const lines: string[] = [];
  lines.push(`Weekly check-in overview (${input.weekKey}).`);

  const answered = input.questions.filter((q) => {
    const v = input.responses[q.key];
    return v !== null && v !== undefined && String(v).trim() !== "";
  });

  if (answered.length === 0) {
    lines.push("No answers recorded — summary stays empty of invented detail.");
  } else {
    lines.push(`${answered.length} answer(s) recorded across allowlisted questions.`);
    const byCat = new Map<string, CheckInQuestionDef[]>();
    for (const q of answered) {
      const list = byCat.get(q.category) ?? [];
      list.push(q);
      byCat.set(q.category, list);
    }
    for (const [cat, qs] of byCat) {
      const label =
        CHECK_IN_CATEGORY_LABELS[
          cat as keyof typeof CHECK_IN_CATEGORY_LABELS
        ] ?? cat;
      lines.push(`${label}:`);
      for (const q of qs) {
        const raw = input.responses[q.key];
        const display =
          typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw);
        lines.push(`• ${q.prompt} → ${display}`);
      }
    }
  }

  lines.push(CHECK_IN_AI_SUMMARY_DISCLAIMER);

  return {
    source: "ai_summary",
    sourceLabel: CHECK_IN_AI_SUMMARY_LABEL,
    isAiGenerated: true,
    body: lines.join("\n"),
    disclaimer: CHECK_IN_AI_SUMMARY_DISCLAIMER,
    engineVersion: CHECK_IN_ENGINE_VERSION,
    generatedAt: now.toISOString(),
  };
}
