import { getMethodBySlug, getPublishedMethods } from "@/domain/methods/catalog";
import { FIT_RULES } from "@/domain/fit/rules";
import { buildSharePath } from "@/domain/fit/parse";
import {
  FIT_DISCLAIMERS,
  type FitInputs,
} from "@/domain/fit/types";

export type FitMatchedRule = {
  id: string;
  label: string;
  description: string;
};

export type FitApproachCard = {
  rank: "primary" | "alternative";
  slug: string;
  name: string;
  summary: string;
  score: number;
  whyItFits: string[];
  tradeoffs: string[];
  exampleStructure: string;
  methodPath: string;
};

export type FitRecommendationResult = {
  inputs: FitInputs;
  primary: FitApproachCard | null;
  alternative: FitApproachCard | null;
  matchedRules: FitMatchedRule[];
  sharePath: string;
  disclaimers: readonly string[];
  emptyReason?: string;
};

type ScoreBucket = {
  slug: string;
  score: number;
  why: string[];
};

function uniqueReasons(reasons: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const reason of reasons) {
    const key = reason.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(reason);
  }
  return out;
}

function buildCard(
  rank: "primary" | "alternative",
  slug: string,
  score: number,
  why: string[],
): FitApproachCard | null {
  const method = getMethodBySlug(slug);
  if (!method || !method.isPublished) return null;

  const tradeoffs = uniqueReasons([
    ...method.limitations.slice(0, 3),
    method.fatigueNotes,
  ]).slice(0, 4);

  return {
    rank,
    slug: method.slug,
    name: method.name,
    summary: method.summary,
    score,
    whyItFits: uniqueReasons(why).slice(0, 5),
    tradeoffs,
    exampleStructure: method.programmingExample,
    methodPath: `/methods/${method.slug}`,
  };
}

/**
 * Deterministic fit engine — transparent rules only, no invented “perfect method.”
 */
export function recommendApproach(
  inputs: FitInputs,
): FitRecommendationResult {
  const published = getPublishedMethods();
  const scores = new Map<string, ScoreBucket>();
  for (const method of published) {
    scores.set(method.slug, { slug: method.slug, score: 0, why: [] });
  }

  const matchedRules: FitMatchedRule[] = [];

  for (const rule of FIT_RULES) {
    if (!rule.when(inputs)) continue;
    matchedRules.push({
      id: rule.id,
      label: rule.label,
      description: rule.description,
    });
    for (const effect of rule.effects) {
      const bucket = scores.get(effect.slug);
      if (!bucket) continue;
      bucket.score += effect.weight;
      if (effect.weight > 0) {
        bucket.why.push(effect.reason);
      }
    }
  }

  const ranked = [...scores.values()]
    .filter((b) => b.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.slug.localeCompare(b.slug);
    });

  if (ranked.length === 0) {
    return {
      inputs,
      primary: null,
      alternative: null,
      matchedRules,
      sharePath: buildSharePath(inputs),
      disclaimers: FIT_DISCLAIMERS,
      emptyReason:
        "No positive rule matches produced a recommendation. Adjust inputs or browse the methods catalog.",
    };
  }

  const primary = buildCard(
    "primary",
    ranked[0]!.slug,
    ranked[0]!.score,
    ranked[0]!.why,
  );
  const altCandidate = ranked.find((b) => b.slug !== ranked[0]!.slug);
  const alternative = altCandidate
    ? buildCard(
        "alternative",
        altCandidate.slug,
        altCandidate.score,
        altCandidate.why,
      )
    : null;

  return {
    inputs,
    primary,
    alternative,
    matchedRules,
    sharePath: buildSharePath(inputs),
    disclaimers: FIT_DISCLAIMERS,
  };
}
