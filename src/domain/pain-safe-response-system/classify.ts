/**
 * Classify free-text reports into sharp pain / neurological / serious injury.
 * Conservative — DOMS-style soreness alone does not match.
 */

import {
  PAIN_SAFE_CATEGORY_LABELS,
  type PainSafeCategory,
} from "@/domain/pain-safe-response-system/constants";
import type { PainSafeDetection } from "@/domain/pain-safe-response-system/types";

const SHARP_PAIN_RE =
  /\b(sharp\s+pain|stabbing|knife[- ]like|sudden\s+sharp|acute\s+sharp|pinching\s+sharp)\b/i;

const NEURO_RE =
  /\b(numb(ness|)|tingl(e|ing)|pins\s+and\s+needles|radiat(e|ing)|shooting\s+down|loss\s+of\s+sensation|can'?t\s+feel|foot\s+drop|unexplained\s+weakness|neurolog(ic|ical))\b/i;

const SERIOUS_INJURY_RE =
  /\b(serious\s+injur(y|ed)|torn\s+(acl|mcl|pcl|rotator)|rupture|fracture|broken\s+bone|dislocat(ed|ion)|er\s+visit|emergency\s+room|surgery|operated\s+on|hospitali[sz]ed)\b/i;

/** Soft muscle soreness — must NOT activate pain-safe mode alone. */
const DOMS_ONLY_RE =
  /\b(doms|muscle\s+soreness|sore\s+from\s+training|normal\s+soreness|delayed\s+onset)\b/i;

export function classifyPainSafeText(text: string): PainSafeCategory[] {
  const t = text.trim();
  if (!t) return [];
  // Pure DOMS language without red-flag patterns → empty
  if (DOMS_ONLY_RE.test(t) && !SHARP_PAIN_RE.test(t) && !NEURO_RE.test(t) && !SERIOUS_INJURY_RE.test(t)) {
    return [];
  }
  const out: PainSafeCategory[] = [];
  if (SHARP_PAIN_RE.test(t)) out.push("sharp_pain");
  if (NEURO_RE.test(t)) out.push("neurological");
  if (SERIOUS_INJURY_RE.test(t)) out.push("serious_injury");
  return out;
}

export function detectionsFromText(input: {
  text: string;
  source: "user_report" | "inferred";
}): PainSafeDetection[] {
  const categories = classifyPainSafeText(input.text);
  return categories.map((category) => ({
    category,
    label: PAIN_SAFE_CATEGORY_LABELS[category],
    matched: true,
    evidence: input.text.slice(0, 160),
    source: input.source,
  }));
}

export function detectionsFromExplicitReports(
  reports: Array<{
    category: PainSafeCategory;
    notes: string | null;
    source: "user_report" | "inferred";
    active: boolean;
  }>,
): PainSafeDetection[] {
  return reports
    .filter((r) => r.active)
    .map((r) => ({
      category: r.category,
      label: PAIN_SAFE_CATEGORY_LABELS[r.category],
      matched: true,
      evidence: r.notes?.trim() || PAIN_SAFE_CATEGORY_LABELS[r.category],
      source: r.source,
    }));
}
