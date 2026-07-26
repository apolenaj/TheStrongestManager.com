/**
 * Map active program template weekdays → plan expectations.
 */

import type {
  ConsistencyPlanDay,
  PlanDayExpectation,
} from "@/domain/training-consistency-intelligence/types";

export type ProgramTemplateDay = {
  /** 1–7 program day index (Mon-aligned typical). */
  dayIndex: number;
  workoutId: string | null;
  name: string | null;
  /** Optional: week name/notes hinting deload (e.g. "(deload)"). */
  weekLabel: string | null;
};

/**
 * ISO weekday Mon=1 … Sun=7 (matches typical ProgramDay dayIndex).
 */
export function isoWeekday(dayKey: string): number {
  const d = new Date(`${dayKey}T12:00:00.000Z`);
  const js = d.getUTCDay(); // 0=Sun
  return js === 0 ? 7 : js;
}

export function eachDayKey(fromKey: string, toKey: string): string[] {
  const keys: string[] = [];
  const cur = new Date(`${fromKey}T12:00:00.000Z`);
  const end = new Date(`${toKey}T12:00:00.000Z`);
  while (cur <= end) {
    keys.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
}

/**
 * Build plan days for a window from a repeating weekly template.
 * dayIndex 1–7 → Mon–Sun. Missing indices → rest.
 */
export function buildPlanDaysFromTemplate(input: {
  windowStartKey: string;
  windowEndKey: string;
  templateDays: ProgramTemplateDay[];
}): ConsistencyPlanDay[] {
  const byIndex = new Map<number, ProgramTemplateDay>();
  for (const t of input.templateDays) {
    byIndex.set(t.dayIndex, t);
  }

  return eachDayKey(input.windowStartKey, input.windowEndKey).map((dayKey) => {
    const idx = isoWeekday(dayKey);
    const tpl = byIndex.get(idx);
    let expectation: PlanDayExpectation = "rest";
    if (!tpl) {
      expectation = "rest";
    } else if (tpl.workoutId) {
      expectation = "training";
    } else {
      expectation = "rest";
    }
    return {
      dayKey,
      expectation,
      dayName: tpl?.name ?? null,
    };
  });
}

/**
 * Detect deload-labelled weeks in template (name contains "deload").
 */
export function templateDayIsDeloadWeek(tpl: ProgramTemplateDay): boolean {
  const label = `${tpl.weekLabel ?? ""} ${tpl.name ?? ""}`.toLowerCase();
  return label.includes("deload");
}
