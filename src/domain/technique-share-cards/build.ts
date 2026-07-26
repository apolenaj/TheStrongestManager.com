import {
  TECHNIQUE_SHARE_BRAND,
  TECHNIQUE_SHARE_CTA,
  type TechniqueShareFieldId,
} from "@/domain/technique-share-cards/constants";
import type {
  TechniqueComponentSnippet,
  TechniqueShareCardModel,
  TechniqueShareInput,
} from "@/domain/technique-share-cards/types";

function upperExercise(label: string): string {
  return `${label.trim().toUpperCase()} TECHNIQUE`;
}

/**
 * Pick strongest / improve from observed component scores.
 */
export function pickStrongestAndImprove(
  components: Array<{ label: string; score: number | null; status: string }>,
): {
  strongest: TechniqueComponentSnippet | null;
  improve: TechniqueComponentSnippet | null;
} {
  const observed = components
    .filter((c) => c.status === "observed" && c.score != null)
    .map((c) => ({ label: c.label, score: c.score as number }));
  if (observed.length === 0) {
    return { strongest: null, improve: null };
  }
  const sorted = [...observed].sort((a, b) => b.score - a.score);
  const strongest = sorted[0]!;
  const improve = sorted[sorted.length - 1]!;
  if (strongest.label === improve.label && sorted.length === 1) {
    return { strongest, improve: null };
  }
  return { strongest, improve };
}

/**
 * Build a technique share card — only selected fields appear.
 */
export function buildTechniqueShareCard(
  input: TechniqueShareInput,
): TechniqueShareCardModel {
  const selected = new Set(input.selectedFields);
  const included: TechniqueShareFieldId[] = [];

  let scoreLine: string | null = null;
  if (selected.has("score") && input.overallScore != null) {
    scoreLine = `${Math.round(input.overallScore)}/100`;
    included.push("score");
  }

  let strongestLine: string | null = null;
  let improveLine: string | null = null;
  if (selected.has("strongest_improve")) {
    if (input.strongest) {
      strongestLine = `${input.strongest.label} ${Math.round(input.strongest.score)}`;
      included.push("strongest_improve");
    }
    if (input.improve) {
      improveLine = `${input.improve.label} ${Math.round(input.improve.score)}`;
      if (!included.includes("strongest_improve")) {
        included.push("strongest_improve");
      }
    }
  }

  let insightLine: string | null = null;
  if (selected.has("insight") && input.selectedInsight?.trim()) {
    const allowed = input.insightOptions.some(
      (o) => o.trim() === input.selectedInsight!.trim(),
    );
    if (allowed) {
      insightLine = input.selectedInsight.trim();
      included.push("insight");
    }
  }

  const includeThumbnailInPng =
    selected.has("thumbnail") && input.includeThumbnailInPng;
  if (includeThumbnailInPng) {
    included.push("thumbnail");
  }

  return {
    formatId: input.formatId,
    eyebrow: upperExercise(input.exerciseLabel),
    scoreLine,
    strongestLine,
    improveLine,
    insightLine,
    cta: TECHNIQUE_SHARE_CTA,
    brand: TECHNIQUE_SHARE_BRAND,
    honestyFootnote:
      "Technique scores are coaching signals — not medical diagnoses.",
    includedFields: included,
    includeThumbnailInPng,
    analysisId: input.analysisId,
  };
}
