/**
 * Program Builder 2.0 service (Prompt 117).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  editProgramBuilderDraft,
  generateProgramBuilderDraft,
  type ProgramBuilderDraft,
  type ProgramBuilderExerciseEdit,
  type ProgramBuilderInputs,
} from "@/domain/program-builder";

export async function createProgramBuilderDraft(
  inputs: Partial<ProgramBuilderInputs> & { priorityLifts?: string[] },
): Promise<
  | { ok: true; draft: ProgramBuilderDraft }
  | { ok: false; error: string }
> {
  if (!featureFlags.programBuilder) {
    return { ok: false, error: "Program Builder 2.0 is not enabled." };
  }
  return generateProgramBuilderDraft(inputs);
}

export async function applyProgramBuilderEdits(input: {
  draft: ProgramBuilderDraft;
  edits: ProgramBuilderExerciseEdit[];
}): Promise<
  | { ok: true; draft: ProgramBuilderDraft }
  | { ok: false; error: string }
> {
  if (!featureFlags.programBuilder) {
    return { ok: false, error: "Program Builder 2.0 is not enabled." };
  }
  return editProgramBuilderDraft(input.draft, input.edits);
}
