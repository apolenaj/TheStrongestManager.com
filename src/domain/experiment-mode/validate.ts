/**
 * Validate personal training experiment inputs.
 */

import {
  EXPERIMENT_DURATION_WEEKS_MAX,
  EXPERIMENT_DURATION_WEEKS_MIN,
  EXPERIMENT_MEASURES,
  type ExperimentMeasure,
} from "@/domain/experiment-mode/constants";
import type { CreateExperimentInput } from "@/domain/experiment-mode/types";

function isMeasure(raw: string): raw is ExperimentMeasure {
  return (EXPERIMENT_MEASURES as readonly string[]).includes(raw);
}

export function validateCreateExperimentInput(
  raw: Partial<CreateExperimentInput> & { measures?: string[] },
):
  | { ok: true; value: CreateExperimentInput }
  | { ok: false; error: string } {
  const title = raw.title?.trim() ?? "";
  const intervention = raw.intervention?.trim() ?? "";
  const hypothesis = raw.hypothesis?.trim() ?? "";

  if (!title) return { ok: false, error: "Title is required." };
  if (!intervention) {
    return {
      ok: false,
      error: "Describe what you will test (the intervention).",
    };
  }
  if (!hypothesis) {
    return {
      ok: false,
      error: "Add a personal prediction (what you expect to improve).",
    };
  }

  const weeks = Number(raw.durationWeeks);
  if (
    !Number.isInteger(weeks) ||
    weeks < EXPERIMENT_DURATION_WEEKS_MIN ||
    weeks > EXPERIMENT_DURATION_WEEKS_MAX
  ) {
    return {
      ok: false,
      error: `Duration must be ${EXPERIMENT_DURATION_WEEKS_MIN}–${EXPERIMENT_DURATION_WEEKS_MAX} weeks.`,
    };
  }

  const measuresRaw = raw.measures ?? [];
  if (measuresRaw.length === 0) {
    return { ok: false, error: "Select at least one measure." };
  }
  const measures: ExperimentMeasure[] = [];
  for (const m of measuresRaw) {
    if (!isMeasure(m)) {
      return { ok: false, error: `Unknown measure “${m}”.` };
    }
    if (!measures.includes(m)) measures.push(m);
  }

  return {
    ok: true,
    value: {
      title,
      intervention,
      hypothesis,
      measures,
      durationWeeks: weeks,
      athleteNotes: raw.athleteNotes?.trim() || null,
      plannedStartAt: raw.plannedStartAt?.trim() || null,
    },
  };
}
