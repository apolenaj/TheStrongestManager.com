import {
  AUDIT_DENSE_SETS,
  AUDIT_DUPLICATE_PATTERN_SETS,
  AUDIT_RPE_JUMP,
  AUDIT_VOLUME_HIGH,
  AUDIT_VOLUME_VERY_HIGH,
  TRAINING_AUDIT_ENGINE_VERSION,
  TRAINING_AUDIT_HONESTY,
} from "@/domain/training-audit/constants";
import type {
  TrainingAuditDraft,
  TrainingAuditFinding,
  TrainingAuditResult,
} from "@/domain/training-audit/types";
import { draftToProgramStructureSignals } from "@/domain/training-audit/signals";
import { computeProgramScore } from "@/domain/program-score";
import type { ProgramReviewAthleteContext } from "@/domain/program-review/types";

function finding(
  code: TrainingAuditFinding["code"],
  title: string,
  detail: string,
  severity: TrainingAuditFinding["severity"],
  evidence: string[],
  confidence: TrainingAuditFinding["confidence"] = "medium",
): TrainingAuditFinding {
  return {
    id: `${code}-${evidence[0]?.slice(0, 24) ?? "x"}`,
    code,
    title,
    detail,
    severity,
    confidence,
    evidence,
  };
}

/**
 * Identify structural issues from imported lines only.
 * Never fabricates program details to “complete” a finding.
 */
export function findTrainingAuditIssues(
  draft: TrainingAuditDraft,
): TrainingAuditFinding[] {
  const findings: TrainingAuditFinding[] = [];
  if (draft.lines.length === 0) {
    return [
      finding(
        "unclear_progression",
        "Nothing to audit",
        "No exercise lines were imported. Add manual rows, CSV, or pasted text first.",
        "info",
        ["0 lines"],
        "none",
      ),
    ];
  }

  const signals = draftToProgramStructureSignals(draft);

  // —— Duplicate stress ——
  const byDayPattern = new Map<string, number>();
  for (const line of draft.lines) {
    const pattern = line.movementPattern;
    if (!pattern || !line.patternResolved) continue;
    const key = `${line.dayIndex}:${pattern}`;
    byDayPattern.set(key, (byDayPattern.get(key) ?? 0) + (line.sets ?? 0));
  }
  for (const [key, sets] of byDayPattern) {
    if (sets >= AUDIT_DUPLICATE_PATTERN_SETS) {
      const [day, pattern] = key.split(":");
      findings.push(
        finding(
          "duplicate_stress",
          "Potential duplicate stress",
          `Day ${day} stacks ~${sets} sets on the “${pattern}” pattern.`,
          "attention",
          [`day ${day}`, `pattern ${pattern}`, `${sets} sets`],
        ),
      );
    }
  }

  const sortedDays = [...signals.dayLoads].sort(
    (a, b) => a.dayIndex - b.dayIndex,
  );
  for (let i = 1; i < sortedDays.length; i++) {
    const a = sortedDays[i - 1]!;
    const b = sortedDays[i]!;
    if (b.dayIndex !== a.dayIndex + 1) continue;
    if (
      a.estimatedSets >= AUDIT_DENSE_SETS &&
      b.estimatedSets >= AUDIT_DENSE_SETS
    ) {
      findings.push(
        finding(
          "duplicate_stress",
          "Back-to-back dense days",
          `Day ${a.dayIndex} (~${a.estimatedSets} sets) sits next to day ${b.dayIndex} (~${b.estimatedSets} sets).`,
          "watch",
          [
            `day ${a.dayIndex}: ${a.estimatedSets} sets`,
            `day ${b.dayIndex}: ${b.estimatedSets} sets`,
          ],
        ),
      );
    }
  }

  // —— Missing movement patterns ——
  const resolvedPatterns = new Set(
    draft.lines
      .filter((l) => l.patternResolved && l.movementPattern)
      .map((l) => l.movementPattern!),
  );
  const unresolved = [
    ...new Set(
      draft.lines
        .filter((l) => !l.patternResolved)
        .map((l) => l.exerciseName),
    ),
  ];
  if (resolvedPatterns.size > 0) {
    const missing: string[] = [];
    if (resolvedPatterns.has("push") && !resolvedPatterns.has("pull")) {
      missing.push("pull");
    }
    if (resolvedPatterns.has("squat") && !resolvedPatterns.has("hinge")) {
      missing.push("hinge");
    }
    if (resolvedPatterns.has("hinge") && !resolvedPatterns.has("squat")) {
      missing.push("squat");
    }
    if (missing.length) {
      findings.push(
        finding(
          "missing_movement_pattern",
          "Missing movement pattern",
          `Resolved patterns include ${[...resolvedPatterns].join(", ")} but not ${missing.join(", ")}.`,
          "watch",
          [`present: ${[...resolvedPatterns].join(", ")}`, `missing: ${missing.join(", ")}`],
        ),
      );
    }
  }
  if (unresolved.length > 0) {
    findings.push(
      finding(
        "missing_movement_pattern",
        "Unresolved exercise names",
        `${unresolved.length} exercise name(s) could not be mapped to a movement pattern — left unresolved (not invented).`,
        "info",
        unresolved.slice(0, 5),
        "low",
      ),
    );
  }

  // —— Excessive progression (intensity density) ——
  for (let i = 1; i < sortedDays.length; i++) {
    const a = sortedDays[i - 1]!;
    const b = sortedDays[i]!;
    if (a.avgRpe == null || b.avgRpe == null) continue;
    if (b.avgRpe - a.avgRpe >= AUDIT_RPE_JUMP && b.dayIndex === a.dayIndex + 1) {
      findings.push(
        finding(
          "excessive_progression",
          "Steep day-to-day RPE jump",
          `Average RPE rises from ${a.avgRpe} (day ${a.dayIndex}) to ${b.avgRpe} (day ${b.dayIndex}).`,
          "watch",
          [`day ${a.dayIndex} avg RPE ${a.avgRpe}`, `day ${b.dayIndex} avg RPE ${b.avgRpe}`],
        ),
      );
    }
  }
  const highPct = draft.lines.filter(
    (l) => l.percent != null && l.percent >= 90,
  );
  const highPctDays = new Set(highPct.map((l) => l.dayIndex));
  if (highPctDays.size >= 3) {
    findings.push(
      finding(
        "excessive_progression",
        "Many high-% days",
        `${highPctDays.size} days include ≥90% prescriptions — peak density may be high for a single week snapshot.`,
        "attention",
        highPct.slice(0, 4).map(
          (l) => `${l.exerciseName} day ${l.dayIndex} @ ${l.percent}%`,
        ),
      ),
    );
  }

  // —— Poor exercise ordering ——
  for (const [dayIndex, group] of groupByDay(draft.lines)) {
    if (group.length < 2) continue;
    const indices = group.map((l, i) => ({
      i,
      pattern: l.movementPattern,
      name: l.exerciseName,
      sets: l.sets,
    }));
    // Isolation-like (accessory/other) before compound squat/hinge/push/pull with higher sets
    const firstCompound = indices.findIndex((x) =>
      ["squat", "hinge", "push", "pull", "olympic"].includes(x.pattern ?? ""),
    );
    const firstAccessory = indices.findIndex(
      (x) =>
        x.pattern === "accessory" ||
        x.pattern === "other" ||
        x.pattern == null,
    );
    if (
      firstAccessory >= 0 &&
      firstCompound > firstAccessory &&
      (indices[firstCompound]?.sets ?? 0) >= 3
    ) {
      findings.push(
        finding(
          "poor_exercise_ordering",
          "Possible poor exercise ordering",
          `Day ${dayIndex}: “${indices[firstAccessory]!.name}” appears before main compound “${indices[firstCompound]!.name}”.`,
          "info",
          [
            `day ${dayIndex} order: ${group.map((g) => g.exerciseName).join(" → ")}`,
          ],
          "low",
        ),
      );
    }
  }

  // —— Unrealistic volume ——
  const weekly = signals.estimatedWeeklySets;
  const linesWithSets = draft.lines.filter((l) => l.sets != null).length;
  if (linesWithSets === 0) {
    findings.push(
      finding(
        "unrealistic_volume",
        "Volume not measurable",
        "No set counts were provided — volume cannot be judged (and will not be invented).",
        "info",
        ["sets missing on all lines"],
        "none",
      ),
    );
  } else if (weekly >= AUDIT_VOLUME_VERY_HIGH) {
    findings.push(
      finding(
        "unrealistic_volume",
        "Potentially unrealistic volume",
        `Imported lines sum to ~${weekly} sets in this week snapshot — unusually high for most athletes.`,
        "attention",
        [`~${weekly} sets`, `${linesWithSets} lines with sets`],
      ),
    );
  } else if (weekly >= AUDIT_VOLUME_HIGH) {
    findings.push(
      finding(
        "unrealistic_volume",
        "High weekly set count",
        `Imported lines sum to ~${weekly} sets — review against your recovery and experience.`,
        "watch",
        [`~${weekly} sets`],
      ),
    );
  }

  // —— Unclear progression ——
  const hasIntensity =
    signals.hasRpePrescription ||
    signals.hasPercentPrescription ||
    signals.hasLoadPrescription;
  if (!hasIntensity) {
    findings.push(
      finding(
        "unclear_progression",
        "Unclear progression",
        "No RPE, percent, or load values were provided on any line — progression cannot be inferred.",
        "watch",
        ["no RPE/%/load on import"],
        "medium",
      ),
    );
  }

  // Dedupe by code+title
  const seen = new Set<string>();
  return findings.filter((f) => {
    const k = `${f.code}:${f.title}:${f.evidence[0] ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function groupByDay(
  lines: TrainingAuditDraft["lines"],
): Map<number, TrainingAuditDraft["lines"]> {
  const map = new Map<number, TrainingAuditDraft["lines"]>();
  for (const line of lines) {
    const list = map.get(line.dayIndex) ?? [];
    list.push(line);
    map.set(line.dayIndex, list);
  }
  return map;
}

function buildImprovements(findings: TrainingAuditFinding[]): string[] {
  const out: string[] = [];
  const codes = new Set(findings.map((f) => f.code));

  if (codes.has("duplicate_stress")) {
    out.push(
      "Space similar patterns across non-adjacent days, or reduce sets on one of the stacked days.",
    );
  }
  if (codes.has("missing_movement_pattern")) {
    out.push(
      "Add a balancing pattern (e.g. pull if push-heavy) or clarify unresolved exercise names.",
    );
  }
  if (codes.has("excessive_progression")) {
    out.push(
      "Flatten day-to-day RPE jumps or limit how many ≥90% exposures sit in the same week.",
    );
  }
  if (codes.has("poor_exercise_ordering")) {
    out.push(
      "Place main compounds before accessories within a session when the goal is strength.",
    );
  }
  if (codes.has("unrealistic_volume")) {
    out.push(
      "Verify set counts are weekly (not a full block pasted as one week), or trim accessory volume.",
    );
  }
  if (codes.has("unclear_progression")) {
    out.push(
      "Add RPE, percent, or load anchors on key lifts so progression is reviewable.",
    );
  }
  if (out.length === 0) {
    out.push(
      "No structural red flags from the imported lines — re-audit after you add intensity anchors or another week.",
    );
  }
  out.push(
    "Save or assign an official program under Programs if you want this plan in Today — the audit does not invent or auto-write a program.",
  );
  return out.slice(0, 6);
}

/**
 * Full audit assembly: findings + understanding + improve + optional Program Score.
 */
export function assembleTrainingAudit(input: {
  draft: TrainingAuditDraft;
  context?: ProgramReviewAthleteContext | null;
}): TrainingAuditResult {
  const { draft } = input;
  const findings = findTrainingAuditIssues(draft);
  const signals = draftToProgramStructureSignals(draft);
  const days = new Set(draft.lines.map((l) => l.dayIndex));
  const unresolvedExercises = [
    ...new Set(
      draft.lines.filter((l) => !l.patternResolved).map((l) => l.exerciseName),
    ),
  ];

  const attention = findings.filter((f) => f.severity === "attention").length;
  const headline =
    draft.lines.length === 0
      ? "Upload a program to begin"
      : attention > 0
        ? `${attention} attention item(s) from your import`
        : findings.length > 0
          ? `${findings.length} observation(s) from your import`
          : "Import looks structurally quiet";

  const summary = [
    `“${draft.name}” via ${draft.inputMode}: ${draft.lines.length} line(s) across ${days.size} day(s).`,
    draft.parseWarnings.length
      ? `${draft.parseWarnings.length} parse warning(s) — skipped lines were not invented.`
      : "All provided lines were kept as entered.",
    unresolvedExercises.length
      ? `${unresolvedExercises.length} exercise name(s) unresolved for pattern tagging.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const context: ProgramReviewAthleteContext = input.context ?? {
    goalTitle: null,
    goalCategory: null,
    experienceLevel: null,
    daysPerWeek: null,
    sessionLengthMinutes: null,
    availableEquipment: [],
    recoveryCapacity: "unknown",
    primaryDiscipline: null,
  };

  const programScore =
    draft.lines.length > 0
      ? computeProgramScore({ signals, context })
      : null;

  const missingInformation: string[] = [...draft.parseWarnings];
  if (draft.lines.every((l) => l.sets == null)) {
    missingInformation.push("Set counts on exercise lines");
  }
  if (
    !signals.hasRpePrescription &&
    !signals.hasPercentPrescription &&
    !signals.hasLoadPrescription
  ) {
    missingInformation.push("RPE, percent, or load anchors");
  }
  if (unresolvedExercises.length) {
    missingInformation.push(
      `Resolved movement patterns for: ${unresolvedExercises.slice(0, 3).join(", ")}`,
    );
  }

  return {
    engineVersion: TRAINING_AUDIT_ENGINE_VERSION,
    stage: "understand",
    draft,
    findings,
    understanding: {
      headline,
      summary,
      lineCount: draft.lines.length,
      dayCount: days.size,
      unresolvedExercises,
    },
    improvements: buildImprovements(findings),
    programScore,
    honesty: TRAINING_AUDIT_HONESTY,
    missingInformation: [...new Set(missingInformation)],
  };
}
