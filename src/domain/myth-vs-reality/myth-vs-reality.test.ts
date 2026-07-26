import { describe, expect, it } from "vitest";
import {
  MYTH_PAGE_SECTIONS,
  MYTH_VS_REALITY_ENTRIES,
  MYTH_VS_REALITY_HONESTY,
  allMythVsRealitySlugs,
  entryHasRequiredSections,
  findClickbaitPhrases,
  getMythVsRealityEntryBySlug,
  mythEntryUsesHonestEvidenceLabel,
} from "@/domain/myth-vs-reality";

describe("myth-vs-reality", () => {
  it("defines the five required page sections", () => {
    expect([...MYTH_PAGE_SECTIONS]).toEqual([
      "claim",
      "whatPeopleSay",
      "whatEvidenceSuggests",
      "practicalAnswer",
      "nuance",
    ]);
  });

  it("ships the three example myths", () => {
    expect(allMythVsRealitySlugs()).toEqual([
      "knees-over-toes",
      "is-sumo-cheating",
      "high-rep-strength",
    ]);
  });

  it("gives every entry complete sections without clickbait patterns", () => {
    for (const entry of MYTH_VS_REALITY_ENTRIES) {
      expect(entryHasRequiredSections(entry)).toBe(true);
      expect(findClickbaitPhrases(entry)).toEqual([]);
      expect(mythEntryUsesHonestEvidenceLabel(entry)).toBe(true);
      expect(entry.claim.length).toBeGreaterThan(10);
      expect(entry.practicalAnswer.length).toBeGreaterThan(40);
      expect(entry.nuance.length).toBeGreaterThan(40);
    }
  });

  it("does not invent citation fields on catalog entries", () => {
    for (const entry of MYTH_VS_REALITY_ENTRIES) {
      expect(entry).not.toHaveProperty("citationUrl");
      expect(entry).not.toHaveProperty("doi");
    }
  });

  it("loads example claims by slug", () => {
    expect(getMythVsRealityEntryBySlug("knees-over-toes")?.claim).toMatch(
      /knees over toes/i,
    );
    expect(getMythVsRealityEntryBySlug("is-sumo-cheating")?.claim).toMatch(
      /sumo/i,
    );
    expect(getMythVsRealityEntryBySlug("high-rep-strength")?.claim).toMatch(
      /high-rep/i,
    );
  });

  it("states honesty against clickbait and invented citations", () => {
    const blob = MYTH_VS_REALITY_HONESTY.join(" ");
    expect(blob).toMatch(/clickbait/i);
    expect(blob).toMatch(/never invent/i);
    expect(blob).toMatch(/nuance/i);
  });
});
