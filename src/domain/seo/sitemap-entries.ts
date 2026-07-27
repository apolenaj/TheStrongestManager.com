import type { MetadataRoute } from "next";
import { allCourseSlugs } from "@/domain/academy";
import {
  allArchiveProfileSlugs,
  allHistoryEraSlugs,
} from "@/domain/history";
import { allMethodSlugs } from "@/domain/methods";
import { allMythVsRealitySlugs } from "@/domain/myth-vs-reality";
import { allDecisionTreeSlugs } from "@/domain/decision-trees";
import { allSeoClusterSlugs } from "@/domain/seo/catalog";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import { absoluteUrl } from "@/config/site";
import { featureFlags } from "@/config/feature-flags";
import { listIndexableProgrammaticSeoPaths } from "@/domain/programmatic-seo-safety";
import { allExerciseComparisonSeoSlugs } from "@/domain/exercise-comparison";
import { listIndexableSportGoalPaths } from "@/domain/sport-goal-landings";
import { listIndexableCalculatorPaths } from "@/domain/calculator-suite";
import { evaluateTechniqueCheckQuality } from "@/domain/technique-check";
import { evaluateProgramAuditQuality } from "@/domain/program-audit";
import { evaluateAthleteAssessmentQuality } from "@/domain/athlete-assessment";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function entry(
  path: string,
  opts?: { changeFrequency?: ChangeFreq; priority?: number },
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.6,
  };
}

/**
 * Static + curated catalog URLs for the public sitemap.
 * Excludes thin/unpublished content and authenticated /app routes.
 */
export function buildPublicSitemapEntries(): MetadataRoute.Sitemap {
  const staticPaths: Array<{ path: string; priority: number; freq: ChangeFreq }> =
    [
      { path: "/", priority: 1, freq: "weekly" },
      { path: "/features", priority: 0.8, freq: "monthly" },
      { path: "/exercises", priority: 0.9, freq: "weekly" },
      { path: "/methods", priority: 0.9, freq: "weekly" },
      { path: "/history", priority: 0.8, freq: "monthly" },
      { path: "/history/archive", priority: 0.8, freq: "monthly" },
      { path: "/evidence", priority: 0.75, freq: "monthly" },
      { path: "/research", priority: 0.75, freq: "monthly" },
      { path: "/myths", priority: 0.75, freq: "monthly" },
      { path: "/decision-trees", priority: 0.75, freq: "monthly" },
      { path: "/academy", priority: 0.8, freq: "weekly" },
      { path: "/learn", priority: 0.9, freq: "weekly" },
      { path: "/about", priority: 0.85, freq: "monthly" },
      { path: "/program-audit", priority: 0.9, freq: "weekly" },
      { path: "/tools", priority: 0.8, freq: "monthly" },
      { path: "/fit", priority: 0.7, freq: "monthly" },
      { path: "/compare", priority: 0.7, freq: "monthly" },
      { path: "/guides", priority: 0.75, freq: "monthly" },
      { path: "/coaching", priority: 0.85, freq: "weekly" },
      { path: "/coaching/apply", priority: 0.7, freq: "monthly" },
      { path: "/pricing", priority: 0.7, freq: "monthly" },
    ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) =>
    entry(p.path, { priority: p.priority, changeFrequency: p.freq }),
  );

  for (const slug of allSeoClusterSlugs()) {
    entries.push(
      entry(`/learn/${slug}`, { priority: 0.85, changeFrequency: "monthly" }),
    );
  }
  for (const slug of allMethodSlugs()) {
    entries.push(
      entry(`/methods/${slug}`, { priority: 0.8, changeFrequency: "monthly" }),
    );
  }
  for (const slug of allHistoryEraSlugs()) {
    entries.push(
      entry(`/history/${slug}`, { priority: 0.7, changeFrequency: "yearly" }),
    );
  }
  if (featureFlags.historicalTrainingArchive) {
    for (const slug of allArchiveProfileSlugs()) {
      entries.push(
        entry(`/history/archive/${slug}`, {
          priority: 0.75,
          changeFrequency: "yearly",
        }),
      );
    }
  }
  if (featureFlags.mythVsRealityEngine) {
    for (const slug of allMythVsRealitySlugs()) {
      entries.push(
        entry(`/myths/${slug}`, {
          priority: 0.75,
          changeFrequency: "monthly",
        }),
      );
    }
  }
  if (featureFlags.decisionTreeCoaching) {
    for (const slug of allDecisionTreeSlugs()) {
      entries.push(
        entry(`/decision-trees/${slug}`, {
          priority: 0.75,
          changeFrequency: "monthly",
        }),
      );
    }
  }
  for (const slug of allCourseSlugs()) {
    entries.push(
      entry(`/academy/${slug}`, { priority: 0.75, changeFrequency: "monthly" }),
    );
  }
  for (const exercise of PRIORITY_EXERCISES) {
    entries.push(
      entry(`/exercises/${exercise.slug}`, {
        priority: 0.8,
        changeFrequency: "monthly",
      }),
    );
  }

  if (featureFlags.programmaticSeoSafety) {
    for (const path of listIndexableProgrammaticSeoPaths()) {
      entries.push(
        entry(path, { priority: 0.75, changeFrequency: "monthly" }),
      );
    }
  }

  if (featureFlags.exerciseComparison) {
    entries.push(
      entry("/compare/exercises", {
        priority: 0.75,
        changeFrequency: "monthly",
      }),
    );
    for (const slug of allExerciseComparisonSeoSlugs()) {
      entries.push(
        entry(`/compare/exercises/${slug}`, {
          priority: 0.8,
          changeFrequency: "monthly",
        }),
      );
    }
  }

  if (featureFlags.sportGoalLandings) {
    entries.push(
      entry("/goals", { priority: 0.75, changeFrequency: "monthly" }),
    );
    for (const path of listIndexableSportGoalPaths()) {
      entries.push(
        entry(path, { priority: 0.8, changeFrequency: "monthly" }),
      );
    }
  }

  if (featureFlags.calculatorSuite) {
    entries.push(
      entry("/tools", { priority: 0.75, changeFrequency: "monthly" }),
    );
    for (const path of listIndexableCalculatorPaths()) {
      entries.push(
        entry(path, { priority: 0.8, changeFrequency: "monthly" }),
      );
    }
  }

  if (
    featureFlags.techniqueCheck &&
    evaluateTechniqueCheckQuality().passed
  ) {
    entries.push(
      entry("/technique-check", {
        priority: 0.8,
        changeFrequency: "monthly",
      }),
    );
  }

  if (
    featureFlags.programAudit &&
    evaluateProgramAuditQuality().passed
  ) {
    entries.push(
      entry("/program-audit", {
        priority: 0.8,
        changeFrequency: "monthly",
      }),
    );
  }

  if (
    featureFlags.athleteAssessment &&
    evaluateAthleteAssessmentQuality().passed
  ) {
    entries.push(
      entry("/athlete-assessment", {
        priority: 0.8,
        changeFrequency: "monthly",
      }),
    );
  }

  return entries;
}
