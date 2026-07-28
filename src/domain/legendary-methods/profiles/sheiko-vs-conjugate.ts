import type { SystemComparison } from "@/domain/legendary-methods/types";

/**
 * Shared Sheiko vs Conjugate comparison (Prompt 5D).
 * Original educational synthesis — not a reprint of copyrighted programme tables.
 */
const COMPARISON_SUMMARY = `Sheiko-associated Russian powerlifting systems and Louie Simmons’ conjugate synthesis answer maximal strength with different primary tools. Sheiko emphasises frequent, submaximal practice of the competition lifts and block progression toward a meet. Conjugate emphasises concurrent max-effort, dynamic-effort and repetition-effort work with rotating special exercises and accommodating resistance. Neither internet “numbered spreadsheet” nor every modern “conjugate-inspired” template is automatically the official system. Choose tools by lifter need, equipment context and recovery — not by brand loyalty.`;

const ROWS_SHEIKO_FIRST = [
  {
    dimension: "Specificity",
    thisSystem:
      "Very high to competition squat, bench and deadlift patterns across the week",
    otherSystem:
      "Mix of competition lifts and frequently rotated special exercises that transfer to the total",
  },
  {
    dimension: "Exercise variation",
    thisSystem:
      "Comparatively stable main-lift menu; variation is secondary to technical repetition",
    otherSystem:
      "High — max-effort and special-exercise rotation is a core fatigue/adaptation tool",
  },
  {
    dimension: "Frequency",
    thisSystem:
      "High competition-lift frequency (often multiple exposures per lift each week)",
    otherSystem:
      "Typically four hard lower/upper contrasts (ME/DE) plus accessories; variation replaces endless identical maxes",
  },
  {
    dimension: "Intensity",
    thisSystem:
      "Mostly submaximal quality work; average intensity often discussed near ~70% across phases in seminar accounts",
    otherSystem:
      "Weekly near-max singles on rotating lifts (ME) plus fast submaximal DE work",
  },
  {
    dimension: "Volume",
    thisSystem:
      "High cumulative tonnage via many moderate sets and multi-lift sessions",
    otherSystem:
      "Volume concentrated in special/repetition work; main ME sets are fewer but heavier",
  },
  {
    dimension: "Fatigue management",
    thisSystem:
      "Submaximal loading, wave loading across weeks/blocks, and peaking volume cuts",
    otherSystem:
      "Exercise rotation, 72-hour spacing of extreme days, and concurrent quality development",
  },
  {
    dimension: "Technical practice",
    thisSystem:
      "Enormous competition-lift practice volume at manageable loads",
    otherSystem:
      "Technique refined via special exercises and DE speed work as well as competition patterns",
  },
  {
    dimension: "Beginner suitability",
    thisSystem:
      "Principles help; full high-volume templates often too dense without coaching",
    otherSystem:
      "Full ME rotation + bands/chains usually too complex; simplified strength work first",
  },
  {
    dimension: "Advanced suitability",
    thisSystem:
      "Excellent for advanced raw lifters who recover from high technical volume",
    otherSystem:
      "Excellent for advanced lifters needing weak-point tools; historically strong in equipped contexts",
  },
  {
    dimension: "Raw vs equipped application",
    thisSystem:
      "Widely applied to raw/classic competition-lift practice and meet peaking",
    otherSystem:
      "Born and proven heavily in equipped Westside culture; raw use requires honest adaptation, not cargo-cult gear assumptions",
  },
] as const;

export function sheikoVersusConjugateComparison(): SystemComparison {
  return {
    title: "Sheiko vs Conjugate",
    counterpartSlug: "louie-simmons-conjugate-method",
    counterpartName: "Conjugate Method (Louie Simmons)",
    summary: COMPARISON_SUMMARY,
    rows: ROWS_SHEIKO_FIRST.map((row) => ({
      dimension: row.dimension,
      thisSystem: row.thisSystem,
      otherSystem: row.otherSystem,
    })),
  };
}

export function conjugateVersusSheikoComparison(): SystemComparison {
  return {
    title: "Sheiko vs Conjugate",
    counterpartSlug: "boris-sheiko-russian-powerlifting",
    counterpartName: "Russian Powerlifting Systems (Boris Sheiko)",
    summary: COMPARISON_SUMMARY,
    rows: ROWS_SHEIKO_FIRST.map((row) => ({
      dimension: row.dimension,
      thisSystem: row.otherSystem,
      otherSystem: row.thisSystem,
    })),
  };
}
