import type {
  EvidenceQualityFamily,
  EvidenceQualityLabel,
  LegacySupportLevel,
} from "@/domain/evidence-quality/constants";
import {
  EVIDENCE_QUALITY_DESCRIPTIONS,
  EVIDENCE_QUALITY_DISPLAY,
  EVIDENCE_QUALITY_FAMILY_BY_LABEL,
  EVIDENCE_QUALITY_FAMILY_LABELS,
  EVIDENCE_QUALITY_LABELS,
  LEGACY_SUPPORT_LEVELS,
} from "@/domain/evidence-quality/constants";

export type EvidenceCitation = {
  label: string;
  url: string | null;
};

export type EvidenceQualityBadgeModel = {
  label: EvidenceQualityLabel;
  display: string;
  family: EvidenceQualityFamily;
  familyDisplay: string;
  description: string;
  citation: EvidenceCitation | null;
};

export function isEvidenceQualityLabel(
  raw: string,
): raw is EvidenceQualityLabel {
  return (EVIDENCE_QUALITY_LABELS as readonly string[]).includes(raw);
}

/**
 * Map legacy claim supportLevel → research evidence label.
 * Unknown values fall back to limited — never invent “strong.”
 */
export function fromLegacySupportLevel(
  raw: string | null | undefined,
): EvidenceQualityLabel {
  const normalized = (raw ?? "limited").trim().toLowerCase();
  if (normalized === "strong" || normalized === "strong_evidence") {
    return "strong_evidence";
  }
  if (normalized === "moderate" || normalized === "moderate_evidence") {
    return "moderate_evidence";
  }
  if (
    normalized === "limited" ||
    normalized === "limited_evidence" ||
    (LEGACY_SUPPORT_LEVELS as readonly string[]).includes(normalized)
  ) {
    return "limited_evidence";
  }
  // Practice-ish strings that might appear in free text
  if (normalized.includes("coaching") || normalized.includes("consensus")) {
    return "coaching_consensus";
  }
  if (normalized.includes("historical") || normalized.includes("history")) {
    return "historical_method";
  }
  if (normalized.includes("heuristic")) {
    return "heuristic";
  }
  return "limited_evidence";
}

export function toLegacySupportLevel(
  label: EvidenceQualityLabel,
): LegacySupportLevel | null {
  if (label === "strong_evidence") return "strong";
  if (label === "moderate_evidence") return "moderate";
  if (label === "limited_evidence") return "limited";
  return null;
}

/** Method content layers → evidence quality (expert practice / history). */
export function fromMethodContentLayer(
  layer:
    | "historical_description"
    | "modern_interpretation"
    | "coaching_practice",
): EvidenceQualityLabel {
  if (layer === "historical_description") return "historical_method";
  if (layer === "coaching_practice") return "coaching_consensus";
  // Modern interpretation: evidence-aware coaching — not automatic strong research
  return "limited_evidence";
}

export function buildEvidenceQualityBadge(input: {
  label: EvidenceQualityLabel;
  citationLabel?: string | null;
  citationUrl?: string | null;
}): EvidenceQualityBadgeModel {
  const family = EVIDENCE_QUALITY_FAMILY_BY_LABEL[input.label];
  const citationLabel = input.citationLabel?.trim() || null;
  const citationUrl = input.citationUrl?.trim() || null;
  return {
    label: input.label,
    display: EVIDENCE_QUALITY_DISPLAY[input.label],
    family,
    familyDisplay: EVIDENCE_QUALITY_FAMILY_LABELS[family],
    description: EVIDENCE_QUALITY_DESCRIPTIONS[input.label],
    citation:
      citationLabel || citationUrl
        ? {
            label: citationLabel ?? "Source",
            // Only keep http(s) URLs — never invent links
            url:
              citationUrl && /^https?:\/\//i.test(citationUrl)
                ? citationUrl
                : null,
          }
        : null,
  };
}

export function evidenceQualityForClaim(input: {
  supportLevel: string;
  citationLabel?: string | null;
  citationUrl?: string | null;
}): EvidenceQualityBadgeModel {
  return buildEvidenceQualityBadge({
    label: fromLegacySupportLevel(input.supportLevel),
    citationLabel: input.citationLabel,
    citationUrl: input.citationUrl,
  });
}

/** Default label for unlabeled educational articles (expert practice). */
export function defaultArticleEvidenceLabel(): EvidenceQualityLabel {
  return "coaching_consensus";
}

export function listEvidenceQualityCatalog(): Array<{
  label: EvidenceQualityLabel;
  display: string;
  family: EvidenceQualityFamily;
  familyDisplay: string;
  description: string;
}> {
  return EVIDENCE_QUALITY_LABELS.map((label) => {
    const family = EVIDENCE_QUALITY_FAMILY_BY_LABEL[label];
    return {
      label,
      display: EVIDENCE_QUALITY_DISPLAY[label],
      family,
      familyDisplay: EVIDENCE_QUALITY_FAMILY_LABELS[family],
      description: EVIDENCE_QUALITY_DESCRIPTIONS[label],
    };
  });
}
