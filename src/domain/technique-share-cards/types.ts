import type { ShareCardFormatId } from "@/domain/share-cards";
import type { TechniqueShareFieldId } from "@/domain/technique-share-cards/constants";

export type TechniqueComponentSnippet = {
  label: string;
  score: number;
};

export type TechniqueShareInput = {
  analysisId: string;
  exerciseLabel: string;
  overallScore: number | null;
  strongest: TechniqueComponentSnippet | null;
  improve: TechniqueComponentSnippet | null;
  /** Candidate insights — athlete picks at most one. */
  insightOptions: string[];
  /** Selected insight text (must be from options or null). */
  selectedInsight: string | null;
  selectedFields: TechniqueShareFieldId[];
  formatId: ShareCardFormatId;
  /** Thumbnail opted in for PNG — never a public media URL. */
  includeThumbnailInPng: boolean;
};

export type TechniqueShareCardModel = {
  formatId: ShareCardFormatId;
  eyebrow: string;
  scoreLine: string | null;
  strongestLine: string | null;
  improveLine: string | null;
  insightLine: string | null;
  cta: string;
  brand: string;
  honestyFootnote: string;
  includedFields: TechniqueShareFieldId[];
  includeThumbnailInPng: boolean;
  analysisId: string;
};

/** Frozen public payload. */
export type TechniqueSharePayload = {
  card: TechniqueShareCardModel;
  referralCode: string;
  /** Referral landing path with utm params (path-only). */
  referralPath: string;
  ctaLabel: string;
  createdFromAnalysisId: string;
};
