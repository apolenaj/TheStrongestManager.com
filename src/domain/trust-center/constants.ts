/**
 * Trust Center (Prompt 140).
 * Public trust differentiator — how AI works, limits, privacy, scoring, evidence.
 * Composes existing product honesty; never invents capabilities.
 */

import { COACH_BRAIN_HONESTY } from "@/domain/coach-brain/constants";
import { COACH_AI_COPILOT_HONESTY } from "@/domain/coach-ai/constants";
import { EVIDENCE_QUALITY_HONESTY } from "@/domain/evidence-quality/constants";
import { MOVEMENT_DISCLAIMERS } from "@/domain/movement/constants";
import { PAIN_SAFE_RESPONSE_HONESTY } from "@/domain/pain-safe-response-system/constants";
import { TECHNIQUE_PRIVACY_COPY } from "@/domain/technique/constants";

export const TRUST_CENTER_ENGINE_VERSION = "trust_center.v1" as const;

export const TRUST_CENTER_TAGLINE =
  "Honest AI for strength training — clear about what we do, what we refuse, and how we protect your data." as const;

export const TRUST_CENTER_INTRO =
  "Trust is not a slogan. This page is the product contract: capabilities, limits, privacy, scoring honesty, safety, and evidence standards — in one place." as const;

export const TRUST_CENTER_SECTION_IDS = [
  "how-ai-works",
  "what-ai-can-do",
  "what-ai-cannot-do",
  "data-privacy",
  "video-privacy",
  "scoring-methodology",
  "safety-limitations",
  "evidence-standards",
] as const;

export type TrustCenterSectionId = (typeof TRUST_CENTER_SECTION_IDS)[number];

export type TrustCenterSection = {
  id: TrustCenterSectionId;
  title: string;
  summary: string;
  points: readonly string[];
  relatedHref?: string;
  relatedLabel?: string;
};

/**
 * How AI works — grounded in Coach Brain honesty.
 */
export const TRUST_HOW_AI_WORKS: readonly string[] = [
  COACH_BRAIN_HONESTY[0],
  "Structured tools gather athlete context (profile, training, technique trends, recovery, goals) before recommendations are emitted.",
  COACH_BRAIN_HONESTY[2],
  "Safety and rule checks run before anything is shown as a recommendation — rejected outputs stay rejected.",
  COACH_AI_COPILOT_HONESTY[0],
  "Every AI insight supports “Why am I seeing this?” — supporting data, confidence, and missing information.",
  "Data freshness is shown per pillar (Technique, Recovery, Strength) — AI confidence is capped when signals are stale or missing.",
  "Inference cost is controlled — LLMs are not used for calculations, filters, rules, or scoring formulas; spend is metered per feature.",
  "Model routing is multi-provider — text, vision, summarization, and classification use separate chains with fallbacks.",
  "AI observability monitors requests, success, latency, cost, and feedback without logging private raw inputs.",
  "The product ships in English; additional languages require reviewed catalogs — technical fitness terms are not auto-translated.",
];

/**
 * What AI can do — only claims that match shipped product posture.
 */
export const TRUST_WHAT_AI_CAN_DO: readonly string[] = [
  "Summarize structured training context and surface missing information instead of guessing.",
  "Draft coaching recommendations and program-adjustment ideas for human review.",
  "Support technique analysis when a real backend is configured — with confidence and visibility limits.",
  "Label content evidence quality so research claims stay separate from coaching practice.",
  "Apply pain-safe gating that withholds aggressive progression advice when serious symptoms are reported.",
];

/**
 * What AI cannot do — explicit refusals (major differentiator).
 */
export const TRUST_WHAT_AI_CANNOT_DO: readonly string[] = [
  COACH_BRAIN_HONESTY[1],
  "It does not diagnose injury, disease, or medical conditions.",
  MOVEMENT_DISCLAIMERS[1],
  "It does not invent technique scores, citations, coach listings, or marketplace programs.",
  "It is not a generic chatbot that improvises training plans from chat alone.",
  "It does not auto-apply program changes or coach decisions without explicit human confirmation.",
  "Fatigue and recovery language is coaching-practice heuristic — not clinical assessment.",
  "When AI is unavailable, the product shows a structured failure — never fabricated recommendations or scores.",
];

/**
 * Data privacy — account / export / delete posture.
 */
export const TRUST_DATA_PRIVACY: readonly string[] = [
  "Account identifiers and athlete training data you enter are stored for your account — not published as a public feed.",
  "Signed-in athletes can export a JSON copy of their data and delete their account from Settings.",
  "Analytics use opaque ids and allowlisted enums — never emails, notes, raw health values, or video bytes.",
  "Optional data-moat aggregation (when offered) requires consent and excludes identifiable payloads without it.",
  "This Trust Center is product honesty — see Privacy Policy for the legal draft pending counsel review.",
];

/**
 * Video privacy — technique uploads.
 */
export const TRUST_VIDEO_PRIVACY: readonly string[] = [
  TECHNIQUE_PRIVACY_COPY,
  "Playback uses short-lived signed URLs tied to your session — not open public links.",
  "You can delete an uploaded technique analysis and its private media from the product.",
  MOVEMENT_DISCLAIMERS[0],
];

/**
 * Scoring methodology overview — no invented scores.
 */
export const TRUST_SCORING_METHODOLOGY: readonly string[] = [
  "Scores use named thresholds with written rationale — not arbitrary magic numbers.",
  "If minimum data is missing, score stays null and confidence is Insufficient data — we do not invent a number.",
  "UI must hide scores with none or low confidence (displayableScore) — weak estimates are not shown as truth.",
  "Composite athlete scores never zero-fill missing pillars to fake completeness.",
  "Every result carries inputs, missing inputs, explanation, and formula version metadata for transparency.",
  "Confidence is High, Moderate, Low, or Insufficient data — never a precise percentage unless a calibrated model exists.",
  MOVEMENT_DISCLAIMERS[2],
];

/**
 * Safety limitations — pain-safe + medical boundary.
 */
export const TRUST_SAFETY_LIMITATIONS: readonly string[] = [
  ...PAIN_SAFE_RESPONSE_HONESTY,
  "The Strongest is a performance training product — not medical care.",
  "Pain, injury, and health decisions require a qualified professional who knows your history.",
];

/**
 * Evidence standards — research vs practice.
 */
export const TRUST_EVIDENCE_STANDARDS: readonly string[] = [
  ...EVIDENCE_QUALITY_HONESTY,
  "Strong / moderate / limited describe research support — still not a guarantee for every athlete.",
  "Coaching consensus and heuristics stay labeled as practice even when widely believed.",
];

export function getTrustCenterSections(): TrustCenterSection[] {
  return [
    {
      id: "how-ai-works",
      title: "How AI works",
      summary:
        "Structured athlete data and deterministic rules — not a freeform chatbot.",
      points: TRUST_HOW_AI_WORKS,
    },
    {
      id: "what-ai-can-do",
      title: "What it can do",
      summary:
        "Draft, summarize, label, and gate — always with human confirmation where programs change.",
      points: TRUST_WHAT_AI_CAN_DO,
    },
    {
      id: "what-ai-cannot-do",
      title: "What it cannot do",
      summary:
        "No silent auto-apply, no diagnoses, no invented scores or citations.",
      points: TRUST_WHAT_AI_CANNOT_DO,
    },
    {
      id: "data-privacy",
      title: "Data privacy",
      summary: "Your account data stays yours — export and delete from Settings.",
      points: TRUST_DATA_PRIVACY,
      relatedHref: "/privacy",
      relatedLabel: "Privacy Policy",
    },
    {
      id: "video-privacy",
      title: "Video privacy",
      summary:
        "Technique videos are private to your account — not marketing material.",
      points: TRUST_VIDEO_PRIVACY,
    },
    {
      id: "scoring-methodology",
      title: "Scoring methodology overview",
      summary:
        "Named thresholds, confidence gates, and no invented numbers.",
      points: TRUST_SCORING_METHODOLOGY,
    },
    {
      id: "safety-limitations",
      title: "Safety limitations",
      summary:
        "Pain-safe gating withholds aggressive advice — this app never diagnoses.",
      points: TRUST_SAFETY_LIMITATIONS,
    },
    {
      id: "evidence-standards",
      title: "Evidence standards",
      summary:
        "Research evidence stays separate from expert practice — missing citations stay missing.",
      points: TRUST_EVIDENCE_STANDARDS,
      relatedHref: "/evidence",
      relatedLabel: "Evidence Quality System",
    },
  ];
}
