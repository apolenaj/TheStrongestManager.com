/**
 * Assemble practical training preferences — no personality claims.
 */

import type { ConfidenceLevel } from "@/domain/scoring/types";
import {
  DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS,
  TRAINING_STYLE_BAND_LABELS,
  TRAINING_STYLE_DIMENSION_LABELS,
  TRAINING_STYLE_ENGINE_VERSION,
  TRAINING_STYLE_HONESTY,
  type FrequencyBand,
  type IntensityBand,
  type VolumeToleranceBand,
} from "@/domain/training-style/constants";
import type {
  TrainingStyleDimension,
  TrainingStyleProfilePayload,
  TrainingStyleSignals,
} from "@/domain/training-style/types";

function conf(
  n: number,
  thresholds: [number, number, number] = [2, 5, 10],
): ConfidenceLevel {
  if (n >= thresholds[2]) return "high";
  if (n >= thresholds[1]) return "medium";
  if (n >= thresholds[0]) return "low";
  return "none";
}

function statedFrequencyBand(
  daysPerWeek: number | null,
): FrequencyBand | null {
  if (daysPerWeek == null || daysPerWeek <= 0) return null;
  if (daysPerWeek <= 2) return "low";
  if (daysPerWeek <= 4) return "moderate";
  return "high";
}

function observedFrequencyBand(
  trainingDays: number,
  lookbackDays: number,
): FrequencyBand | null {
  if (trainingDays <= 0) return null;
  const weeks = Math.max(1, lookbackDays / 7);
  const perWeek = trainingDays / weeks;
  if (perWeek < 2.5) return "low";
  if (perWeek < 4.5) return "moderate";
  return "high";
}

function intensityFromRpe(meanRpe: number | null): IntensityBand | null {
  if (meanRpe == null) return null;
  if (meanRpe < 6.5) return "prefer_lower";
  if (meanRpe < 8) return "balanced";
  return "prefer_higher";
}

function volumeToleranceFromSignals(
  s: TrainingStyleSignals,
): VolumeToleranceBand | null {
  const reduceSignal =
    s.acceptedReduceVolume + s.declinedIncreaseLoad;
  const increaseSignal =
    s.acceptedIncreaseVolume + s.acceptedIncreaseLoad;

  if (reduceSignal + increaseSignal === 0 && s.meanSetsPerSession == null) {
    return null;
  }

  // Feedback: accepting volume cuts / declining load jumps → lower volume tolerance
  if (reduceSignal >= 2 && reduceSignal > increaseSignal) return "low";
  if (increaseSignal >= 2 && increaseSignal > reduceSignal) return "high";

  if (s.meanSetsPerSession != null) {
    if (s.meanSetsPerSession < 10) return "low";
    if (s.meanSetsPerSession < 18) return "moderate";
    return "high";
  }

  if (reduceSignal > 0 && reduceSignal >= increaseSignal) return "low";
  if (increaseSignal > 0) return "moderate";
  return "moderate";
}

function frequencyBandLabel(band: FrequencyBand): string {
  if (band === "low") return "Low frequency";
  if (band === "high") return "High frequency";
  return "Moderate frequency";
}

function volumeBandLabel(band: VolumeToleranceBand): string {
  if (band === "low") return "Low tolerance for high-volume sessions";
  if (band === "high") return "Higher volume tolerance";
  return "Moderate volume tolerance";
}

export function assembleTrainingStyleProfile(
  signals: TrainingStyleSignals,
): TrainingStyleProfilePayload {
  const lookbackDays =
    signals.lookbackDays > 0
      ? signals.lookbackDays
      : DEFAULT_TRAINING_STYLE_LOOKBACK_DAYS;

  const dimensions: TrainingStyleDimension[] = [];

  // Intensity
  {
    const band = intensityFromRpe(signals.meanRpe);
    const loadLean =
      signals.acceptedIncreaseLoad > signals.acceptedReduceLoad
        ? "prefer_higher"
        : signals.acceptedReduceLoad > signals.acceptedIncreaseLoad
          ? "prefer_lower"
          : null;
    const resolved =
      band ??
      (loadLean as IntensityBand | null) ??
      null;
    const evidence: string[] = [];
    if (signals.meanRpe != null && signals.rpeSampleCount > 0) {
      evidence.push(
        `Mean RPE ≈ ${signals.meanRpe.toFixed(1)} from ${signals.rpeSampleCount} logged effort sample(s)`,
      );
    }
    if (signals.acceptedIncreaseLoad > 0) {
      evidence.push(
        `Accepted ${signals.acceptedIncreaseLoad} load-increase adaptation(s)`,
      );
    }
    if (signals.acceptedReduceLoad > 0) {
      evidence.push(
        `Accepted ${signals.acceptedReduceLoad} load-reduce adaptation(s)`,
      );
    }
    if (signals.declinedIncreaseLoad > 0) {
      evidence.push(
        `Declined ${signals.declinedIncreaseLoad} load-increase suggestion(s)`,
      );
    }

    dimensions.push({
      id: "intensity_preference",
      label: TRAINING_STYLE_DIMENSION_LABELS.intensity_preference,
      bandLabel: resolved
        ? TRAINING_STYLE_BAND_LABELS[resolved]
        : "Insufficient data",
      band: resolved,
      confidence:
        signals.rpeSampleCount > 0
          ? conf(signals.rpeSampleCount, [3, 8, 20])
          : conf(
              signals.acceptedIncreaseLoad +
                signals.acceptedReduceLoad +
                signals.declinedIncreaseLoad,
              [1, 3, 6],
            ),
      source:
        signals.rpeSampleCount > 0 &&
        signals.acceptedIncreaseLoad + signals.acceptedReduceLoad > 0
          ? "mixed"
          : signals.rpeSampleCount > 0
            ? "observed"
            : signals.acceptedIncreaseLoad + signals.acceptedReduceLoad > 0
              ? "observed"
              : "insufficient",
      evidence,
      missingNote:
        resolved == null
          ? "Missing: RPE / perceived effort logs or load adaptation decisions."
          : null,
    });
  }

  // Frequency
  {
    const stated = statedFrequencyBand(signals.stated.daysPerWeek);
    const observed = observedFrequencyBand(
      signals.trainingDays,
      lookbackDays,
    );
    const resolved = observed ?? stated;
    const evidence: string[] = [];
    if (signals.stated.daysPerWeek != null) {
      evidence.push(
        `Stated preference: ${signals.stated.daysPerWeek} day(s)/week`,
      );
    }
    if (signals.completedSessions > 0) {
      evidence.push(
        `${signals.completedSessions} completed session(s) · ${signals.trainingDays} training day(s) in last ${lookbackDays} days`,
      );
    }
    if (signals.skippedSessions > 0) {
      evidence.push(`${signals.skippedSessions} skipped session(s) in window`);
    }

    let source: TrainingStyleDimension["source"] = "insufficient";
    if (stated && observed) source = "mixed";
    else if (observed) source = "observed";
    else if (stated) source = "stated";

    dimensions.push({
      id: "frequency_preference",
      label: TRAINING_STYLE_DIMENSION_LABELS.frequency_preference,
      bandLabel: resolved ? frequencyBandLabel(resolved) : "Insufficient data",
      band: resolved,
      confidence:
        observed != null
          ? conf(signals.completedSessions, [2, 6, 12])
          : stated != null
            ? "low"
            : "none",
      source,
      evidence,
      missingNote:
        resolved == null
          ? "Missing: days/week preference and completed sessions in the lookback window."
          : stated && observed && stated !== observed
            ? `Stated (${frequencyBandLabel(stated)}) differs from recent training (${frequencyBandLabel(observed)}) — showing observed when available.`
            : null,
    });
  }

  // Volume tolerance
  {
    const band = volumeToleranceFromSignals(signals);
    const evidence: string[] = [];
    if (signals.meanSetsPerSession != null) {
      evidence.push(
        `≈ ${signals.meanSetsPerSession.toFixed(1)} sets per completed session (session size proxy)`,
      );
    }
    if (signals.acceptedReduceVolume > 0) {
      evidence.push(
        `Accepted ${signals.acceptedReduceVolume} volume-reduce adaptation(s)`,
      );
    }
    if (signals.acceptedIncreaseVolume > 0) {
      evidence.push(
        `Accepted ${signals.acceptedIncreaseVolume} volume-increase adaptation(s)`,
      );
    }
    if (signals.feedbackNotHelpful > 0) {
      evidence.push(
        `${signals.feedbackNotHelpful} not-helpful rating(s) on adaptations`,
      );
    }

    dimensions.push({
      id: "volume_tolerance",
      label: TRAINING_STYLE_DIMENSION_LABELS.volume_tolerance,
      bandLabel: band ? volumeBandLabel(band) : "Insufficient data",
      band,
      confidence: conf(
        signals.acceptedReduceVolume +
          signals.acceptedIncreaseVolume +
          (signals.meanSetsPerSession != null ? 3 : 0),
        [1, 3, 6],
      ),
      source:
        band == null
          ? "insufficient"
          : signals.acceptedReduceVolume + signals.acceptedIncreaseVolume > 0
            ? "mixed"
            : "observed",
      evidence,
      missingNote:
        band == null
          ? "Missing: session set counts and volume-related adaptation feedback."
          : null,
    });
  }

  const parts = dimensions
    .filter((d) => d.band != null)
    .map((d) => d.bandLabel);
  const summaryLine = parts.length > 0 ? parts.join(". ") + "." : null;

  return {
    engineVersion: TRAINING_STYLE_ENGINE_VERSION,
    lookbackDays,
    generatedAtIso: signals.now.toISOString(),
    summaryLine,
    dimensions,
    statedChoices: { ...signals.stated },
    honesty: TRAINING_STYLE_HONESTY,
  };
}

/** Flatten all text for forbidden-claim tests. */
export function trainingStyleProfileText(
  profile: TrainingStyleProfilePayload,
): string {
  return [
    profile.summaryLine ?? "",
    ...profile.honesty,
    ...profile.dimensions.flatMap((d) => [
      d.label,
      d.bandLabel,
      d.missingNote ?? "",
      ...d.evidence,
    ]),
  ]
    .join("\n")
    .toLowerCase();
}
