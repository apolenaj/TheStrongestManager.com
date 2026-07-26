/**
 * Universal Confidence System (Prompt 142).
 * One athlete-facing scale across Technique, Strength, AI, Predictions, Recovery.
 *
 * Levels (display): High · Moderate · Low · Insufficient data
 * Storage (canonical): high | medium | low | none  (scoring ConfidenceLevel)
 *
 * Never show a precise confidence percentage unless calibrated.
 */

import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  isConfidenceDisplayable as scoringIsDisplayable,
} from "@/domain/scoring/confidence";

export const CONFIDENCE_SYSTEM_ENGINE_VERSION = "confidence_system.v1" as const;

/** Athlete-facing level ids (Moderate naming; maps to storage `medium`). */
export const UNIVERSAL_CONFIDENCE_LEVELS = [
  "high",
  "moderate",
  "low",
  "insufficient_data",
] as const;

export type UniversalConfidenceLevel =
  (typeof UNIVERSAL_CONFIDENCE_LEVELS)[number];

/** Canonical storage tokens — alias of scoring ConfidenceLevel. */
export type StoredConfidenceLevel = ConfidenceLevel;

export const CONFIDENCE_SYSTEM_HONESTY = [
  "Confidence uses four levels: High, Moderate, Low, and Insufficient data — never a fake precise percentage.",
  "Precise confidence percentages are withheld until a calibrated model exists.",
  "Technique, Strength, AI recommendations, Predictions, and Recovery share this scale.",
  "Insufficient data means we lack enough signal — we do not invent confidence.",
] as const;

/** Athlete-facing labels for stored ConfidenceLevel. */
export const CONFIDENCE_DISPLAY_LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Moderate",
  low: "Low",
  none: "Insufficient data",
};

export const UNIVERSAL_CONFIDENCE_LABELS: Record<
  UniversalConfidenceLevel,
  string
> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  insufficient_data: "Insufficient data",
};

/**
 * Product rule: uncalibrated engines must not show percent confidence in UI.
 * Flip only when a named calibrated model is approved.
 */
export const CONFIDENCE_PERCENTAGES_CALIBRATED = false;

export type ConfidenceBadgeVariant =
  | "accent"
  | "info"
  | "warning"
  | "neutral";

export const CONFIDENCE_BADGE_VARIANT: Record<
  ConfidenceLevel,
  ConfidenceBadgeVariant
> = {
  high: "accent",
  medium: "info",
  low: "warning",
  none: "neutral",
};

/** Accept common engine tokens and normalize to scoring ConfidenceLevel. */
export function normalizeConfidenceLevel(
  value: string | ConfidenceLevel | null | undefined,
): ConfidenceLevel {
  if (value == null || value === "") return "none";
  const v = String(value).trim().toLowerCase().replace(/\s+/g, "_");
  switch (v) {
    case "high":
      return "high";
    case "medium":
    case "moderate":
      return "medium";
    case "low":
      return "low";
    case "none":
    case "insufficient":
    case "insufficient_data":
    case "unknown":
      return "none";
    default:
      return "none";
  }
}

export function toUniversalConfidence(
  value: string | ConfidenceLevel | null | undefined,
): UniversalConfidenceLevel {
  const stored = normalizeConfidenceLevel(value);
  switch (stored) {
    case "high":
      return "high";
    case "medium":
      return "moderate";
    case "low":
      return "low";
    case "none":
      return "insufficient_data";
  }
}

/**
 * Athlete-facing confidence label.
 * Never invents a percentage.
 */
export function formatConfidenceLabel(
  value: string | ConfidenceLevel | null | undefined,
): string {
  return CONFIDENCE_DISPLAY_LABELS[normalizeConfidenceLevel(value)];
}

export function confidenceBadgeVariant(
  value: string | ConfidenceLevel | null | undefined,
): ConfidenceBadgeVariant {
  return CONFIDENCE_BADGE_VARIANT[normalizeConfidenceLevel(value)];
}

/** Same gate as scoring — medium/high may show numeric scores; low/none must not. */
export function isConfidenceDisplayable(
  value: string | ConfidenceLevel | null | undefined,
): boolean {
  return scoringIsDisplayable(normalizeConfidenceLevel(value));
}

/**
 * Format an internal 0–1 confidence score for UI.
 * Returns null when percentages are not calibrated (Prompt 142 rule).
 */
export function formatConfidencePercent(
  ratio: number | null | undefined,
): string | null {
  if (!CONFIDENCE_PERCENTAGES_CALIBRATED) return null;
  if (ratio == null || !Number.isFinite(ratio)) return null;
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return `${pct}%`;
}

/**
 * Prefer level label; only append % when calibrated.
 * Example uncalibrated: "Moderate"
 * Example calibrated (future): "Moderate (72%)"
 */
export function formatConfidenceWithOptionalPercent(
  level: string | ConfidenceLevel | null | undefined,
  ratio?: number | null,
): string {
  const label = formatConfidenceLabel(level);
  const pct = formatConfidencePercent(ratio ?? null);
  return pct ? `${label} (${pct})` : label;
}
