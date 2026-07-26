/**
 * Context windows: deload, injury break, program change.
 * Planned rest comes from the program day template, not these windows.
 */

import type { ConsistencyContextWindow } from "@/domain/training-consistency-intelligence/types";
import {
  TCI_DELOAD_CONTEXT_DAYS,
  TCI_PROGRAM_CHANGE_CONTEXT_DAYS,
} from "@/domain/training-consistency-intelligence/constants";

function dayKeyFromIso(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const d = new Date(`${dayKey}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, delta: number): string | null {
  const key = dayKeyFromIso(iso);
  if (!key) return null;
  return shiftDayKey(key, delta);
}

function isAcceptedAdaptation(status: string, appliedAt: string | null): boolean {
  return (
    status === "accepted" ||
    status === "modified" ||
    appliedAt != null
  );
}

/**
 * Build deload windows from accepted/applied deload adaptations.
 */
export function buildDeloadContexts(input: {
  adaptations: Array<{
    changeKind: string;
    status: string;
    decidedAt: string | null;
    appliedAt: string | null;
    createdAt: string;
  }>;
}): ConsistencyContextWindow[] {
  const out: ConsistencyContextWindow[] = [];
  for (const a of input.adaptations) {
    if (a.changeKind !== "deload") continue;
    if (!isAcceptedAdaptation(a.status, a.appliedAt)) continue;
    const anchor = a.appliedAt ?? a.decidedAt ?? a.createdAt;
    const start = addDays(anchor, -1);
    const end = addDays(anchor, TCI_DELOAD_CONTEXT_DAYS - 1);
    if (!start || !end) continue;
    out.push({
      kind: "deload",
      startDayKey: start,
      endDayKey: end,
      label: "Accepted deload window",
    });
  }
  return out;
}

/**
 * Program version saves create a short transition window (not a miss).
 */
export function buildProgramChangeContexts(input: {
  versions: Array<{ createdAt: string; versionNumber: number }>;
}): ConsistencyContextWindow[] {
  const out: ConsistencyContextWindow[] = [];
  for (const v of input.versions) {
    const start = dayKeyFromIso(v.createdAt);
    if (!start) continue;
    out.push({
      kind: "program_change",
      startDayKey: start,
      endDayKey: shiftDayKey(start, TCI_PROGRAM_CHANGE_CONTEXT_DAYS - 1),
      label: `Program change (v${v.versionNumber})`,
    });
  }
  return out;
}

/**
 * Injury / pause breaks from explicit pause signals (service-gathered).
 */
export function buildInjuryBreakContexts(input: {
  breaks: Array<{ startAt: string; endAt: string; label?: string }>;
}): ConsistencyContextWindow[] {
  const out: ConsistencyContextWindow[] = [];
  for (const b of input.breaks) {
    const start = dayKeyFromIso(b.startAt);
    const end = dayKeyFromIso(b.endAt);
    if (!start || !end) continue;
    out.push({
      kind: "injury_break",
      startDayKey: start,
      endDayKey: end,
      label: b.label ?? "Injury / training break",
    });
  }
  return out;
}

export function contextsForDay(
  dayKey: string,
  windows: ConsistencyContextWindow[],
): ConsistencyContextWindow[] {
  return windows.filter(
    (w) => dayKey >= w.startDayKey && dayKey <= w.endDayKey,
  );
}
