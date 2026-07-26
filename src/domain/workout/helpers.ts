/**
 * Workout experience domain helpers (Prompt 22).
 */

/** Training-week day index: Monday=1 … Sunday=7. */
export function trainingDayIndexFromDate(date: Date): number {
  const jsDay = date.getDay(); // 0=Sun … 6=Sat
  return jsDay === 0 ? 7 : jsDay;
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Pick one short technique cue for the live workout UI.
 * Prefer workout notes, then setup, then first common mistake — never invent.
 */
export function pickTechniqueCue(input: {
  workoutNotes: string | null | undefined;
  setup: string | null | undefined;
  execution: string | null | undefined;
  commonMistakesJson: string | null | undefined;
}): string | null {
  const fromNotes = input.workoutNotes?.trim();
  if (fromNotes) return truncateCue(fromNotes);

  const fromSetup = firstSentence(input.setup);
  if (fromSetup) return fromSetup;

  const fromExecution = firstSentence(input.execution);
  if (fromExecution) return fromExecution;

  try {
    const mistakes = JSON.parse(input.commonMistakesJson ?? "[]") as unknown;
    if (Array.isArray(mistakes) && typeof mistakes[0] === "string") {
      const cue = mistakes[0].trim();
      if (cue) return truncateCue(cue);
    }
  } catch {
    // ignore malformed JSON
  }

  return null;
}

function firstSentence(text: string | null | undefined): string | null {
  if (!text?.trim()) return null;
  const trimmed = text.trim();
  const match = trimmed.match(/^[^.!?\n]+[.!?]?/);
  return truncateCue(match?.[0]?.trim() || trimmed);
}

function truncateCue(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
