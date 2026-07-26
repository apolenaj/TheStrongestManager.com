/**
 * Offline-friendly draft queue for workout set logs (Prompt 22).
 * Stores pending writes in localStorage and flushes when online.
 * Server remains source of truth after successful sync.
 */

export type PendingSetLog = {
  id: string;
  sessionId: string;
  sessionSetId: string;
  load: string;
  reps: string;
  rpe: string;
  rir: string;
  notes: string;
  markComplete: boolean;
  createdAt: string;
};

const STORAGE_KEY = "tsm-workout-pending-logs";

function readAll(): PendingSetLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PendingSetLog[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: PendingSetLog[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota / private mode — ignore; online path still works.
  }
}

export function listPendingSetLogs(sessionId?: string): PendingSetLog[] {
  const all = readAll();
  return sessionId ? all.filter((item) => item.sessionId === sessionId) : all;
}

export function enqueuePendingSetLog(
  item: Omit<PendingSetLog, "id" | "createdAt">,
): PendingSetLog {
  const entry: PendingSetLog = {
    ...item,
    id: `pending_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  const next = readAll().filter(
    (existing) => existing.sessionSetId !== item.sessionSetId,
  );
  next.push(entry);
  writeAll(next);
  return entry;
}

export function removePendingSetLog(id: string) {
  writeAll(readAll().filter((item) => item.id !== id));
}

export function clearPendingForSession(sessionId: string) {
  writeAll(readAll().filter((item) => item.sessionId !== sessionId));
}

export function isBrowserOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
