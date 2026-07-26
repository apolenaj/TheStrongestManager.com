/**
 * Catalog integrity helpers — avoid clickbait / invented citations.
 */

import { EVIDENCE_QUALITY_FAMILY_BY_LABEL } from "@/domain/evidence-quality";
import { MYTH_PAGE_SECTIONS } from "@/domain/myth-vs-reality/constants";
import type { MythVsRealityEntry } from "@/domain/myth-vs-reality/types";
import { mythEntryToSections } from "@/domain/myth-vs-reality/types";

const CLICKBAIT_PATTERNS = [
  /\bdebunked forever\b/i,
  /\bscience says you('?| a)re wrong\b/i,
  /\balways destroy(s|ing)?\b/i,
  /\bnever safe\b/i,
  /\bdoctors hate\b/i,
  /\bsecret they hide\b/i,
];

/**
 * Soft check for sensational phrasing in curated copy.
 * Returns matching phrases (empty = clean).
 */
export function findClickbaitPhrases(entry: MythVsRealityEntry): string[] {
  const blob = Object.values(mythEntryToSections(entry)).join("\n");
  return CLICKBAIT_PATTERNS.filter((re) => re.test(blob)).map((re) =>
    String(re),
  );
}

/** Every required section must be non-empty. */
export function entryHasRequiredSections(entry: MythVsRealityEntry): boolean {
  const sections = mythEntryToSections(entry);
  return MYTH_PAGE_SECTIONS.every((key) => sections[key].trim().length > 0);
}

/**
 * Research-family labels on myth pages must not pretend to cite a paper
 * without a real citation pipeline — we only allow labels, no invented DOIs.
 * This helper documents that myth catalog entries do not carry citation fields.
 */
export function mythEntryUsesHonestEvidenceLabel(
  entry: MythVsRealityEntry,
): boolean {
  // Any canonical label is allowed; strong_evidence is discouraged without citations.
  const family = EVIDENCE_QUALITY_FAMILY_BY_LABEL[entry.evidenceLabel];
  if (family === "research_evidence" && entry.evidenceLabel === "strong_evidence") {
    return false;
  }
  return true;
}
