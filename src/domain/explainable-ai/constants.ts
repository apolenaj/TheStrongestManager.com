/**
 * Explainable AI UI (Prompt 141).
 * Normalized “Why am I seeing this?” contract — supporting data, confidence, missing info.
 * Adapters map existing engines; never invent evidence.
 */

import type { ConfidenceLevel } from "@/domain/scoring/types";
import type { CoachBrainRecommendation } from "@/domain/coach-brain/types";
import type { DailyBriefInsight } from "@/domain/daily-brief/types";
import type { InsightProposal } from "@/domain/insights/types";
import type { WeakPointFinding } from "@/domain/weak-point-intelligence/types";
import type { FatigueAlertAnalysis } from "@/domain/fatigue-alert-system/types";
import type { DeloadIntelligenceAnalysis } from "@/domain/deload-intelligence/types";
import { INSIGHT_DOMAIN_LABELS } from "@/domain/insights/constants";
import {
  CONFIDENCE_DISPLAY_LABELS,
  formatConfidenceLabel,
  normalizeConfidenceLevel,
} from "@/domain/confidence-system";

export const EXPLAINABLE_AI_ENGINE_VERSION = "explainable_ai.v1" as const;

export const EXPLAINABLE_AI_TRIGGER_LABEL = "Why am I seeing this?" as const;

export const EXPLAINABLE_AI_HONESTY = [
  "Every AI insight should answer “Why am I seeing this?” with supporting data, confidence, and missing information.",
  "Empty supporting or missing lists stay empty — we do not invent evidence to fill the panel.",
  "Confidence uses the universal scale: High, Moderate, Low, Insufficient data — never a fake percentage.",
] as const;

/** @deprecated Prefer CONFIDENCE_DISPLAY_LABELS from confidence-system. */
export const EXPLAINABLE_CONFIDENCE_LABELS = CONFIDENCE_DISPLAY_LABELS;

/** @deprecated Prefer formatConfidenceLabel from confidence-system. */
export const confidenceLabel = formatConfidenceLabel;

/** @deprecated Prefer normalizeConfidenceLevel from confidence-system. */
export const normalizeConfidence = normalizeConfidenceLevel;

export type ExplainableInsightView = {
  /** Optional one-line why / reasoning summary. */
  summary: string | null;
  /** Supporting facts shown under Why. */
  supportingData: string[];
  confidence: ConfidenceLevel;
  missingInformation: string[];
};

function nonEmptyLines(items: readonly string[]): string[] {
  return items.map((s) => s.trim()).filter(Boolean);
}

/** Split prose reason into supporting bullets when engines only emit a string. */
export function reasonToSupportingData(reason: string): string[] {
  return nonEmptyLines(
    reason
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  );
}

export function fromCoachBrainRecommendation(
  rec: Pick<
    CoachBrainRecommendation,
    "reasoningSummary" | "supportingData" | "confidence" | "missingInformation"
  >,
): ExplainableInsightView {
  return {
    summary: rec.reasoningSummary.trim() || null,
    supportingData: rec.supportingData.map(
      (s) => `${s.key}: ${s.value}`,
    ),
    confidence: rec.confidence,
    missingInformation: nonEmptyLines(rec.missingInformation),
  };
}

export function fromCoachAiDraft(input: {
  why: string;
  supportingData: readonly string[];
  confidence: string;
  missingInformation?: readonly string[];
}): ExplainableInsightView {
  const supporting = nonEmptyLines(input.supportingData);
  const why = input.why.trim();
  if (supporting.length > 0) {
    return {
      summary: why || null,
      supportingData: supporting,
      confidence: normalizeConfidence(input.confidence),
      missingInformation: nonEmptyLines(input.missingInformation ?? []),
    };
  }
  return {
    summary: null,
    supportingData: why ? reasonToSupportingData(why) : [],
    confidence: normalizeConfidence(input.confidence),
    missingInformation: nonEmptyLines(input.missingInformation ?? []),
  };
}

export function fromInsightProposal(
  insight: Pick<
    InsightProposal,
    "evidence" | "confidence" | "nutritionPrescriptionNote"
  >,
): ExplainableInsightView {
  const missing: string[] = [];
  if (insight.nutritionPrescriptionNote?.trim()) {
    missing.push(insight.nutritionPrescriptionNote.trim());
  }
  return {
    summary: null,
    supportingData: insight.evidence.map(
      (e) => `${INSIGHT_DOMAIN_LABELS[e.domain]}: ${e.statement}`,
    ),
    confidence: normalizeConfidence(insight.confidence),
    missingInformation: missing,
  };
}

export function fromWeakPointFinding(
  finding: Pick<
    WeakPointFinding,
    "evidence" | "confidence" | "missingInformation" | "detail"
  >,
): ExplainableInsightView {
  return {
    summary: finding.detail.trim() || null,
    supportingData: finding.evidence.map((e) =>
      e.detail.trim() ? `${e.label}. ${e.detail}` : e.label,
    ),
    confidence: finding.confidence,
    missingInformation: nonEmptyLines(finding.missingInformation),
  };
}

export function fromDailyBriefInsight(
  insight: Pick<DailyBriefInsight, "why" | "confidence">,
  briefMissingSignals: readonly string[] = [],
): ExplainableInsightView {
  const why = insight.why?.trim() ?? "";
  return {
    summary: null,
    supportingData: why ? reasonToSupportingData(why) : [],
    confidence: insight.confidence,
    missingInformation: nonEmptyLines(briefMissingSignals),
  };
}

export function fromAdaptation(input: {
  reason: string;
  confidence: string;
  missingInformation?: readonly string[];
}): ExplainableInsightView {
  return {
    summary: null,
    supportingData: reasonToSupportingData(input.reason),
    confidence: normalizeConfidence(input.confidence),
    missingInformation: nonEmptyLines(input.missingInformation ?? []),
  };
}

export function fromScoreResult(input: {
  explanation: string;
  confidence: ConfidenceLevel;
  inputs: readonly { label: string; value: string | number | boolean | null }[];
  missingInputs: readonly string[];
}): ExplainableInsightView {
  return {
    summary: input.explanation.trim() || null,
    supportingData: input.inputs
      .filter((i) => i.value != null && i.value !== "")
      .map((i) => `${i.label}: ${String(i.value)}`),
    confidence: input.confidence,
    missingInformation: nonEmptyLines(input.missingInputs),
  };
}

export function fromFatigueAnalysis(
  analysis: Pick<
    FatigueAlertAnalysis,
    "explanation" | "signals" | "confidence"
  >,
): ExplainableInsightView {
  const supporting = [
    ...nonEmptyLines(analysis.explanation),
    ...analysis.signals
      .filter((s) => s.fired && s.available)
      .map((s) => `${s.label}: ${s.detail}`),
  ];
  const missing = analysis.signals
    .filter((s) => !s.available)
    .map((s) => `${s.label} unavailable`);
  return {
    summary: null,
    supportingData: supporting,
    confidence: analysis.confidence,
    missingInformation: missing,
  };
}

export function fromDeloadAnalysis(
  analysis: Pick<
    DeloadIntelligenceAnalysis,
    "explanation" | "signals" | "confidence"
  >,
): ExplainableInsightView {
  const supporting = [
    ...nonEmptyLines(analysis.explanation),
    ...analysis.signals
      .filter((s) => s.fired && s.available)
      .map((s) => `${s.label}: ${s.detail}`),
  ];
  const missing = analysis.signals
    .filter((s) => !s.available)
    .map((s) => `${s.label} unavailable`);
  return {
    summary: null,
    supportingData: supporting,
    confidence: analysis.confidence,
    missingInformation: missing,
  };
}

export function fromPersonalizationItem(input: {
  drivenBy: readonly string[];
  confidence: string;
  missingNote?: string | null;
}): ExplainableInsightView {
  const missing = input.missingNote?.trim()
    ? [input.missingNote.trim()]
    : [];
  return {
    summary: null,
    supportingData: nonEmptyLines(input.drivenBy),
    confidence: normalizeConfidence(input.confidence),
    missingInformation: missing,
  };
}

export function fromCoachChatAnswer(input: {
  confidence: ConfidenceLevel;
  dataRefs: readonly { label: string; detail: string }[];
  missingInformation: readonly string[];
}): ExplainableInsightView {
  return {
    summary: null,
    supportingData: input.dataRefs.map((r) =>
      r.detail.trim() ? `${r.label}: ${r.detail}` : r.label,
    ),
    confidence: input.confidence,
    missingInformation: nonEmptyLines(input.missingInformation),
  };
}

/** PR / e1RM prediction ranges (Prompt 182 trust wiring). */
export function fromPrPrediction(input: {
  exerciseLabel: string;
  rangeKg: { low: number; high: number };
  confidence: string;
  assumptions: readonly string[];
  inputsUsed: {
    qualifyingSetCount: number;
    hardSetCount: number;
    setsWithRpe: number;
    trend: string;
    trainingPhase: string;
    fatigue: number | null;
  };
}): ExplainableInsightView {
  const supporting = [
    `Estimated range: ${input.rangeKg.low}–${input.rangeKg.high} kg (${input.exerciseLabel})`,
    `Qualifying sets: ${input.inputsUsed.qualifyingSetCount} (${input.inputsUsed.hardSetCount} hard)`,
    `Sets with RPE: ${input.inputsUsed.setsWithRpe}`,
    `Trend: ${input.inputsUsed.trend}`,
    `Training phase: ${input.inputsUsed.trainingPhase}`,
    input.inputsUsed.fatigue != null
      ? `Fatigue logged: ${input.inputsUsed.fatigue}/10`
      : "Fatigue not logged",
    ...input.assumptions.slice(0, 4),
  ];
  return {
    summary: "Conservative estimated 1RM range from recent working sets — not a verified PR.",
    supportingData: supporting,
    confidence: normalizeConfidence(input.confidence),
    missingInformation:
      input.inputsUsed.fatigue == null ? ["Fatigue not logged"] : [],
  };
}

/** Goal progress assessments — never a probability percent. */
export function fromGoalProgressAssessment(input: {
  status: string;
  reasons: readonly string[];
  honestyNote: string;
  currentEstimateKg: { low: number; high: number } | null;
}): ExplainableInsightView {
  let confidence: ConfidenceLevel = "low";
  if (input.status === "insufficient_data") confidence = "none";
  else if (input.status === "on_track" || input.status === "target_reached") {
    confidence = "medium";
  } else if (input.status === "possible_but_aggressive") {
    confidence = "low";
  }

  const supporting = [
    ...(input.currentEstimateKg
      ? [
          `Current estimate: ${input.currentEstimateKg.low}–${input.currentEstimateKg.high} kg`,
        ]
      : ["Current estimate unavailable"]),
    ...input.reasons,
  ];

  return {
    summary: input.honestyNote,
    supportingData: supporting,
    confidence,
    missingInformation:
      input.status === "insufficient_data"
        ? ["Not enough trajectory samples or estimate data"]
        : [],
  };
}

/** Exercise prescription catalog recommendations. */
export function fromExercisePrescriptionRec(input: {
  reason: string;
  matchedRuleLabels: readonly string[];
  score: number;
}): ExplainableInsightView {
  const confidence: ConfidenceLevel =
    input.score >= 80 ? "high" : input.score >= 50 ? "medium" : "low";
  return {
    summary: input.reason.trim() || null,
    supportingData: input.matchedRuleLabels.map((l) => `Rule: ${l}`),
    confidence,
    missingInformation: [],
  };
}

/**
 * Canonical example from Prompt 141 — used in tests and docs only.
 * Not shown as live athlete data.
 */
export const EXPLAINABLE_AI_EXAMPLE: {
  recommendation: string;
  view: ExplainableInsightView;
} = {
  recommendation: "Keep deadlift load unchanged.",
  view: {
    summary: null,
    supportingData: [
      "RPE increased.",
      "Rep speed trend decreased.",
    ],
    confidence: "medium",
    missingInformation: ["Recovery data incomplete."],
  },
};

export function buildExplainableInsight(input: {
  summary?: string | null;
  supportingData?: readonly string[];
  confidence?: ConfidenceLevel | string;
  missingInformation?: readonly string[];
}): ExplainableInsightView {
  return {
    summary: input.summary?.trim() || null,
    supportingData: nonEmptyLines(input.supportingData ?? []),
    confidence: normalizeConfidence(input.confidence),
    missingInformation: nonEmptyLines(input.missingInformation ?? []),
  };
}
