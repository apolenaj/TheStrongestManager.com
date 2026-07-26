/**
 * Evidence Quality System (Prompt 112).
 * Content evidence labels — never fake scientific certainty.
 */

export const EVIDENCE_QUALITY_ENGINE_VERSION =
  "evidence_quality.v1" as const;

/**
 * Canonical content evidence labels.
 * Research family and expert-practice family stay explicitly separated.
 */
export const EVIDENCE_QUALITY_LABELS = [
  "strong_evidence",
  "moderate_evidence",
  "limited_evidence",
  "coaching_consensus",
  "historical_method",
  "heuristic",
] as const;

export type EvidenceQualityLabel = (typeof EVIDENCE_QUALITY_LABELS)[number];

export const EVIDENCE_QUALITY_DISPLAY: Record<EvidenceQualityLabel, string> = {
  strong_evidence: "Strong evidence",
  moderate_evidence: "Moderate evidence",
  limited_evidence: "Limited evidence",
  coaching_consensus: "Coaching consensus",
  historical_method: "Historical method",
  heuristic: "Heuristic",
};

/** High-level family — research vs expert practice. */
export const EVIDENCE_QUALITY_FAMILIES = [
  "research_evidence",
  "expert_practice",
] as const;

export type EvidenceQualityFamily =
  (typeof EVIDENCE_QUALITY_FAMILIES)[number];

export const EVIDENCE_QUALITY_FAMILY_LABELS: Record<
  EvidenceQualityFamily,
  string
> = {
  research_evidence: "Research evidence",
  expert_practice: "Expert practice",
};

export const EVIDENCE_QUALITY_FAMILY_BY_LABEL: Record<
  EvidenceQualityLabel,
  EvidenceQualityFamily
> = {
  strong_evidence: "research_evidence",
  moderate_evidence: "research_evidence",
  limited_evidence: "research_evidence",
  coaching_consensus: "expert_practice",
  historical_method: "expert_practice",
  heuristic: "expert_practice",
};

export const EVIDENCE_QUALITY_DESCRIPTIONS: Record<
  EvidenceQualityLabel,
  string
> = {
  strong_evidence:
    "Supported by multiple relevant studies or well-established findings for the claim as stated. Still not a guarantee for every athlete.",
  moderate_evidence:
    "Some supportive research exists, but methods, populations, or effect sizes leave meaningful uncertainty.",
  limited_evidence:
    "Sparse, indirect, or low-quality research relative to the claim — treat as provisional.",
  coaching_consensus:
    "Common among experienced coaches or practice cultures. Not the same as peer-reviewed proof.",
  historical_method:
    "Describes how a method or system was used historically. History is not an evidence verdict.",
  heuristic:
    "A practical rule of thumb for decision-making. Useful when transparent; never presented as scientific certainty.",
};

export const EVIDENCE_QUALITY_HONESTY = [
  "Evidence labels describe the kind of support behind a claim — they do not invent scientific certainty.",
  "Research evidence (strong / moderate / limited) is separated from expert practice (coaching consensus / historical method / heuristic).",
  "Citations link only when a real source exists. Missing citations stay missing — we do not fabricate papers or URLs.",
  "Coaching practice content remains labeled as practice even when it is widely believed.",
] as const;

/** Legacy ExerciseEvidenceClaim.supportLevel values. */
export const LEGACY_SUPPORT_LEVELS = [
  "strong",
  "moderate",
  "limited",
] as const;

export type LegacySupportLevel = (typeof LEGACY_SUPPORT_LEVELS)[number];
