/**
 * AI discussion summaries — never stored as human answers.
 */

import {
  QA_AI_SUMMARY_DISCLAIMER,
  QA_AI_SUMMARY_LABEL,
} from "@/domain/community-qa/constants";

export type QaAiSummaryView = {
  /** Always labelled AI in product UI. */
  label: typeof QA_AI_SUMMARY_LABEL;
  disclaimer: typeof QA_AI_SUMMARY_DISCLAIMER;
  /** true = machine-generated; must never look like a user. */
  isAiGenerated: true;
  body: string;
  generatedAt: string | null;
  engineVersion: string | null;
};

export type QaThreadForSummary = {
  questionTitle: string;
  questionBody: string;
  answers: Array<{ body: string; isExpert: boolean; score: number }>;
};

/**
 * Deterministic extractive summary (no LLM required).
 * Explicitly AI-labelled; never attributed to a human author.
 */
export function buildDiscussionAiSummary(
  thread: QaThreadForSummary,
  now: Date = new Date(),
): QaAiSummaryView {
  const lines: string[] = [];
  lines.push(`Question focus: ${thread.questionTitle.trim().slice(0, 120)}`);

  const answerCount = thread.answers.length;
  if (answerCount === 0) {
    lines.push("No human answers yet — summary will expand when people reply.");
  } else {
    lines.push(`${answerCount} human answer(s) in this thread.`);
    const expertCount = thread.answers.filter((a) => a.isExpert).length;
    if (expertCount > 0) {
      lines.push(`${expertCount} answer(s) carry a verified Expert badge.`);
    }
    const top = [...thread.answers].sort((a, b) => b.score - a.score)[0];
    if (top) {
      const snippet = top.body.trim().replace(/\s+/g, " ").slice(0, 160);
      lines.push(`Highest-voted human reply (excerpt): “${snippet}${top.body.length > 160 ? "…" : ""}”`);
    }
  }

  lines.push(
    "This is an AI overview, not advice from a coach or clinician.",
  );

  return {
    label: QA_AI_SUMMARY_LABEL,
    disclaimer: QA_AI_SUMMARY_DISCLAIMER,
    isAiGenerated: true,
    body: lines.join("\n"),
    generatedAt: now.toISOString(),
    engineVersion: "extractive_v1",
  };
}

/** Guard: AI content must never be treated as answer authorship. */
export function isHumanAnswerAuthorship(authorship: string): boolean {
  return authorship === "human_athlete" || authorship === "human_coach";
}
