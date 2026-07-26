/**
 * Generate Program Builder 2.0 drafts from structured tables.
 * Never invents random exercise volume.
 */

import { DEFAULT_DELOAD_LOAD_PCT, DEFAULT_VOLUME_SET_DELTA } from "@/domain/adaptive/constants";
import {
  PROGRAM_BUILDER_ENGINE_VERSION,
  PROGRAM_BUILDER_HONESTY,
} from "@/domain/program-builder/constants";
import {
  accessoriesForDraft,
  dayTemplates,
  priorityFitsFocus,
  priorityLiftName,
} from "@/domain/program-builder/pools";
import type {
  ProgramBuilderDraft,
  ProgramBuilderDraftDay,
  ProgramBuilderDraftExercise,
  ProgramBuilderInputs,
  ProgramBuilderWhyEntry,
} from "@/domain/program-builder/types";
import { validateProgramBuilderInputs } from "@/domain/program-builder/validate";
import {
  lookupVolumeTable,
  volumeTableId,
} from "@/domain/program-builder/volume-tables";
import {
  FIT_GOAL_LABELS,
  FIT_SESSION_LABELS,
} from "@/domain/fit/types";

function countHardSets(days: ProgramBuilderDraftDay[]): number {
  return days.reduce(
    (sum, day) =>
      sum + day.exercises.reduce((s, ex) => s + ex.targetSets, 0),
    0,
  );
}

function buildTrainingWeek(
  inputs: ProgramBuilderInputs,
  volume: ReturnType<typeof lookupVolumeTable>,
  isDeload: boolean,
): ProgramBuilderDraftDay[] {
  const dayCount = Number(inputs.days);
  const templates = dayTemplates(dayCount);
  const priorityQueue = [...inputs.priorityLifts];
  const accessories = accessoriesForDraft({
    equipment: inputs.equipment,
    goal: inputs.goal,
    priorityLifts: inputs.priorityLifts,
    count: Math.max(volume.accessoriesPerDay * 2, 4),
  });

  const setScale = isDeload ? Math.max(1, volume.prioritySetsPerSession - DEFAULT_VOLUME_SET_DELTA) : volume.prioritySetsPerSession;
  const accessorySets = isDeload
    ? Math.max(1, volume.accessorySets - DEFAULT_VOLUME_SET_DELTA)
    : volume.accessorySets;

  let accessoryCursor = 0;

  return templates.map((tpl, dayIndex) => {
    const exercises: ProgramBuilderDraftExercise[] = [];

    // Assign up to 2 priority lifts that fit the day focus (round-robin).
    const dayPriorities: string[] = [];
    for (let attempt = 0; attempt < priorityQueue.length && dayPriorities.length < 2; attempt++) {
      const slug = priorityQueue[(dayIndex + attempt) % priorityQueue.length]!;
      if (dayPriorities.includes(slug)) continue;
      if (!priorityFitsFocus(slug, tpl.focus) && dayPriorities.length === 0) {
        // Still allow one priority even if focus is loose, so every day trains something primary.
      } else if (!priorityFitsFocus(slug, tpl.focus) && dayPriorities.length > 0) {
        continue;
      }
      dayPriorities.push(slug);
    }
    // Ensure at least one priority on non-accessory days
    if (dayPriorities.length === 0 && priorityQueue.length > 0) {
      dayPriorities.push(priorityQueue[dayIndex % priorityQueue.length]!);
    }

    for (const slug of dayPriorities) {
      const name = priorityLiftName(slug as Parameters<typeof priorityLiftName>[0]);
      exercises.push({
        slug,
        name,
        role: "priority",
        targetSets: setScale,
        targetReps: volume.priorityReps,
        rpeTarget: isDeload ? Math.max(6, volume.priorityRpe - 1) : volume.priorityRpe,
        whyChosen: `Priority lift you selected — placed on ${tpl.name} because it matches the day focus (“${tpl.focus}”) and your ${inputs.experience} ${FIT_GOAL_LABELS[inputs.goal].toLowerCase()} goal.`,
      });
    }

    const accessorySlots = isDeload
      ? Math.max(1, volume.accessoriesPerDay - 1)
      : volume.accessoriesPerDay;
    for (let i = 0; i < accessorySlots; i++) {
      const acc = accessories[accessoryCursor % Math.max(accessories.length, 1)];
      accessoryCursor += 1;
      if (!acc) break;
      if (exercises.some((e) => e.slug === acc.slug)) continue;
      exercises.push({
        slug: acc.slug,
        name: acc.name,
        role: "accessory",
        targetSets: accessorySets,
        targetReps: volume.accessoryReps,
        rpeTarget: volume.accessoryRpe,
        whyChosen: `Catalog accessory supporting ${tpl.focus} work within ${inputs.equipment.replace(/_/g, " ")} equipment — sets/reps from volume table ${volumeTableId()}, not random AI volume.`,
      });
    }

    return {
      dayIndex,
      name: isDeload ? `${tpl.name} (deload)` : tpl.name,
      focus: tpl.focus,
      exercises,
    };
  });
}

/**
 * Build an editable program draft. Volume always comes from lookupVolumeTable.
 */
export function generateProgramBuilderDraft(
  raw: Parameters<typeof validateProgramBuilderInputs>[0],
):
  | { ok: true; draft: ProgramBuilderDraft }
  | { ok: false; error: string } {
  const validated = validateProgramBuilderInputs(raw);
  if (!validated.ok) return validated;

  const { inputs } = validated;
  const volume = lookupVolumeTable({
    goal: inputs.goal,
    experience: inputs.experience,
    session: inputs.session,
  });

  const normalWeek = buildTrainingWeek(inputs, volume, false);
  const deloadWeek = buildTrainingWeek(inputs, volume, true);
  const weeklyHardSetsPlanned = countHardSets(normalWeek);

  const whyExercises: ProgramBuilderWhyEntry[] = [];
  const seen = new Set<string>();
  for (const day of normalWeek) {
    for (const ex of day.exercises) {
      if (seen.has(ex.slug)) continue;
      seen.add(ex.slug);
      whyExercises.push({
        slug: ex.slug,
        name: ex.name,
        reason: ex.whyChosen,
        ruleIds:
          ex.role === "priority"
            ? ["builder.priority_selected", "builder.day_focus_match"]
            : ["builder.accessory_pool", "builder.volume_table"],
      });
    }
  }

  const draft: ProgramBuilderDraft = {
    engineVersion: PROGRAM_BUILDER_ENGINE_VERSION,
    status: "draft",
    autoApply: false,
    inputs,
    title: `${FIT_GOAL_LABELS[inputs.goal]} · ${inputs.days} days · ${FIT_SESSION_LABELS[inputs.session]}`,
    weeks: [
      { weekNumber: 1, isDeload: false, days: normalWeek },
      {
        weekNumber: volume.deloadEveryWeeks,
        isDeload: true,
        days: deloadWeek,
      },
    ],
    whyExercises,
    progression: [
      {
        ruleKind:
          inputs.goal === "hypertrophy" ? "double_progression" : "add_load",
        scope: "program",
        exerciseSlug: null,
        summary:
          inputs.goal === "hypertrophy"
            ? "Double progression on priority lifts: add reps within the table range, then add load and reset reps."
            : "Add load on priority lifts when all prescribed sets hit the table reps at or under target RPE with solid technique.",
        params: {
          priorityReps: volume.priorityReps,
          priorityRpe: volume.priorityRpe,
        },
      },
      {
        ruleKind: "add_reps",
        scope: "program",
        exerciseSlug: null,
        summary:
          "Accessories: add reps within the table band before adding sets — never invent new set counts outside the volume table.",
        params: {
          accessoryReps: volume.accessoryReps,
        },
      },
    ],
    deloadStrategy: {
      cadenceWeeks: volume.deloadEveryWeeks,
      loadReductionPct: DEFAULT_DELOAD_LOAD_PCT,
      setsDelta: DEFAULT_VOLUME_SET_DELTA,
      summary: `Every ~${volume.deloadEveryWeeks} weeks, run a deload week: reduce load ~${Math.round(DEFAULT_DELOAD_LOAD_PCT * 100)}% and trim ~${DEFAULT_VOLUME_SET_DELTA} hard set(s) per exercise (structured adaptive defaults — not random).`,
    },
    adjustmentRules: [
      {
        id: "adj.missed_reps",
        when: "Missed reps on a priority lift with honest effort",
        action: "keep_load or reduce_load",
        summary:
          "Repeat the load or reduce slightly; do not add volume to “make up” missed work.",
      },
      {
        id: "adj.easy_sets",
        when: "All priority sets land clearly under target RPE",
        action: "increase_load",
        summary:
          "Increase load on the next session using your normal increment — keep set counts from the volume table.",
      },
      {
        id: "adj.poor_recovery",
        when: "Sleep/stress tank or joint irritation rises",
        action: "reduce_volume or deload",
        summary:
          "Cut accessory sets first or bring the deload week forward. Pain is outside this builder — seek professional care.",
      },
      {
        id: "adj.technique_break",
        when: "Technique breaks before the set is complete",
        action: "keep_load",
        summary:
          "Hold load and own standards before progressing. Do not invent extra volume as a substitute for skill.",
      },
    ],
    volumeSource: {
      tableId: volumeTableId(),
      band: inputs.experience,
      weeklyHardSetBudget: volume.weeklyHardSetBudget,
      weeklyHardSetsPlanned,
    },
    missingInformation: [],
    disclaimers: PROGRAM_BUILDER_HONESTY,
  };

  if (weeklyHardSetsPlanned > volume.weeklyHardSetBudget) {
    draft.missingInformation.push(
      `Planned weekly hard sets (${weeklyHardSetsPlanned}) exceed table budget (${volume.weeklyHardSetBudget}) — trim accessories or session length before accepting.`,
    );
  }

  return { ok: true, draft };
}
