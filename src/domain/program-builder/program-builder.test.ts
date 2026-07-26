import { describe, expect, it } from "vitest";
import {
  PROGRAM_BUILDER_HONESTY,
  PROGRAM_BUILDER_VOLUME_TABLE_ID,
  editProgramBuilderDraft,
  generateProgramBuilderDraft,
  lookupVolumeTable,
} from "@/domain/program-builder";

const baseInputs = {
  goal: "strength" as const,
  days: "4" as const,
  session: "medium" as const,
  equipment: "full_gym" as const,
  experience: "intermediate" as const,
  priorityLifts: ["back-squat", "bench-press", "deadlift"] as const,
};

describe("program-builder", () => {
  it("generates a draft with why, progression, deload, and adjustment rules", () => {
    const result = generateProgramBuilderDraft({
      ...baseInputs,
      priorityLifts: [...baseInputs.priorityLifts],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { draft } = result;
    expect(draft.autoApply).toBe(false);
    expect(draft.whyExercises.length).toBeGreaterThan(0);
    expect(draft.progression.length).toBeGreaterThan(0);
    expect(draft.deloadStrategy.cadenceWeeks).toBeGreaterThan(0);
    expect(draft.adjustmentRules.length).toBeGreaterThanOrEqual(3);
    expect(draft.volumeSource.tableId).toBe(PROGRAM_BUILDER_VOLUME_TABLE_ID);
    expect(draft.weeks.some((w) => w.isDeload)).toBe(true);
    expect(draft.weeks[0]?.days.length).toBe(4);
  });

  it("does not invent random volume — sets come from the volume table", () => {
    const volume = lookupVolumeTable({
      goal: "strength",
      experience: "intermediate",
      session: "medium",
    });
    const result = generateProgramBuilderDraft({
      ...baseInputs,
      priorityLifts: [...baseInputs.priorityLifts],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const day of result.draft.weeks[0]!.days) {
      for (const ex of day.exercises) {
        if (ex.role === "priority") {
          expect(ex.targetSets).toBe(volume.prioritySetsPerSession);
          expect(ex.targetReps).toBe(volume.priorityReps);
        }
        if (ex.role === "accessory") {
          expect(ex.targetSets).toBe(volume.accessorySets);
          expect(ex.targetReps).toBe(volume.accessoryReps);
        }
      }
    }
  });

  it("rejects empty priority lifts and unknown catalog slugs", () => {
    expect(
      generateProgramBuilderDraft({
        ...baseInputs,
        priorityLifts: [],
      }).ok,
    ).toBe(false);
    expect(
      generateProgramBuilderDraft({
        goal: "strength",
        days: "4",
        session: "medium",
        equipment: "full_gym",
        experience: "intermediate",
        priorityLifts: ["invented-curl-machine"],
      } as Parameters<typeof generateProgramBuilderDraft>[0]).ok,
    ).toBe(false);
  });

  it("allows user edits while clamping sets (no random AI volume)", () => {
    const created = generateProgramBuilderDraft({
      ...baseInputs,
      priorityLifts: [...baseInputs.priorityLifts],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const first = created.draft.weeks[0]!.days[0]!.exercises[0]!;
    const edited = editProgramBuilderDraft(created.draft, [
      {
        dayIndex: 0,
        exerciseSlug: first.slug,
        targetSets: 99,
      },
    ]);
    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    expect(edited.draft.status).toBe("user_edited");
    expect(edited.draft.autoApply).toBe(false);
    const updated = edited.draft.weeks[0]!.days[0]!.exercises.find(
      (e) => e.slug === first.slug,
    );
    expect(updated?.targetSets).toBe(8);
  });

  it("states honesty about structured volume and no auto-apply", () => {
    const blob = PROGRAM_BUILDER_HONESTY.join(" ");
    expect(blob).toMatch(/volume tables|not random/i);
    expect(blob).toMatch(/never auto-apply/i);
  });
});
