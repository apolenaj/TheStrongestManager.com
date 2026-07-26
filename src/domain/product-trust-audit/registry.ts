/**
 * AI feature trust registry — Prompt 182 review + fixes.
 */

import type { ProductTrustFeatureEntry } from "@/domain/product-trust-audit/types";
import {
  PRODUCT_TRUST_STATUS_RANK,
  type ProductTrustCriterionId,
  type ProductTrustStatus,
} from "@/domain/product-trust-audit/constants";

function overallOf(
  criteria: ProductTrustFeatureEntry["criteria"],
): ProductTrustStatus {
  const ranks = (
    Object.keys(criteria) as ProductTrustCriterionId[]
  ).map((k) => PRODUCT_TRUST_STATUS_RANK[criteria[k].status]);
  const min = Math.min(...ranks);
  if (min === 0) return "fail";
  if (min === 1) return "partial";
  return "pass";
}

function entry(
  partial: Omit<ProductTrustFeatureEntry, "overall">,
): ProductTrustFeatureEntry {
  return { ...partial, overall: overallOf(partial.criteria) };
}

/**
 * Post-fix registry. Documented gaps preserve the audit trail.
 */
export const PRODUCT_TRUST_AI_FEATURES: readonly ProductTrustFeatureEntry[] = [
  entry({
    id: "coach_brain",
    title: "AI Coach Brain",
    surface: "/app/ai-coach",
    flag: "appCoach",
    criteria: {
      provenance: {
        status: "pass",
        note: "Why am I seeing this? + supportingData + ruleId.",
      },
      confidence: {
        status: "pass",
        note: "ConfidenceBadge on each recommendation.",
      },
      certainty_risk: {
        status: "pass",
        note: "Honesty + certainty disclaimer; no diagnosis claims.",
      },
      challenge: {
        status: "pass",
        note: "Helpful/not helpful feedback; adaptations require confirmation.",
      },
    },
    documentedGaps: [
      "Pre-fix: no athlete feedback controls on recommendation cards.",
    ],
    fixesApplied: [
      "AthleteAiFeedbackControls + AiTrustChrome on Coach Brain cards.",
    ],
  }),
  entry({
    id: "coach_chat",
    title: "AI Coach Chat",
    surface: "/app/ai-coach",
    flag: "appCoach",
    criteria: {
      provenance: {
        status: "pass",
        note: "Data refs + WhyAmISeeingThis from chat tools.",
      },
      confidence: {
        status: "pass",
        note: "ConfidenceBadge per answer.",
      },
      certainty_risk: {
        status: "pass",
        note: "Adversarial refusals + certainty disclaimer; does not diagnose.",
      },
      challenge: {
        status: "pass",
        note: "Helpful/not helpful on each assistant turn.",
      },
    },
    documentedGaps: [
      "Pre-fix: provenance/confidence present; no challenge/feedback on turns.",
    ],
    fixesApplied: ["AthleteAiFeedbackControls on assistant messages."],
  }),
  entry({
    id: "coach_ai_copilot",
    title: "Coach AI Copilot",
    surface: "/app/coach/[athleteProfileId]",
    flag: "coachAiCopilot",
    criteria: {
      provenance: {
        status: "pass",
        note: "Why + supporting data on drafts.",
      },
      confidence: { status: "pass", note: "Draft confidence labels." },
      certainty_risk: {
        status: "pass",
        note: "Never auto-applies; coaching drafts only.",
      },
      challenge: {
        status: "pass",
        note: "Coach Accept / Edit / Reject with model feedback.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "cross_domain_insights",
    title: "Cross-domain insights",
    surface: "/app/insights",
    flag: "appInsights",
    criteria: {
      provenance: { status: "pass", note: "Evidence by domain + Why panel." },
      confidence: { status: "pass", note: "Insight confidence." },
      certainty_risk: {
        status: "pass",
        note: "Heuristic when enough data; nutrition caveats.",
      },
      challenge: {
        status: "pass",
        note: "Athlete helpful/not helpful feedback.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "adaptive_programming",
    title: "Adaptive programming",
    surface: "/app/adaptations",
    flag: null,
    criteria: {
      provenance: { status: "pass", note: "Why panel from adaptation reasons." },
      confidence: { status: "pass", note: "Confidence on suggestions." },
      certainty_risk: {
        status: "pass",
        note: "Suggestions only — never auto-applied.",
      },
      challenge: {
        status: "pass",
        note: "Accept / Modify / Decline + feedback.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "daily_coaching_brief",
    title: "Daily coaching brief",
    surface: "/app/daily-brief",
    flag: null,
    criteria: {
      provenance: { status: "pass", note: "WhyAmISeeingThis per insight." },
      confidence: { status: "pass", note: "Per-insight confidence." },
      certainty_risk: {
        status: "pass",
        note: "Certainty disclaimer via shared chrome.",
      },
      challenge: {
        status: "pass",
        note: "Helpful/not helpful on brief insights.",
      },
    },
    documentedGaps: ["Pre-fix: explainable UI present; no challenge controls."],
    fixesApplied: ["AthleteAiFeedbackControls + AiTrustChrome on brief items."],
  }),
  entry({
    id: "weak_point_intelligence",
    title: "Weak-point intelligence",
    surface: "/app/weak-points",
    flag: "weakPointIntelligence",
    criteria: {
      provenance: { status: "pass", note: "Evidence + Why panel." },
      confidence: { status: "pass", note: "Finding confidence." },
      certainty_risk: {
        status: "pass",
        note: "Never from appearance alone; not diagnosis.",
      },
      challenge: {
        status: "pass",
        note: "Feedback + link to prescription/logging.",
      },
    },
    documentedGaps: ["Pre-fix: no athlete feedback on findings."],
    fixesApplied: ["AthleteAiFeedbackControls on weak-point cards."],
  }),
  entry({
    id: "fatigue_alerts",
    title: "Fatigue alert system",
    surface: "/app/fatigue",
    flag: null,
    criteria: {
      provenance: { status: "pass", note: "Why from load signals." },
      confidence: { status: "pass", note: "Analysis confidence." },
      certainty_risk: {
        status: "pass",
        note: "Not a medical fatigue diagnosis.",
      },
      challenge: {
        status: "pass",
        note: "Feedback + recovery/log correction path.",
      },
    },
    documentedGaps: ["Pre-fix: no challenge controls."],
    fixesApplied: ["AthleteAiFeedbackControls + AiTrustChrome."],
  }),
  entry({
    id: "deload_intelligence",
    title: "Deload intelligence",
    surface: "/app/deload",
    flag: null,
    criteria: {
      provenance: { status: "pass", note: "Why from deload analysis." },
      confidence: { status: "pass", note: "Analysis confidence." },
      certainty_risk: {
        status: "pass",
        note: "Suggestion — confirm via adaptations.",
      },
      challenge: {
        status: "pass",
        note: "Feedback + Adaptations Accept/Modify/Decline.",
      },
    },
    documentedGaps: ["Pre-fix: no athlete feedback."],
    fixesApplied: ["AthleteAiFeedbackControls + AiTrustChrome."],
  }),
  entry({
    id: "personalization_engine",
    title: "Personalization engine",
    surface: "/app/personalization",
    flag: "personalizationEngine",
    criteria: {
      provenance: { status: "pass", note: "Why panel on items." },
      confidence: { status: "pass", note: "Item confidence." },
      certainty_risk: {
        status: "pass",
        note: "Behavior/product context — not medical profiling.",
      },
      challenge: {
        status: "partial",
        note: "Correct via settings/onboarding signals; feedback optional.",
      },
    },
    documentedGaps: [],
    fixesApplied: ["AiTrustChrome certainty disclaimer on panel items."],
  }),
  entry({
    id: "pr_prediction",
    title: "PR / e1RM prediction",
    surface: "/app/pr-prediction",
    flag: "prPrediction",
    criteria: {
      provenance: {
        status: "pass",
        note: "Inputs used + WhyAmISeeingThis adapter.",
      },
      confidence: { status: "pass", note: "ConfidenceBadge on ranges." },
      certainty_risk: {
        status: "pass",
        note: "Range-only + certainty disclaimer; not a verified PR.",
      },
      challenge: {
        status: "pass",
        note: "Helpful/not helpful; correct by logging sets/RPE.",
      },
    },
    documentedGaps: [
      "Pre-fix: inputs shown but no shared Why panel, certainty chrome, or feedback.",
    ],
    fixesApplied: [
      "fromPrPrediction adapter, WhyAmISeeingThis, AiTrustChrome, feedback.",
    ],
  }),
  entry({
    id: "goal_probability",
    title: "Goal progress (no fake %)",
    surface: "/app/goal-progress",
    flag: "goalProbability",
    criteria: {
      provenance: { status: "pass", note: "Reasons + estimate inputs." },
      confidence: {
        status: "pass",
        note: "Derived ConfidenceBadge from trajectory status.",
      },
      certainty_risk: {
        status: "pass",
        note: "Explicit no probability % + certainty disclaimer.",
      },
      challenge: {
        status: "pass",
        note: "Feedback; correct goals/logs to change trajectory.",
      },
    },
    documentedGaps: [
      "Pre-fix: Why text + honesty note, but no confidence badge or feedback.",
    ],
    fixesApplied: [
      "ConfidenceBadge, WhyAmISeeingThis, AiTrustChrome, feedback.",
    ],
  }),
  entry({
    id: "exercise_prescription",
    title: "Exercise prescription",
    surface: "/app/exercise-prescription",
    flag: "exercisePrescription",
    criteria: {
      provenance: {
        status: "pass",
        note: "Why + matched rules from catalog.",
      },
      confidence: {
        status: "pass",
        note: "Heuristic confidence from score band via Why panel.",
      },
      certainty_risk: {
        status: "pass",
        note: "Multi-rule catalog — not medical prescription.",
      },
      challenge: {
        status: "pass",
        note: "Update weak-point input + feedback; open exercise detail.",
      },
    },
    documentedGaps: [
      "Pre-fix: Why present; no confidence label, certainty chrome, or feedback.",
    ],
    fixesApplied: [
      "WhyAmISeeingThis + AiTrustChrome + AthleteAiFeedbackControls.",
    ],
  }),
  entry({
    id: "technique_analysis",
    title: "Technique analysis",
    surface: "/app/technique",
    flag: null,
    criteria: {
      provenance: {
        status: "pass",
        note: "Formula id/version, components, confidence basis.",
      },
      confidence: {
        status: "pass",
        note: "ConfidenceBadge + Learn why.",
      },
      certainty_risk: {
        status: "pass",
        note: "Image-plane heuristic — not biomechanics lab certainty.",
      },
      challenge: {
        status: "pass",
        note: "Expert review / re-upload; rule-gated feedback engine.",
      },
    },
    documentedGaps: [],
    fixesApplied: ["AiTrustChrome certainty line on technique report hero."],
  }),
  entry({
    id: "program_ai_review",
    title: "AI program review",
    surface: "/app/programs",
    flag: null,
    criteria: {
      provenance: { status: "pass", note: "Review findings with reasons." },
      confidence: { status: "partial", note: "Finding severity; not always badge." },
      certainty_risk: {
        status: "pass",
        note: "Heuristic program critique — not scientific proof.",
      },
      challenge: {
        status: "pass",
        note: "AthleteAiFeedbackControls on review items.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "training_audit",
    title: "Automatic training audit",
    surface: "/app/training-audit",
    flag: "trainingAudit",
    criteria: {
      provenance: {
        status: "pass",
        note: "Deterministic checks with stated inputs.",
      },
      confidence: {
        status: "partial",
        note: "Quality pass/fail — not universal confidence scale on every row.",
      },
      certainty_risk: {
        status: "pass",
        note: "No fake audit score theater; heuristic findings.",
      },
      challenge: {
        status: "partial",
        note: "Correct by editing program / re-running audit.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "ai_research_summarizer",
    title: "AI research summarizer",
    surface: "/app/admin (research) / library",
    flag: "aiResearchSummarizer",
    criteria: {
      provenance: {
        status: "pass",
        note: "Citation required from verified pasted input only.",
      },
      confidence: {
        status: "partial",
        note: "Draft until human review — confidence is review status.",
      },
      certainty_risk: {
        status: "pass",
        note: "Never invents DOIs; evidence-quality labels; not clinical advice.",
      },
      challenge: {
        status: "pass",
        note: "Human review queue approve/reject.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "decision_tree_tools",
    title: "Decision-tree coaching tools",
    surface: "/tools (decision trees)",
    flag: null,
    criteria: {
      provenance: {
        status: "pass",
        note: "Interactive structured rules with explained outputs.",
      },
      confidence: {
        status: "partial",
        note: "Rule path shown; not always ConfidenceBadge.",
      },
      certainty_risk: {
        status: "pass",
        note: "Explicitly not medical advice.",
      },
      challenge: {
        status: "partial",
        note: "Re-run tree with different answers.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "program_audit_funnel",
    title: "Free program audit funnel",
    surface: "/program-audit",
    flag: "programAudit",
    criteria: {
      provenance: {
        status: "pass",
        note: "Deterministic checks; engine version shown.",
      },
      confidence: {
        status: "partial",
        note: "Quality checks — not always High/Moderate/Low badge.",
      },
      certainty_risk: {
        status: "pass",
        note: "No fake score; honesty copy.",
      },
      challenge: {
        status: "partial",
        note: "Re-submit / claim ticket; not in-app feedback widget.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
  entry({
    id: "athlete_assessment_funnel",
    title: "Free athlete assessment",
    surface: "/athlete-assessment",
    flag: "athleteAssessment",
    criteria: {
      provenance: {
        status: "pass",
        note: "Self-assessment estimate — labeled as such.",
      },
      confidence: {
        status: "partial",
        note: "Estimate framing; not full Athlete Score confidence.",
      },
      certainty_risk: {
        status: "pass",
        note: "Not full Athlete Score; not medical.",
      },
      challenge: {
        status: "partial",
        note: "Retake / complete onboarding for real profile.",
      },
    },
    documentedGaps: [],
    fixesApplied: [],
  }),
] as const;

export function listProductTrustOpenFailures(
  features: readonly ProductTrustFeatureEntry[] = PRODUCT_TRUST_AI_FEATURES,
): ProductTrustFeatureEntry[] {
  return features.filter((f) => f.overall === "fail");
}

export function summarizeProductTrustCounts(
  features: readonly ProductTrustFeatureEntry[] = PRODUCT_TRUST_AI_FEATURES,
) {
  return {
    total: features.length,
    pass: features.filter((f) => f.overall === "pass").length,
    partial: features.filter((f) => f.overall === "partial").length,
    fail: features.filter((f) => f.overall === "fail").length,
  };
}
