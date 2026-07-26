import { describe, expect, it } from "vitest";
import {
  EVIDENCE_QUALITY_FAMILIES,
  EVIDENCE_QUALITY_FAMILY_BY_LABEL,
  EVIDENCE_QUALITY_HONESTY,
  EVIDENCE_QUALITY_LABELS,
  buildEvidenceQualityBadge,
  defaultArticleEvidenceLabel,
  evidenceQualityForClaim,
  fromLegacySupportLevel,
  fromMethodContentLayer,
  listEvidenceQualityCatalog,
  toLegacySupportLevel,
} from "@/domain/evidence-quality";

describe("evidence-quality", () => {
  it("exposes the six required labels", () => {
    expect([...EVIDENCE_QUALITY_LABELS]).toEqual([
      "strong_evidence",
      "moderate_evidence",
      "limited_evidence",
      "coaching_consensus",
      "historical_method",
      "heuristic",
    ]);
    expect(listEvidenceQualityCatalog()).toHaveLength(6);
  });

  it("separates research evidence from expert practice", () => {
    expect(EVIDENCE_QUALITY_FAMILIES).toEqual([
      "research_evidence",
      "expert_practice",
    ]);
    expect(EVIDENCE_QUALITY_FAMILY_BY_LABEL.strong_evidence).toBe(
      "research_evidence",
    );
    expect(EVIDENCE_QUALITY_FAMILY_BY_LABEL.coaching_consensus).toBe(
      "expert_practice",
    );
    expect(EVIDENCE_QUALITY_FAMILY_BY_LABEL.historical_method).toBe(
      "expert_practice",
    );
    expect(EVIDENCE_QUALITY_FAMILY_BY_LABEL.heuristic).toBe("expert_practice");
  });

  it("maps legacy support levels without inventing strong", () => {
    expect(fromLegacySupportLevel("strong")).toBe("strong_evidence");
    expect(fromLegacySupportLevel("moderate")).toBe("moderate_evidence");
    expect(fromLegacySupportLevel("limited")).toBe("limited_evidence");
    expect(fromLegacySupportLevel("unknown-junk")).toBe("limited_evidence");
    expect(toLegacySupportLevel("coaching_consensus")).toBeNull();
  });

  it("maps method layers to practice / history / limited research awareness", () => {
    expect(fromMethodContentLayer("historical_description")).toBe(
      "historical_method",
    );
    expect(fromMethodContentLayer("coaching_practice")).toBe(
      "coaching_consensus",
    );
    expect(fromMethodContentLayer("modern_interpretation")).toBe(
      "limited_evidence",
    );
  });

  it("only keeps real http(s) citation URLs", () => {
    const withUrl = evidenceQualityForClaim({
      supportLevel: "moderate",
      citationLabel: "Example review",
      citationUrl: "https://example.org/paper",
    });
    expect(withUrl.citation?.url).toBe("https://example.org/paper");

    const fake = buildEvidenceQualityBadge({
      label: "strong_evidence",
      citationLabel: "Invented",
      citationUrl: "not-a-url",
    });
    expect(fake.citation?.url).toBeNull();
  });

  it("defaults unlabeled articles to coaching consensus (expert practice)", () => {
    expect(defaultArticleEvidenceLabel()).toBe("coaching_consensus");
    expect(
      EVIDENCE_QUALITY_FAMILY_BY_LABEL[defaultArticleEvidenceLabel()],
    ).toBe("expert_practice");
  });

  it("states honesty against fake scientific certainty", () => {
    expect(EVIDENCE_QUALITY_HONESTY.join(" ")).toMatch(/not invent/i);
    expect(EVIDENCE_QUALITY_HONESTY.join(" ")).toMatch(/Research evidence/i);
    expect(EVIDENCE_QUALITY_HONESTY.join(" ")).toMatch(/Expert practice/i);
  });
});
