/**
 * Offline draft queue contract for Live Competition Mode (Prompt 196).
 * Architecture only — runtime sync ships when liveCompetitionRuntime is on.
 * Mirrors workout offline-queue patterns; never invents meet results.
 */

import {
  LIVE_COMPETITION_OFFLINE_STORAGE_KEY,
  type LiveCompetitionOfflineMutation,
} from "@/domain/live-competition-mode";
import type { LiveCompetitionOfflineDraft } from "@/domain/live-competition-mode";

function readAll(): LiveCompetitionOfflineDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(
      LIVE_COMPETITION_OFFLINE_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? (parsed as LiveCompetitionOfflineDraft[])
      : [];
  } catch {
    return [];
  }
}

function writeAll(items: LiveCompetitionOfflineDraft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LIVE_COMPETITION_OFFLINE_STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch {
    // Quota / private mode — online path remains source of truth later.
  }
}

export function listLiveCompetitionOfflineDrafts(
  meetSessionId?: string,
): LiveCompetitionOfflineDraft[] {
  const all = readAll();
  return meetSessionId
    ? all.filter((d) => d.meetSessionId === meetSessionId)
    : all;
}

export function enqueueLiveCompetitionOfflineDraft(input: {
  mutation: LiveCompetitionOfflineMutation;
  meetSessionId: string;
  payloadJson: string;
}): LiveCompetitionOfflineDraft {
  const draft: LiveCompetitionOfflineDraft = {
    id: `lcd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mutation: input.mutation,
    meetSessionId: input.meetSessionId,
    payloadJson: input.payloadJson,
    createdAt: new Date().toISOString(),
  };
  writeAll([...readAll(), draft]);
  return draft;
}

export function clearLiveCompetitionOfflineDrafts(meetSessionId?: string) {
  if (!meetSessionId) {
    writeAll([]);
    return;
  }
  writeAll(readAll().filter((d) => d.meetSessionId !== meetSessionId));
}
