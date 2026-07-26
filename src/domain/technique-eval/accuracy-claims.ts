/**
 * Accuracy claim guards — never invent public % without labeled benchmarks.
 */

import type { AccuracyClaimResult } from "@/domain/technique-eval/types";
import type { TechniqueEvalDatasetKind } from "@/domain/technique-eval/types";

export const NO_PUBLIC_ACCURACY_CLAIM =
  "No public accuracy claim — insufficient human-labeled benchmark data." as const;

/**
 * Format a claim that could appear externally.
 * Synthetic fixture rates must never become a public accuracy percentage.
 */
export function formatPublicAccuracyClaim(input: {
  rate: number | null;
  labeledSampleCount: number;
  datasetKind: TechniqueEvalDatasetKind;
  metricLabel?: string;
}): AccuracyClaimResult {
  const { rate, labeledSampleCount, datasetKind, metricLabel } = input;

  if (datasetKind !== "human_labeled") {
    return {
      claimable: false,
      text: NO_PUBLIC_ACCURACY_CLAIM,
      rate: null,
      labeledSampleCount: 0,
    };
  }

  if (labeledSampleCount < 1 || rate == null || !Number.isFinite(rate)) {
    return {
      claimable: false,
      text: NO_PUBLIC_ACCURACY_CLAIM,
      rate: null,
      labeledSampleCount,
    };
  }

  const pct = `${(Math.min(1, Math.max(0, rate)) * 100).toFixed(1)}%`;
  const label = metricLabel ? `${metricLabel}: ` : "";
  return {
    claimable: true,
    text: `${label}${pct} on ${labeledSampleCount} human-labeled cases`,
    rate,
    labeledSampleCount,
  };
}

/**
 * Internal fixture rates may be shown in admin/CI with an explicit caveat.
 */
export function formatInternalFixtureRate(input: {
  rate: number | null;
  sampleCount: number;
  metricLabel: string;
}): string {
  if (input.sampleCount < 1 || input.rate == null) {
    return `${input.metricLabel}: no internal rate (n=0)`;
  }
  const pct = `${(Math.min(1, Math.max(0, input.rate)) * 100).toFixed(1)}%`;
  return `${input.metricLabel}: ${pct} on ${input.sampleCount} synthetic fixture case(s) — not a public accuracy claim`;
}
