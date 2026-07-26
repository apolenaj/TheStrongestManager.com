/**
 * Myth vs Reality Engine (Prompt 115).
 * SEO + educational pages — careful language, no clickbait misinformation.
 */

export const MYTH_VS_REALITY_ENGINE_VERSION = "myth_vs_reality.v1" as const;

/** Required page sections for every myth entry. */
export const MYTH_PAGE_SECTIONS = [
  "claim",
  "whatPeopleSay",
  "whatEvidenceSuggests",
  "practicalAnswer",
  "nuance",
] as const;

export type MythPageSection = (typeof MYTH_PAGE_SECTIONS)[number];

export const MYTH_PAGE_SECTION_LABELS: Record<MythPageSection, string> = {
  claim: "Claim",
  whatPeopleSay: "What people say",
  whatEvidenceSuggests: "What evidence suggests",
  practicalAnswer: "Practical answer",
  nuance: "Nuance",
};

export const MYTH_VS_REALITY_HONESTY = [
  "Myth vs Reality pages separate common claims from careful practical answers — they do not invent scientific certainty or study citations.",
  "We avoid clickbait “debunked forever” framing. Context, population, and technique quality usually matter more than slogans.",
  "Evidence labels follow the Evidence Quality System. Missing citations stay missing; we never invent DOIs or paper titles.",
  "Every page keeps Claim, What people say, What evidence suggests, Practical answer, and Nuance — educational content is not medical advice.",
] as const;

export const MYTH_VS_REALITY_INDEX_DESCRIPTION =
  "Common training myths answered carefully: what people say, what evidence suggests, a practical answer, and the nuance clickbait usually skips.";
