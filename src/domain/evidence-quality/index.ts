export {
  EVIDENCE_QUALITY_ENGINE_VERSION,
  EVIDENCE_QUALITY_LABELS,
  EVIDENCE_QUALITY_DISPLAY,
  EVIDENCE_QUALITY_FAMILIES,
  EVIDENCE_QUALITY_FAMILY_LABELS,
  EVIDENCE_QUALITY_FAMILY_BY_LABEL,
  EVIDENCE_QUALITY_DESCRIPTIONS,
  EVIDENCE_QUALITY_HONESTY,
  LEGACY_SUPPORT_LEVELS,
} from "@/domain/evidence-quality/constants";
export type {
  EvidenceQualityLabel,
  EvidenceQualityFamily,
  LegacySupportLevel,
} from "@/domain/evidence-quality/constants";

export type {
  EvidenceCitation,
  EvidenceQualityBadgeModel,
} from "@/domain/evidence-quality/normalize";

export {
  isEvidenceQualityLabel,
  fromLegacySupportLevel,
  toLegacySupportLevel,
  fromMethodContentLayer,
  buildEvidenceQualityBadge,
  evidenceQualityForClaim,
  defaultArticleEvidenceLabel,
  listEvidenceQualityCatalog,
} from "@/domain/evidence-quality/normalize";
