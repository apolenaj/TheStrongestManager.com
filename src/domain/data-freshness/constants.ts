/**
 * Data Freshness System (Prompt 143).
 * Show when pillar data becomes outdated — Technique, Recovery, Strength.
 * AI recommendations must account for stale / missing signals.
 */

import type { ConfidenceLevel } from "@/domain/scoring/types";
import { minConfidence } from "@/domain/scoring/confidence";

export const DATA_FRESHNESS_ENGINE_VERSION = "data_freshness.v1" as const;

export const DATA_FRESHNESS_HONESTY = [
  "Freshness is computed from real signal timestamps — never invented ages.",
  "Technique, Recovery, and Strength each show relative age (e.g. “42 days old”, “No data this week”, “Updated yesterday”).",
  "AI recommendations must account for stale data — confidence is capped and stale pillars appear in supporting / missing information.",
  "Missing stays missing — we do not fill gaps with default “fresh” labels.",
] as const;

export const FRESHNESS_BANDS = [
  "fresh",
  "aging",
  "stale",
  "missing",
] as const;

export type FreshnessBand = (typeof FRESHNESS_BANDS)[number];

export const FRESHNESS_DOMAINS = [
  "technique",
  "recovery",
  "strength",
  "training",
  "overall",
] as const;

export type FreshnessDomainId = (typeof FRESHNESS_DOMAINS)[number];

export const FRESHNESS_DOMAIN_LABELS: Record<FreshnessDomainId, string> = {
  technique: "Technique data",
  recovery: "Recovery",
  strength: "Strength estimate",
  training: "Training",
  overall: "Data freshness",
};

/**
 * Overall / aggregate thresholds (aligned with Performance Intelligence).
 * Fresh ≤ 48h · Stale ≥ 14 days.
 */
export const OVERALL_FRESH_HOURS = 48;
export const OVERALL_STALE_HOURS = 14 * 24;

/**
 * Per-domain thresholds (hours).
 * Recovery uses a 7-day “this week” window for stale/missing copy.
 */
export const DOMAIN_FRESHNESS_THRESHOLDS: Record<
  FreshnessDomainId,
  { freshHours: number; staleHours: number }
> = {
  overall: { freshHours: OVERALL_FRESH_HOURS, staleHours: OVERALL_STALE_HOURS },
  training: { freshHours: OVERALL_FRESH_HOURS, staleHours: OVERALL_STALE_HOURS },
  /** Technique: aging after 2 weeks; stale at 42 days (Prompt example). */
  technique: { freshHours: 14 * 24, staleHours: 42 * 24 },
  /** Recovery: fresh within ~2 days; stale after a week. */
  recovery: { freshHours: 2 * 24, staleHours: 7 * 24 },
  /** Strength: fresh within a day; stale outside 28-day trend window. */
  strength: { freshHours: 24, staleHours: 28 * 24 },
};

/** Map PI / service signal kinds → freshness domains. */
export const SIGNAL_KIND_TO_DOMAIN: Record<string, FreshnessDomainId> = {
  technique_analysis: "technique",
  recovery_checkin: "recovery",
  lift_log: "strength",
  training_session: "training",
  bodyweight: "overall",
};

export type FreshnessSignal = {
  kind: string;
  at: Date;
};

export type DomainFreshnessAssessment = {
  domain: FreshnessDomainId;
  domainLabel: string;
  band: FreshnessBand;
  lastAt: Date | null;
  ageHours: number | null;
  ageDays: number | null;
  /** Relative age only — e.g. "42 days old." */
  relativeLabel: string;
  /** Full line — e.g. "Technique data: 42 days old." */
  displayLine: string;
};

export type FreshnessSnapshot = {
  engineVersion: string;
  assessedAt: Date;
  overall: DomainFreshnessAssessment;
  pillars: {
    technique: DomainFreshnessAssessment;
    recovery: DomainFreshnessAssessment;
    strength: DomainFreshnessAssessment;
  };
  /** Flattened athlete-facing lines for UI / AI. */
  displayLines: string[];
};

export const FRESHNESS_BAND_LABELS: Record<FreshnessBand, string> = {
  fresh: "Fresh",
  aging: "Aging",
  stale: "Stale",
  missing: "Missing",
};

export type FreshnessBadgeVariant =
  | "accent"
  | "info"
  | "warning"
  | "neutral";

export const FRESHNESS_BADGE_VARIANT: Record<
  FreshnessBand,
  FreshnessBadgeVariant
> = {
  fresh: "accent",
  aging: "info",
  stale: "warning",
  missing: "neutral",
};

export function freshnessBadgeVariant(band: FreshnessBand): FreshnessBadgeVariant {
  return FRESHNESS_BADGE_VARIANT[band];
}

function ageHoursBetween(at: Date, now: Date): number {
  return (now.getTime() - at.getTime()) / (1000 * 60 * 60);
}

export function classifyFreshnessBand(
  ageHours: number | null,
  domain: FreshnessDomainId,
): FreshnessBand {
  if (ageHours == null || !Number.isFinite(ageHours) || ageHours < 0) {
    return "missing";
  }
  const { freshHours, staleHours } = DOMAIN_FRESHNESS_THRESHOLDS[domain];
  if (ageHours <= freshHours) return "fresh";
  if (ageHours >= staleHours) return "stale";
  return "aging";
}

/**
 * Athlete-facing relative copy (Prompt 143 examples).
 */
export function formatRelativeFreshness(
  lastAt: Date | null,
  now: Date,
  domain: FreshnessDomainId,
): string {
  if (!lastAt) {
    if (domain === "recovery") return "No data this week.";
    if (domain === "technique") return "No technique analyses yet.";
    if (domain === "strength") return "No lift logs for estimate.";
    if (domain === "training") return "No sessions logged yet.";
    return "No data yet.";
  }

  const hours = ageHoursBetween(lastAt, now);
  const days = Math.floor(hours / 24);

  if (domain === "recovery" && days >= 7) {
    return "No data this week.";
  }

  if (hours < 24) return "Updated today.";
  if (hours < 48) return "Updated yesterday.";
  if (days === 1) return "Updated yesterday.";
  return `${days} days old.`;
}

export function newestSignalAt(
  signals: readonly FreshnessSignal[],
  domain?: FreshnessDomainId,
): Date | null {
  const filtered = domain
    ? signals.filter((s) => {
        const mapped = SIGNAL_KIND_TO_DOMAIN[s.kind];
        if (domain === "overall") return true;
        return mapped === domain;
      })
    : [...signals];

  if (filtered.length === 0) return null;
  return filtered.reduce(
    (newest, s) => (s.at.getTime() > newest.getTime() ? s.at : newest),
    filtered[0]!.at,
  );
}

export function assessDomainFreshness(
  domain: FreshnessDomainId,
  lastAt: Date | null,
  now: Date,
): DomainFreshnessAssessment {
  const ageHours =
    lastAt != null ? Math.round(ageHoursBetween(lastAt, now) * 10) / 10 : null;
  const ageDays = ageHours != null ? Math.floor(ageHours / 24) : null;
  const band = classifyFreshnessBand(ageHours, domain);
  const relativeLabel = formatRelativeFreshness(lastAt, now, domain);
  const domainLabel = FRESHNESS_DOMAIN_LABELS[domain];
  return {
    domain,
    domainLabel,
    band,
    lastAt,
    ageHours,
    ageDays,
    relativeLabel,
    displayLine: `${domainLabel}: ${relativeLabel}`,
  };
}

export function buildFreshnessSnapshot(
  signals: readonly FreshnessSignal[],
  now: Date = new Date(),
): FreshnessSnapshot {
  const technique = assessDomainFreshness(
    "technique",
    newestSignalAt(signals, "technique"),
    now,
  );
  const recovery = assessDomainFreshness(
    "recovery",
    newestSignalAt(signals, "recovery"),
    now,
  );
  const strength = assessDomainFreshness(
    "strength",
    newestSignalAt(signals, "strength"),
    now,
  );
  const overall = assessDomainFreshness(
    "overall",
    newestSignalAt(signals, "overall"),
    now,
  );

  return {
    engineVersion: DATA_FRESHNESS_ENGINE_VERSION,
    assessedAt: now,
    overall,
    pillars: { technique, recovery, strength },
    displayLines: [
      technique.displayLine,
      recovery.displayLine,
      strength.displayLine,
    ],
  };
}

/** Cap for AI confidence given a freshness band. */
export function freshnessConfidenceCap(band: FreshnessBand): ConfidenceLevel {
  switch (band) {
    case "fresh":
      return "high";
    case "aging":
      return "medium";
    case "stale":
      return "low";
    case "missing":
      return "none";
  }
}

export function applyFreshnessConfidenceCap(
  confidence: ConfidenceLevel,
  band: FreshnessBand,
): ConfidenceLevel {
  return minConfidence([confidence, freshnessConfidenceCap(band)]);
}

/**
 * Cap confidence by the worst relevant pillar for an AI category.
 */
export function applyPillarFreshnessToConfidence(
  confidence: ConfidenceLevel,
  snapshot: FreshnessSnapshot,
  category:
    | "training"
    | "technique"
    | "recovery"
    | "nutrition"
    | "assessment"
    | "programming",
): ConfidenceLevel {
  const relevant: DomainFreshnessAssessment[] = [snapshot.overall];
  if (category === "technique") relevant.push(snapshot.pillars.technique);
  if (category === "recovery") relevant.push(snapshot.pillars.recovery);
  if (category === "training" || category === "programming") {
    relevant.push(snapshot.pillars.strength);
  }
  if (category === "assessment") {
    relevant.push(
      snapshot.pillars.technique,
      snapshot.pillars.recovery,
      snapshot.pillars.strength,
    );
  }
  return relevant.reduce(
    (c, p) => applyFreshnessConfidenceCap(c, p.band),
    confidence,
  );
}

/** Supporting facts for Why / Coach Brain when data is aging or stale. */
export function freshnessSupportingLines(
  snapshot: FreshnessSnapshot,
): string[] {
  return snapshot.displayLines;
}

/** Missing / stale notes AI should surface instead of inventing. */
export function freshnessMissingInformation(
  snapshot: FreshnessSnapshot,
): string[] {
  const out: string[] = [];
  for (const pillar of [
    snapshot.pillars.technique,
    snapshot.pillars.recovery,
    snapshot.pillars.strength,
  ]) {
    if (pillar.band === "missing" || pillar.band === "stale") {
      out.push(pillar.displayLine);
    }
  }
  return out;
}

/** Map legacy PI label ("unknown") ↔ missing band. */
export function bandToLegacyFreshnessLabel(
  band: FreshnessBand,
): "fresh" | "aging" | "stale" | "unknown" {
  if (band === "missing") return "unknown";
  return band;
}

export function legacyFreshnessLabelToBand(
  label: "fresh" | "aging" | "stale" | "unknown",
): FreshnessBand {
  if (label === "unknown") return "missing";
  return label;
}
