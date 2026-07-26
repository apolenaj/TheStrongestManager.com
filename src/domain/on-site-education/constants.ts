/**
 * On-Site Education Engine (Prompt 172).
 * When a user sees a metric, allow “Learn why” — explain in context without leaving the page.
 */

export const ON_SITE_EDUCATION_ENGINE_VERSION = "on_site_education.v1" as const;

export const ON_SITE_EDUCATION_TRIGGER_LABEL = "Learn why" as const;

export const ON_SITE_EDUCATION_HONESTY = [
  "Education explains how a metric is defined in this product — not medical advice or a guaranteed training outcome.",
  "Explanations stay on-site (expand in place). We do not force a separate marketing page to understand a dashboard metric.",
  "Copy is deterministic and catalogued. Missing data stays missing; we do not invent confidence or scores in education text.",
] as const;

/** Primary topics called out in Prompt 172 + Athlete Score pillars. */
export type EducationTopicId =
  | "rpe"
  | "training_volume"
  | "technique_confidence"
  | "estimated_1rm"
  | "overall"
  | "strength"
  | "technique"
  | "programming"
  | "recovery"
  | "consistency";

export type EducationRelatedLink = {
  href: string;
  label: string;
  /** Prefer /app/* so the athlete stays in product. */
  surface: "app" | "public";
};

export type EducationTopic = {
  id: EducationTopicId;
  title: string;
  /** One–two sentences under the metric. */
  shortWhy: string;
  /** Expandable in-context body. */
  inContextExplanation: string;
  relatedLinks: EducationRelatedLink[];
};

export const EDUCATION_TOPIC_IDS: readonly EducationTopicId[] = [
  "rpe",
  "training_volume",
  "technique_confidence",
  "estimated_1rm",
  "overall",
  "strength",
  "technique",
  "programming",
  "recovery",
  "consistency",
] as const;
