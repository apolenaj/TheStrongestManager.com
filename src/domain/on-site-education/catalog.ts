/**
 * Allowlisted on-site education topics (Prompt 172).
 */

import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import type { EducationTopic, EducationTopicId } from "@/domain/on-site-education/constants";

function fromScoreDefinition(
  id: Extract<
    EducationTopicId,
    "overall" | "strength" | "technique" | "programming" | "recovery" | "consistency"
  >,
  relatedLinks: EducationTopic["relatedLinks"],
): EducationTopic {
  const def = SCORE_DEFINITIONS[id];
  return {
    id,
    title: def.label,
    shortWhy: `This pillar uses logged product data only. Required minima: ${def.requiredMinimumData.join("; ")}.`,
    inContextExplanation: [
      def.formula,
      `Inputs: ${def.inputSources.join("; ")}.`,
      `Confidence: ${def.confidenceRules}`,
      "Unavailable pillars are omitted from overall — never zero-filled.",
    ].join(" "),
    relatedLinks,
  };
}

export const EDUCATION_TOPICS: Record<EducationTopicId, EducationTopic> = {
  rpe: {
    id: "rpe",
    title: "RPE",
    shortWhy:
      "RPE (Rate of Perceived Exertion) is how hard a set felt on a 1–10 scale you log — not a lab fatigue measurement.",
    inContextExplanation:
      "In The Strongest, RPE is athlete-reported on sets and sessions. Hard-set tracking treats RPE ≥ 8 (or low RIR) as a heuristic for dense work — useful for load trends, not a medical diagnosis. Missing RPE stays blank; we never invent it from video or heart rate.",
    relatedLinks: [
      { href: "/app/today", label: "Log RPE in Today", surface: "app" },
      { href: "/app/progress", label: "Progress charts", surface: "app" },
    ],
  },
  training_volume: {
    id: "training_volume",
    title: "Training volume",
    shortWhy:
      "Volume here is estimated tonnage from logged sets: load × reps when both exist — not a quality-of-stimulus score.",
    inContextExplanation:
      "Weekly volume charts sum real logged tonnage. Sets without load or reps are excluded, not invented. Spikes vs a recent baseline are conservative volume alerts, not injury predictions. More kilograms moved does not automatically mean a better week.",
    relatedLinks: [
      { href: "/app/progress", label: "Volume on Progress", surface: "app" },
      { href: "/app/today", label: "Log sets in Today", surface: "app" },
    ],
  },
  technique_confidence: {
    id: "technique_confidence",
    title: "Technique confidence",
    shortWhy:
      "Confidence describes how much observable 2D evidence supported the analysis — High / Moderate / Low / Insufficient data.",
    inContextExplanation:
      "Technique Score and movement metrics only display when confidence allows. Low confidence usually means camera angle, landmark coverage, or incomplete components — not that you “failed.” We hide or withhold numbers rather than inventing a precise-looking score from poor evidence.",
    relatedLinks: [
      { href: "/app/technique", label: "Technique uploads", surface: "app" },
      {
        href: "/technique-check",
        label: "Free technique check",
        surface: "public",
      },
    ],
  },
  estimated_1rm: {
    id: "estimated_1rm",
    title: "Estimated 1RM",
    shortWhy:
      "Estimated 1RM uses the published Epley formula from multi-rep sets — never treated as a verified PR.",
    inContextExplanation:
      "When you log reps 2–12 with load, we may show an e1RM for planning. Singles are already a 1RM. High-rep sets are refused rather than fabricating precision. Charts label this as estimated; Progress never promotes e1RM to a verified personal record.",
    relatedLinks: [
      { href: "/app/progress", label: "Estimated 1RM chart", surface: "app" },
      { href: "/tools/estimated-1rm", label: "1RM calculator", surface: "public" },
    ],
  },
  overall: fromScoreDefinition("overall", [
    { href: "/app/dashboard", label: "Dashboard scores", surface: "app" },
    {
      href: "/athlete-assessment",
      label: "Self-assessment (not full score)",
      surface: "public",
    },
  ]),
  strength: fromScoreDefinition("strength", [
    { href: "/app/progress", label: "Strength progress", surface: "app" },
  ]),
  technique: fromScoreDefinition("technique", [
    { href: "/app/technique", label: "Technique", surface: "app" },
  ]),
  programming: fromScoreDefinition("programming", [
    { href: "/app/programs", label: "Programs", surface: "app" },
  ]),
  recovery: fromScoreDefinition("recovery", [
    { href: "/app/recovery", label: "Recovery", surface: "app" },
  ]),
  consistency: fromScoreDefinition("consistency", [
    { href: "/app/progress", label: "Consistency chart", surface: "app" },
  ]),
};

export function getEducationTopic(
  id: string,
): EducationTopic | null {
  if (!(id in EDUCATION_TOPICS)) return null;
  return EDUCATION_TOPICS[id as EducationTopicId];
}

/** Map dashboard / progress series keys to education topics. */
export function resolveEducationTopicId(
  metricKey: string,
): EducationTopicId | null {
  const key = metricKey.toLowerCase().trim();
  if (key === "athlete" || key === "athlete_score" || key === "overall") {
    return "overall";
  }
  if (key === "volume" || key === "training_volume" || key === "tonnage") {
    return "training_volume";
  }
  if (
    key === "technique_confidence" ||
    key === "techniquetrend" ||
    key === "technique_trend"
  ) {
    return "technique_confidence";
  }
  if (key === "estimated1rm" || key === "estimated_1rm" || key === "e1rm") {
    return "estimated_1rm";
  }
  if (key === "rpe" || key === "session_rpe") return "rpe";
  const direct = getEducationTopic(key);
  return direct ? direct.id : null;
}

export function allEducationTopics(): EducationTopic[] {
  return Object.values(EDUCATION_TOPICS);
}
