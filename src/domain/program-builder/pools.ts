/**
 * Catalog-backed exercise pools for Program Builder 2.0.
 * Only known slugs — never invent lifts or random volume.
 */

import type { FitEquipment, FitGoal } from "@/domain/fit/types";
import {
  PROGRAM_BUILDER_PRIORITY_LIFT_LABELS,
  type ProgramBuilderPriorityLift,
} from "@/domain/program-builder/constants";

export type BuilderExerciseMeta = {
  slug: string;
  name: string;
  /** Equipment gates — must match fit equipment loosely. */
  requires: "barbell" | "pullup" | "machine_or_db" | "any";
  patterns: readonly string[];
};

const ACCESSORY_POOL: readonly BuilderExerciseMeta[] = [
  {
    slug: "romanian-deadlift",
    name: "Romanian deadlift",
    requires: "barbell",
    patterns: ["hinge"],
  },
  {
    slug: "front-squat",
    name: "Front squat",
    requires: "barbell",
    patterns: ["squat"],
  },
  {
    slug: "barbell-row",
    name: "Barbell row",
    requires: "barbell",
    patterns: ["horizontal_pull"],
  },
  {
    slug: "pull-up",
    name: "Pull-up",
    requires: "pullup",
    patterns: ["vertical_pull"],
  },
  {
    slug: "leg-press",
    name: "Leg press",
    requires: "machine_or_db",
    patterns: ["squat"],
  },
  {
    slug: "hip-thrust",
    name: "Hip thrust",
    requires: "any",
    patterns: ["hinge", "glute"],
  },
  {
    slug: "overhead-press",
    name: "Overhead press",
    requires: "barbell",
    patterns: ["vertical_press"],
  },
  {
    slug: "bench-press",
    name: "Bench press",
    requires: "barbell",
    patterns: ["horizontal_press"],
  },
  {
    slug: "dumbbell-bench-press",
    name: "Dumbbell bench press",
    requires: "machine_or_db",
    patterns: ["horizontal_press"],
  },
  {
    slug: "machine-chest-press",
    name: "Machine chest press",
    requires: "machine_or_db",
    patterns: ["horizontal_press"],
  },
  {
    slug: "push-up",
    name: "Push-up",
    requires: "any",
    patterns: ["horizontal_press"],
  },
];

function equipmentAllows(
  requires: BuilderExerciseMeta["requires"],
  equipment: FitEquipment,
): boolean {
  if (requires === "any") return true;
  if (equipment === "full_gym") return true;
  if (equipment === "home_barbell") {
    return (
      requires === "barbell" ||
      requires === "pullup" ||
      requires === "machine_or_db"
    );
  }
  // minimal — dumbbell / machine substitutes only (`any` already allowed above)
  return requires === "machine_or_db";
}

export function priorityLiftName(slug: ProgramBuilderPriorityLift): string {
  return PROGRAM_BUILDER_PRIORITY_LIFT_LABELS[slug];
}

export function accessoriesForDraft(input: {
  equipment: FitEquipment;
  goal: FitGoal;
  priorityLifts: readonly string[];
  count: number;
}): BuilderExerciseMeta[] {
  const used = new Set(input.priorityLifts);
  const preferredPatterns =
    input.goal === "hypertrophy"
      ? ["horizontal_pull", "vertical_pull", "hinge", "squat", "glute"]
      : ["horizontal_pull", "hinge", "vertical_press", "squat"];

  const eligible = ACCESSORY_POOL.filter(
    (ex) => equipmentAllows(ex.requires, input.equipment) && !used.has(ex.slug),
  );

  const scored = eligible
    .map((ex) => {
      const patternHit = ex.patterns.some((p) => preferredPatterns.includes(p))
        ? 2
        : 0;
      return { ex, score: patternHit };
    })
    .sort((a, b) => b.score - a.score || a.ex.slug.localeCompare(b.ex.slug));

  return scored.slice(0, Math.max(0, input.count)).map((s) => s.ex);
}

/** Day focus labels by day count — structured, not random. */
export function dayTemplates(days: number): Array<{ name: string; focus: string }> {
  if (days <= 2) {
    return [
      { name: "Day A — Full body", focus: "full_body" },
      { name: "Day B — Full body", focus: "full_body" },
    ].slice(0, days);
  }
  if (days === 3) {
    return [
      { name: "Day 1 — Lower / hinge bias", focus: "lower" },
      { name: "Day 2 — Upper push/pull", focus: "upper" },
      { name: "Day 3 — Full body strength", focus: "full_body" },
    ];
  }
  if (days === 4) {
    return [
      { name: "Day 1 — Squat emphasis", focus: "squat" },
      { name: "Day 2 — Push emphasis", focus: "push" },
      { name: "Day 3 — Hinge emphasis", focus: "hinge" },
      { name: "Day 4 — Pull / upper volume", focus: "pull" },
    ];
  }
  // 5–6
  return [
    { name: "Day 1 — Squat", focus: "squat" },
    { name: "Day 2 — Bench / press", focus: "push" },
    { name: "Day 3 — Deadlift / hinge", focus: "hinge" },
    { name: "Day 4 — Upper pull", focus: "pull" },
    { name: "Day 5 — Secondary strength", focus: "full_body" },
    { name: "Day 6 — Accessory / weak points", focus: "accessory" },
  ].slice(0, days);
}

export function priorityFitsFocus(
  slug: string,
  focus: string,
): boolean {
  if (focus === "full_body" || focus === "accessory") return true;
  if (focus === "squat" || focus === "lower") {
    return slug.includes("squat") || slug === "leg-press";
  }
  if (focus === "hinge") {
    return slug.includes("deadlift") || slug === "hip-thrust";
  }
  if (focus === "push") {
    return slug.includes("press") || slug.includes("bench");
  }
  if (focus === "pull" || focus === "upper") {
    return (
      slug.includes("row") ||
      slug.includes("pull") ||
      slug.includes("press") ||
      slug.includes("bench")
    );
  }
  return true;
}
