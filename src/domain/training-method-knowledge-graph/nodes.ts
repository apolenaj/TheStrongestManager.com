/**
 * Curated nodes for the Training Method Knowledge Graph.
 * Educational only — summaries mirror catalog / documented coaching history.
 */

import type { MethodGraphNode } from "@/domain/training-method-knowledge-graph/types";
import { TRAINING_METHODS } from "@/domain/methods/catalog";
import { METHOD_CATEGORY_LABELS } from "@/domain/methods/types";
import { FIT_GOAL_LABELS } from "@/domain/fit/types";

/** Non-method nodes (coaches, strategies, sports, goals, recovery). */
export const METHOD_GRAPH_EXTRA_NODES: MethodGraphNode[] = [
  // Historical coaches / practice hubs
  {
    kind: "coach",
    id: "westside-barbell",
    label: "Westside Barbell",
    summary:
      "U.S. powerlifting gym culture associated with Louie Simmons’ conjugate template (ME/DE/repetition, special exercises, accommodating resistance). Distinct from broader Soviet concurrent concepts.",
    href: "/history/archive/westside-conjugate-system",
  },
  {
    kind: "coach",
    id: "louie-simmons",
    label: "Louie Simmons",
    summary:
      "Coach closely associated with popularizing Westside’s conjugate presentation for powerlifters. Practice-based high-performance culture — not a controlled trial package.",
    href: "/history/archive/louie-simmons",
  },
  {
    kind: "coach",
    id: "matveyev",
    label: "L.P. Matveyev",
    summary:
      "Often cited in classical linear / periodization history. Historical description ≠ modern evidence claims.",
    href: "/history/archive/matveyev",
  },
  {
    kind: "coach",
    id: "issurin",
    label: "Vladimir Issurin",
    summary:
      "Associated with block periodization / concentrated loading ideas in modern coaching literature.",
    href: "/history/archive/issurin",
  },
  {
    kind: "coach",
    id: "arthur-jones",
    label: "Arthur Jones",
    summary:
      "Associated with high-intensity training (HIT) lineage in bodybuilding / machine-era strength culture.",
    href: "/history/archive/arthur-jones",
  },
  {
    kind: "coach",
    id: "mike-mentzer",
    label: "Mike Mentzer",
    summary:
      "Heavy Duty / HIT-influenced bodybuilding coaching — educational association, not medical advice.",
    href: "/history/archive/mike-mentzer",
  },

  // Intensity strategies
  {
    kind: "intensity_strategy",
    id: "max-effort",
    label: "Max effort",
    summary:
      "Work up toward a heavy 1–3 (or similar) on a variation to train maximal strength. In Westside-style conjugate, ME days rotate variations to manage skill and recovery.",
    href: "/methods/conjugate",
  },
  {
    kind: "intensity_strategy",
    id: "dynamic-effort",
    label: "Dynamic effort",
    summary:
      "Submaximal loads moved with high intent (speed-strength). Westside practice often uses accommodating resistance; bar speed and recovery still matter — DE is not automatically “light.”",
    href: "/methods/conjugate",
  },
  {
    kind: "intensity_strategy",
    id: "repetition-method",
    label: "Repetition method",
    summary:
      "Higher-rep / hypertrophy and work-capacity work supporting structure — the third concurrent pillar often listed beside ME and DE in conjugate presentations.",
    href: "/methods/conjugate",
  },
  {
    kind: "intensity_strategy",
    id: "progressive-intensity",
    label: "Progressive intensity",
    summary:
      "Intensity rises across a block while volume typically falls — classical linear-periodization character.",
    href: "/methods/linear-periodization",
  },
  {
    kind: "intensity_strategy",
    id: "hit-low-volume-intensity",
    label: "HIT low-volume intensity",
    summary:
      "Brief, hard sets near failure with long recovery between sessions — HIT / Heavy Duty family character.",
    href: "/methods/high-intensity-training",
  },

  // Volume strategies
  {
    kind: "volume_strategy",
    id: "special-exercise-volume",
    label: "Special-exercise volume",
    summary:
      "Accessory and weak-point volume alongside ME/DE — common in conjugate templates; dosing decides fatigue.",
    href: "/methods/conjugate",
  },
  {
    kind: "volume_strategy",
    id: "german-volume-10x10",
    label: "German volume (10×10)",
    summary:
      "High set counts at moderate loads for hypertrophy stimulus — educational GVT character, not a universal prescription.",
    href: "/methods/german-volume-training",
  },
  {
    kind: "volume_strategy",
    id: "undulating-weekly-volume",
    label:
      "Undulating weekly volume",
    summary:
      "Volume and intent shift across sessions in the microcycle (DUP-style distribution).",
    href: "/methods/daily-undulating-periodization",
  },
  {
    kind: "volume_strategy",
    id: "concentrated-block-volume",
    label: "Concentrated block volume",
    summary:
      "Volume (or loading) concentrated into focused blocks — block-periodization character.",
    href: "/methods/block-periodization",
  },
  {
    kind: "volume_strategy",
    id: "low-volume-sparse",
    label: "Low-volume sparse",
    summary:
      "Few hard sets per muscle/session with long recovery — HIT-family volume character.",
    href: "/methods/high-intensity-training",
  },

  // Recovery demands
  {
    kind: "recovery_demand",
    id: "recovery-high",
    label: "High recovery demand",
    summary:
      "Frequent heavy variations and stacked volume can produce high systemic/joint stress when dosing is aggressive.",
    href: null,
  },
  {
    kind: "recovery_demand",
    id: "recovery-moderate-high",
    label: "Moderate–high recovery demand",
    summary:
      "Multiple quality days or concentrated loading often need honest autoregulation and sleep/stress management.",
    href: null,
  },
  {
    kind: "recovery_demand",
    id: "recovery-moderate",
    label: "Moderate recovery demand",
    summary:
      "Typical recovery needs when volume and intensity are balanced — still dose-dependent.",
    href: null,
  },
  {
    kind: "recovery_demand",
    id: "recovery-variable",
    label: "Variable recovery demand",
    summary:
      "Fatigue depends heavily on dosing, frequency, and individual recovery capacity.",
    href: null,
  },

  // Sports (from method categories)
  ...Object.entries(METHOD_CATEGORY_LABELS).map(([id, label]) => ({
    kind: "sport" as const,
    id,
    label,
    summary: `Sport / training context tag used across the methods catalog (${label}).`,
    href: `/methods?category=${id}`,
  })),

  // Goals (from Fit questionnaire — educational alignment)
  ...Object.entries(FIT_GOAL_LABELS).map(([id, label]) => ({
    kind: "goal" as const,
    id,
    label,
    summary: `Athlete goal option from Fit (“${label}”) — used for educational method alignment, not a guarantee.`,
    href: "/fit",
  })),
];

export function buildMethodGraphNodes(): MethodGraphNode[] {
  const methodNodes: MethodGraphNode[] = TRAINING_METHODS.filter(
    (m) => m.isPublished,
  ).map((m) => ({
    kind: "method" as const,
    id: m.slug,
    label: m.name,
    summary: m.summary,
    href: `/methods/${m.slug}`,
  }));

  return [...methodNodes, ...METHOD_GRAPH_EXTRA_NODES];
}
