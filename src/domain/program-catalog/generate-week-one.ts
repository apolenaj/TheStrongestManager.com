import type {
  ProgramDayPrescription,
  ProgramExercisePrescription,
  ProgramWeekPrescription,
  UnitSystem,
} from "@/types/programs";

export type GenerateWeekOneInput = {
  scheduleVariant: string;
  unitSystem: UnitSystem;
  trainingMaxes: Record<string, number>;
  /** Optional emphasis from finder / athlete preference. */
  weakestLift?: "squat" | "bench" | "deadlift" | "none";
  productName: string;
};

function daysFromVariant(scheduleVariant: string): number {
  const match = /^(\d+)/.exec(scheduleVariant);
  const n = match ? Number(match[1]) : 4;
  return Math.min(6, Math.max(3, n));
}

function loadFor(
  tm: number | undefined,
  percent: number,
): number | undefined {
  if (tm == null || tm <= 0) return undefined;
  return Math.round(tm * (percent / 100) * 2) / 2;
}

function mainLift(
  exerciseId: string,
  name: string,
  tm: number | undefined,
  percent: number,
  sets: number,
  reps: number,
  rpe: number,
): ProgramExercisePrescription {
  const weight = loadFor(tm, percent);
  return {
    exerciseId,
    name,
    defaultRpe: rpe,
    restSeconds: 180,
    sets: Array.from({ length: sets }, () => ({
      reps,
      rpe,
      percentOfTm: percent,
      ...(weight != null ? { weight } : {}),
      kind: "work",
    })),
    notes:
      weight == null
        ? "No training max on file — use RPE only and leave load blank until you establish a max."
        : undefined,
  };
}

function accessory(
  exerciseId: string,
  name: string,
  sets: number,
  reps: number,
  rpe: number,
): ProgramExercisePrescription {
  return {
    exerciseId,
    name,
    defaultRpe: rpe,
    restSeconds: 90,
    sets: Array.from({ length: sets }, () => ({
      reps,
      rpe,
      kind: "work",
    })),
  };
}

/**
 * Deterministic week-1 schedule from onboarding inputs.
 * Educational starter — not an individualized coach plan.
 */
export function generateFirstTrainingWeek(
  input: GenerateWeekOneInput,
): ProgramWeekPrescription {
  const dayCount = daysFromVariant(input.scheduleVariant);
  const tm = input.trainingMaxes;
  const weak = input.weakestLift && input.weakestLift !== "none"
    ? input.weakestLift
    : null;

  const templates: ProgramDayPrescription[] = [];

  if (dayCount === 3) {
    templates.push(
      {
        day: 1,
        label: "Day 1 — Squat focus",
        focus: "squat",
        exercises: [
          mainLift("back-squat", "Back squat", tm.squat, 70, 3, 5, 7),
          accessory("romanian-deadlift", "Romanian deadlift", 3, 8, 7),
          accessory("leg-curl", "Leg curl", 2, 12, 7),
        ],
      },
      {
        day: 2,
        label: "Day 2 — Bench focus",
        focus: "bench",
        exercises: [
          mainLift("bench-press", "Bench press", tm.bench, 70, 3, 5, 7),
          accessory("row", "Chest-supported row", 3, 10, 7),
          accessory("overhead-press", "Overhead press", 2, 8, 7),
        ],
      },
      {
        day: 3,
        label: "Day 3 — Deadlift focus",
        focus: "deadlift",
        exercises: [
          mainLift("deadlift", "Deadlift", tm.deadlift, 70, 3, 5, 7),
          accessory("front-squat", "Front squat", 2, 6, 7),
          accessory("pull-up", "Pull-up or lat pulldown", 3, 8, 7),
        ],
      },
    );
  } else if (dayCount === 4) {
    templates.push(
      {
        day: 1,
        label: "Day 1 — Squat",
        focus: "squat",
        exercises: [
          mainLift("back-squat", "Back squat", tm.squat, 72, 4, 4, 7.5),
          accessory("leg-press", "Leg press", 3, 10, 7),
          accessory("plank", "Plank", 3, 30, 6),
        ],
      },
      {
        day: 2,
        label: "Day 2 — Bench",
        focus: "bench",
        exercises: [
          mainLift("bench-press", "Bench press", tm.bench, 72, 4, 4, 7.5),
          accessory("db-press", "Dumbbell press", 3, 10, 7),
          accessory("row", "Barbell row", 3, 8, 7),
        ],
      },
      {
        day: 3,
        label: "Day 3 — Deadlift",
        focus: "deadlift",
        exercises: [
          mainLift("deadlift", "Deadlift", tm.deadlift, 70, 3, 4, 7.5),
          accessory("back-extension", "Back extension", 3, 12, 7),
          accessory("hanging-leg-raise", "Hanging leg raise", 3, 10, 7),
        ],
      },
      {
        day: 4,
        label: "Day 4 — Upper volume",
        focus: "bench",
        exercises: [
          mainLift("bench-press", "Bench press", tm.bench, 65, 3, 6, 7),
          accessory("overhead-press", "Overhead press", 3, 8, 7),
          accessory("face-pull", "Face pull", 3, 15, 7),
        ],
      },
    );
  } else {
    // 5–6 day: higher frequency, lighter relative intensity
    const base: ProgramDayPrescription[] = [
      {
        day: 1,
        label: "Day 1 — Squat",
        focus: "squat",
        exercises: [
          mainLift("back-squat", "Back squat", tm.squat, 65, 3, 5, 7),
          accessory("lunges", "Walking lunge", 2, 10, 7),
        ],
      },
      {
        day: 2,
        label: "Day 2 — Bench",
        focus: "bench",
        exercises: [
          mainLift("bench-press", "Bench press", tm.bench, 65, 3, 5, 7),
          accessory("row", "Row", 3, 10, 7),
        ],
      },
      {
        day: 3,
        label: "Day 3 — Deadlift",
        focus: "deadlift",
        exercises: [
          mainLift("deadlift", "Deadlift", tm.deadlift, 65, 3, 4, 7),
          accessory("hip-hinge-accessory", "Good morning or RDL", 2, 8, 7),
        ],
      },
      {
        day: 4,
        label: "Day 4 — Squat volume",
        focus: "squat",
        exercises: [
          mainLift("back-squat", "Back squat", tm.squat, 60, 3, 6, 6.5),
          accessory("leg-curl", "Leg curl", 2, 12, 7),
        ],
      },
      {
        day: 5,
        label: "Day 5 — Bench volume",
        focus: "bench",
        exercises: [
          mainLift("bench-press", "Bench press", tm.bench, 60, 3, 6, 6.5),
          accessory("overhead-press", "Overhead press", 2, 8, 7),
        ],
      },
    ];
    if (dayCount >= 6) {
      base.push({
        day: 6,
        label: "Day 6 — Pull / weak-point",
        focus: weak ?? "deadlift",
        exercises: [
          mainLift("deadlift", "Deadlift variation", tm.deadlift, 55, 2, 5, 6.5),
          accessory("pull-up", "Pull-up", 3, 8, 7),
          accessory("core", "Core circuit", 2, 12, 6),
        ],
      });
    }
    templates.push(...base);
  }

  // Extra weak-lift emphasis: add one backoff set on matching days.
  if (weak) {
    for (const day of templates) {
      if (day.focus !== weak) continue;
      const main = day.exercises[0];
      if (!main) continue;
      const tmValue = tm[weak];
      const weight = loadFor(tmValue, 60);
      main.sets.push({
        reps: 5,
        rpe: 6,
        percentOfTm: 60,
        kind: "backoff",
        notes: `Extra ${weak} practice from onboarding emphasis.`,
        ...(weight != null ? { weight } : {}),
      });
      day.notes = `Includes light extra ${weak} volume from your stated weak lift.`;
    }
  }

  return {
    week: 1,
    label: "Week 1 — Onboarding starter",
    theme: "Establish positions and loads",
    days: templates,
    notes: `Generated for ${input.productName} (${input.scheduleVariant}, ${input.unitSystem}). Educational template — adjust if pain or recovery demands it.`,
  };
}
