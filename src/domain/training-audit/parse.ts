import type {
  TrainingAuditDraft,
  TrainingAuditLine,
} from "@/domain/training-audit/types";

/**
 * Heuristic movement pattern from exercise name keywords.
 * Returns null when unsure — never invents a pattern to “complete” the audit.
 */
export function inferMovementPatternHeuristic(
  exerciseName: string,
): string | null {
  const n = exerciseName.toLowerCase().trim();
  if (!n) return null;
  if (/deadlift|rdl|romanian|good.?morning|hip.?thrust|swing/.test(n)) {
    return "hinge";
  }
  if (/squat|lunge|split.?squat|leg.?press|step.?up/.test(n)) {
    return "squat";
  }
  if (/bench|overhead.?press|ohp|push.?press|dip|push.?up|incline.?press/.test(n)) {
    return "push";
  }
  if (/row|pull.?up|chin.?up|lat.?pull|face.?pull|shrug/.test(n)) {
    return "pull";
  }
  if (/clean|snatch|jerk/.test(n)) return "olympic";
  if (/carry|farmer|yoke|walk/.test(n)) return "carry";
  return null;
}

function emptyLine(
  partial: Partial<TrainingAuditLine> & {
    dayIndex: number;
    exerciseName: string;
    source: TrainingAuditLine["source"];
  },
): TrainingAuditLine {
  const pattern =
    partial.movementPattern ??
    inferMovementPatternHeuristic(partial.exerciseName);
  return {
    dayIndex: partial.dayIndex,
    exerciseName: partial.exerciseName.trim(),
    sets: partial.sets ?? null,
    reps: partial.reps ?? null,
    rpe: partial.rpe ?? null,
    percent: partial.percent ?? null,
    loadKg: partial.loadKg ?? null,
    movementPattern: pattern,
    category: partial.category ?? null,
    patternResolved: pattern != null,
    source: partial.source,
    raw: partial.raw,
  };
}

function parseOptionalNumber(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw.replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

/**
 * CSV format (header optional):
 * day,exercise,sets,reps,rpe,percent,load_kg
 */
export function parseTrainingAuditCsv(csv: string): TrainingAuditDraft {
  const warnings: string[] = [];
  const lines: TrainingAuditLine[] = [];
  const rows = csv
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (rows.length === 0) {
    return {
      name: "Imported program",
      inputMode: "csv",
      lines: [],
      parseWarnings: ["CSV was empty — nothing to audit."],
    };
  }

  let start = 0;
  const header = rows[0]!.toLowerCase();
  if (header.includes("day") && header.includes("exercise")) {
    start = 1;
  }

  for (let i = start; i < rows.length; i++) {
    const raw = rows[i]!;
    const cols = splitCsvRow(raw);
    if (cols.length < 2) {
      warnings.push(`Row ${i + 1}: skipped — need at least day and exercise.`);
      continue;
    }
    const dayIndex = Math.round(parseOptionalNumber(cols[0]) ?? NaN);
    const exerciseName = (cols[1] ?? "").trim();
    if (!Number.isFinite(dayIndex) || dayIndex < 1 || !exerciseName) {
      warnings.push(
        `Row ${i + 1}: skipped — day must be 1–7+ and exercise name required.`,
      );
      continue;
    }
    lines.push(
      emptyLine({
        dayIndex,
        exerciseName,
        sets: parseOptionalNumber(cols[2]),
        reps: cols[3]?.trim() ? cols[3]!.trim() : null,
        rpe: parseOptionalNumber(cols[4]),
        percent: parseOptionalNumber(cols[5]),
        loadKg: parseOptionalNumber(cols[6]),
        source: "csv",
        raw,
      }),
    );
  }

  return {
    name: "CSV import",
    inputMode: "csv",
    lines,
    parseWarnings: warnings,
  };
}

function splitCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Structured paste examples:
 * Day 1
 * Back squat 4x5 @RPE8 80%
 * RDL 3x8
 *
 * Day 3 - Bench
 * Bench press 4x5
 */
export function parseTrainingAuditPaste(text: string): TrainingAuditDraft {
  const warnings: string[] = [];
  const lines: TrainingAuditLine[] = [];
  let currentDay = 1;
  const rawLines = text.split(/\r?\n/);

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const dayMatch = trimmed.match(
      /^day\s*(\d+)\b/i,
    );
    if (dayMatch) {
      currentDay = Number(dayMatch[1]);
      continue;
    }

    const parsed = parseExercisePrescriptionLine(trimmed, currentDay);
    if (!parsed) {
      warnings.push(
        `Could not parse line (left out — not invented): “${trimmed.slice(0, 80)}”`,
      );
      continue;
    }
    lines.push(parsed);
  }

  return {
    name: "Pasted program",
    inputMode: "paste",
    lines,
    parseWarnings: warnings,
  };
}

/**
 * Parse "Back squat 4x5 @RPE8 80%" or "Bench press 3x8-10".
 * Missing RPE/load stay null — never filled in.
 */
export function parseExercisePrescriptionLine(
  line: string,
  dayIndex: number,
): TrainingAuditLine | null {
  const trimmed = line.trim();
  if (!trimmed || /^day\s*\d+/i.test(trimmed)) return null;

  // Name then optional sets x reps
  const m = trimmed.match(
    /^(.+?)\s+(\d+)\s*[x×]\s*([\d]+(?:\s*[-–]\s*[\d]+)?)\s*(.*)$/i,
  );
  if (!m) {
    // Name only — still accept as a line with null sets when it looks like an exercise name
    if (trimmed.length < 2) return null;
    if (!/[a-zA-Z]/.test(trimmed) || /^[\W\d]+$/.test(trimmed)) return null;
    if (/\?{2,}/.test(trimmed)) return null;
    return emptyLine({
      dayIndex,
      exerciseName: trimmed,
      source: "paste",
      raw: trimmed,
    });
  }

  const exerciseName = m[1]!.trim();
  const sets = Number(m[2]);
  const reps = m[3]!.replace(/\s/g, "");
  const rest = m[4] ?? "";

  let rpe: number | null = null;
  const rpeMatch = rest.match(/@?\s*rpe\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (rpeMatch) rpe = Number(rpeMatch[1]);

  let percent: number | null = null;
  const pctMatch = rest.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
  if (pctMatch) percent = Number(pctMatch[1]);

  let loadKg: number | null = null;
  const kgMatch = rest.match(/([0-9]+(?:\.[0-9]+)?)\s*kg\b/i);
  if (kgMatch) loadKg = Number(kgMatch[1]);

  return emptyLine({
    dayIndex,
    exerciseName,
    sets: Number.isFinite(sets) ? sets : null,
    reps,
    rpe,
    percent,
    loadKg,
    source: "paste",
    raw: trimmed,
  });
}

export function buildManualAuditDraft(
  name: string,
  lines: Array<{
    dayIndex: number;
    exerciseName: string;
    sets: number | null;
    reps: string | null;
    rpe: number | null;
    percent: number | null;
    loadKg: number | null;
  }>,
): TrainingAuditDraft {
  const warnings: string[] = [];
  const out: TrainingAuditLine[] = [];
  for (const row of lines) {
    if (!row.exerciseName.trim()) {
      warnings.push("Skipped a row with empty exercise name.");
      continue;
    }
    out.push(
      emptyLine({
        ...row,
        exerciseName: row.exerciseName,
        source: "manual",
      }),
    );
  }
  return {
    name: name.trim() || "Manual program",
    inputMode: "manual",
    lines: out,
    parseWarnings: warnings,
  };
}
