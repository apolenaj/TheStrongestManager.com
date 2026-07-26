/**
 * Curated educational edges for the Training Method Knowledge Graph.
 * Do not invent coach history or arbitrary similarity.
 */

import type { MethodGraphEdge } from "@/domain/training-method-knowledge-graph/types";
import { TRAINING_METHODS } from "@/domain/methods/catalog";
import { METHOD_COMPARISON_PROFILES } from "@/domain/methods/comparison-profiles";

function edge(
  partial: MethodGraphEdge,
): MethodGraphEdge {
  return partial;
}

/**
 * Featured path edges (Prompt 110 example):
 * Conjugate → Westside → Max effort → Dynamic effort → Powerlifting
 */
const FEATURED_PATH_EDGES: MethodGraphEdge[] = [
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "popularized_by",
    toKind: "coach",
    toId: "westside-barbell",
    note: "In strength sport coaching, conjugate is often associated with Westside Barbell’s presentation for powerlifters — distinct from broader Soviet concurrent ideas.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "coach",
    fromId: "westside-barbell",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "max-effort",
    note: "Classic Westside-style templates include max-effort upper/lower days with rotating variations.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "intensity_strategy",
    fromId: "max-effort",
    relation: "paired_with",
    toKind: "intensity_strategy",
    toId: "dynamic-effort",
    note: "Max effort and dynamic effort are concurrent pillars in Westside-style conjugate — paired in the weekly structure, not sequential “phases” only.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "intensity_strategy",
    fromId: "dynamic-effort",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "powerlifting",
    note: "Dynamic-effort speed work is a hallmark of Westside-influenced powerlifting practice; intent and recovery still matter.",
    source: "curated_educational",
  }),
];

const CURATED_EDGES: MethodGraphEdge[] = [
  ...FEATURED_PATH_EDGES,

  // Conjugate cluster
  edge({
    fromKind: "coach",
    fromId: "westside-barbell",
    relation: "associated_with",
    toKind: "coach",
    toId: "louie-simmons",
    note: "Westside Barbell practice is closely associated with Louie Simmons’ coaching presentation.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "associated_with",
    toKind: "coach",
    toId: "louie-simmons",
    note: "Catalog overview associates conjugate presentations with Louie Simmons / Westside for powerlifters.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "coach",
    fromId: "westside-barbell",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "dynamic-effort",
    note: "Dynamic-effort days are part of the classic Westside weekly template alongside max effort.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "max-effort",
    note: "Conjugate presentations train maximal strength via rotating max-effort variations.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "dynamic-effort",
    note: "Speed-strength / dynamic-effort work is a core concurrent quality in conjugate templates.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "repetition-method",
    note: "Repetition / hypertrophy / GPP work supports structure and work capacity beside ME and DE.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "uses_volume",
    toKind: "volume_strategy",
    toId: "special-exercise-volume",
    note: "Special exercises address weak points rather than only competition form year-round.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-high",
    note: "Catalog fatigue profile for conjugate is high when ME variation frequency and accessories stack.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "powerlifting",
    note: "Conjugate is categorized for powerlifting (also strongman / general strength) in the methods catalog.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "strongman",
    note: "Catalog categories include strongman for varied strengths and GPP needs.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "serves_goal",
    toKind: "goal",
    toId: "powerlifting",
    note: "Best-use cases emphasize advanced powerlifters — educational fit, not a guarantee.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "conjugate",
    relation: "serves_goal",
    toKind: "goal",
    toId: "strength",
    note: "Also used by experienced general strength athletes with recovery capacity.",
    source: "curated_educational",
  }),

  // Linear / Matveyev
  edge({
    fromKind: "method",
    fromId: "linear-periodization",
    relation: "associated_with",
    toKind: "coach",
    toId: "matveyev",
    note: "Classical linear periodization history often references Matveyev-era framing.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "linear-periodization",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "progressive-intensity",
    note: "Intensity typically rises across the plan while volume character shifts.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "linear-periodization",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-moderate",
    note: "Comparison profile places fatigue in a moderate band when dosed classically.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "linear-periodization",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "general_strength",
    note: "Catalog categories emphasize general strength and athletic contexts.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "linear-periodization",
    relation: "serves_goal",
    toKind: "goal",
    toId: "strength",
    note: "Educational alignment with general strength goals.",
    source: "curated_educational",
  }),

  // Block / Issurin
  edge({
    fromKind: "method",
    fromId: "block-periodization",
    relation: "associated_with",
    toKind: "coach",
    toId: "issurin",
    note: "Block periodization is commonly associated with Issurin’s concentrated-loading presentations.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "block-periodization",
    relation: "uses_volume",
    toKind: "volume_strategy",
    toId: "concentrated-block-volume",
    note: "Focused overload windows concentrate loading by block goal.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "block-periodization",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-high",
    note: "Concentrated loading is often deliberately fatiguing.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "block-periodization",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "athletic_performance",
    note: "Catalog categories include athletic performance contexts.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "block-periodization",
    relation: "serves_goal",
    toKind: "goal",
    toId: "athletic",
    note: "Educational alignment with sport-performance preparation windows.",
    source: "curated_educational",
  }),

  // DUP
  edge({
    fromKind: "method",
    fromId: "daily-undulating-periodization",
    relation: "uses_volume",
    toKind: "volume_strategy",
    toId: "undulating-weekly-volume",
    note: "Weekly volume is distributed across sessions with different intents.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "daily-undulating-periodization",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-moderate-high",
    note: "Multiple quality days can stack if autoregulation is weak.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "daily-undulating-periodization",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "powerlifting",
    note: "Often used by intermediate powerlifters who stall on monotonous weeks.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "daily-undulating-periodization",
    relation: "serves_goal",
    toKind: "goal",
    toId: "powerlifting",
    note: "Educational fit with powerlifting SBD practice frequency.",
    source: "curated_educational",
  }),

  // HIT lineage
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "associated_with",
    toKind: "coach",
    toId: "arthur-jones",
    note: "HIT lineage is commonly associated with Arthur Jones’ machine-era presentations.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "associated_with",
    toKind: "coach",
    toId: "mike-mentzer",
    note: "Heavy Duty / Mentzer presentations sit in the broader HIT-influenced bodybuilding lineage.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "uses_intensity",
    toKind: "intensity_strategy",
    toId: "hit-low-volume-intensity",
    note: "Brief hard sets near failure with sparse weekly dose.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "uses_volume",
    toKind: "volume_strategy",
    toId: "low-volume-sparse",
    note: "Low set counts per muscle with long recovery between hard sessions.",
    source: "comparison_profiles",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "bodybuilding",
    note: "Catalog categories emphasize bodybuilding / physique contexts.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "serves_goal",
    toKind: "goal",
    toId: "hypertrophy",
    note: "Educational alignment with muscle / physique goals when recovery allows.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "high-intensity-training",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-variable",
    note: "HIT fatigue depends heavily on proximity to failure and session frequency.",
    source: "comparison_profiles",
  }),

  // GVT
  edge({
    fromKind: "method",
    fromId: "german-volume-training",
    relation: "uses_volume",
    toKind: "volume_strategy",
    toId: "german-volume-10x10",
    note: "Classic 10×10 character at moderate loads for hypertrophy stimulus.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "german-volume-training",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "bodybuilding",
    note: "Catalog categories emphasize bodybuilding contexts.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "german-volume-training",
    relation: "serves_goal",
    toKind: "goal",
    toId: "hypertrophy",
    note: "Educational alignment with hypertrophy / physique goals.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "german-volume-training",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-high",
    note: "High set counts are recovery-costly when intensity is not dialed down.",
    source: "comparison_profiles",
  }),

  // Rest-pause / myo-reps / clusters — lighter associations
  edge({
    fromKind: "method",
    fromId: "rest-pause",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "bodybuilding",
    note: "Often used as an intensification tactic in physique training.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "rest-pause",
    relation: "serves_goal",
    toKind: "goal",
    toId: "hypertrophy",
    note: "Educational alignment with hypertrophy when used as intensification.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "myo-reps",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "bodybuilding",
    note: "Myo-reps sit in modern hypertrophy intensification practice.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "myo-reps",
    relation: "serves_goal",
    toKind: "goal",
    toId: "hypertrophy",
    note: "Educational alignment with muscle / physique goals.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "cluster-sets",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "powerlifting",
    note: "Clusters often appear in strength and powerlifting accessory or main-lift practice.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "cluster-sets",
    relation: "serves_goal",
    toKind: "goal",
    toId: "strength",
    note: "Educational alignment with strength goals via intra-set recovery.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "high-frequency-training",
    relation: "common_in_sport",
    toKind: "sport",
    toId: "weightlifting",
    note: "High frequency is common in Olympic weightlifting practice cultures.",
    source: "methods_catalog",
  }),
  edge({
    fromKind: "method",
    fromId: "high-frequency-training",
    relation: "serves_goal",
    toKind: "goal",
    toId: "weightlifting",
    note: "Educational alignment with Olympic weightlifting skill exposure.",
    source: "curated_educational",
  }),
  edge({
    fromKind: "method",
    fromId: "high-frequency-training",
    relation: "recovery_profile",
    toKind: "recovery_demand",
    toId: "recovery-moderate-high",
    note: "Frequency raises recovery cost if every session is high effort.",
    source: "comparison_profiles",
  }),
];

function relatedMethodEdges(): MethodGraphEdge[] {
  const edges: MethodGraphEdge[] = [];
  for (const method of TRAINING_METHODS) {
    if (!method.isPublished) continue;
    for (const related of method.relatedMethodSlugs) {
      edges.push(
        edge({
          fromKind: "method",
          fromId: method.slug,
          relation: "related_method",
          toKind: "method",
          toId: related,
          note: "Catalog related-method link — curated, not similarity search.",
          source: "methods_catalog",
        }),
      );
    }
  }
  return edges;
}

function categorySportEdges(): MethodGraphEdge[] {
  const edges: MethodGraphEdge[] = [];
  const seen = new Set<string>();
  for (const method of TRAINING_METHODS) {
    if (!method.isPublished) continue;
    for (const category of method.categories) {
      const key = `${method.slug}->${category}`;
      if (seen.has(key)) continue;
      seen.add(key);
      // Skip if already covered by curated common_in_sport for same pair
      const already = CURATED_EDGES.some(
        (e) =>
          e.fromKind === "method" &&
          e.fromId === method.slug &&
          e.relation === "common_in_sport" &&
          e.toId === category,
      );
      if (already) continue;
      edges.push(
        edge({
          fromKind: "method",
          fromId: method.slug,
          relation: "common_in_sport",
          toKind: "sport",
          toId: category,
          note: `Methods catalog category: ${category}.`,
          source: "methods_catalog",
        }),
      );
    }
  }
  return edges;
}

function fatigueEdgesFromProfiles(): MethodGraphEdge[] {
  const map: Record<string, string> = {
    high: "recovery-high",
    moderate_high: "recovery-moderate-high",
    moderate: "recovery-moderate",
    variable: "recovery-variable",
    low: "recovery-moderate",
    low_moderate: "recovery-moderate",
  };
  const edges: MethodGraphEdge[] = [];
  for (const profile of METHOD_COMPARISON_PROFILES) {
    const recoveryId = map[profile.fatigue];
    if (!recoveryId) continue;
    const already = CURATED_EDGES.some(
      (e) =>
        e.fromKind === "method" &&
        e.fromId === profile.slug &&
        e.relation === "recovery_profile",
    );
    if (already) continue;
    edges.push(
      edge({
        fromKind: "method",
        fromId: profile.slug,
        relation: "recovery_profile",
        toKind: "recovery_demand",
        toId: recoveryId,
        note: profile.fatigueNote,
        source: "comparison_profiles",
      }),
    );
  }
  return edges;
}

export function curatedMethodGraphEdges(): MethodGraphEdge[] {
  return [
    ...CURATED_EDGES,
    ...relatedMethodEdges(),
    ...categorySportEdges(),
    ...fatigueEdgesFromProfiles(),
  ];
}
