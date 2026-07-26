/**
 * Sport Goal Landing Pages (Prompt 167).
 * High-quality landings that link into real product features — no generic SEO filler.
 */

export const SPORT_GOAL_LANDING_ENGINE_VERSION =
  "sport_goal_landings.v1" as const;

export const SPORT_GOAL_LANDING_HONESTY = [
  "Each landing earns its URL with a unique goal narrative and CTAs into real product features.",
  "Generic SEO filler (keyword-stuffed blurbs without product paths) is refused by quality gates.",
  "Allowlisted pages only — never sport × goal × level cartesian factories.",
  "Authenticated /app links are honest product entry points; public pages stay indexable without inventing app content in schema.",
] as const;

export const SPORT_GOAL_LANDING_MIN_OVERVIEW = 180;
export const SPORT_GOAL_LANDING_MIN_SECTION_BODY = 90;
export const SPORT_GOAL_LANDING_MIN_SECTIONS = 2;
export const SPORT_GOAL_LANDING_MIN_PRODUCT_LINKS = 3;

/** Phrases that signal generic filler when they dominate overview/sections. */
export const SPORT_GOAL_FILLER_PHRASES = [
  "in today's fast-paced world",
  "look no further",
  "ultimate guide to",
  "everything you need to know",
  "unlock your potential",
  "game-changing results",
  "click here to learn more",
  "best tips and tricks",
] as const;

export type SportGoalProductLink = {
  href: string;
  label: string;
  /** Why this feature helps the goal — must be specific. */
  reason: string;
  /** public = marketing/indexable path; app = authenticated product. */
  surface: "public" | "app";
};

export type SportGoalSection = {
  heading: string;
  body: string;
};

export type SportGoalFaq = {
  question: string;
  answer: string;
};

export type SportGoalLanding = {
  slug: string;
  title: string;
  description: string;
  /** Sport or goal cluster label for hubs. */
  goalLabel: string;
  overview: string;
  sections: SportGoalSection[];
  productLinks: SportGoalProductLink[];
  faqs: SportGoalFaq[];
  uniqueValueKey: string;
  primaryCta: { href: string; label: string };
};
