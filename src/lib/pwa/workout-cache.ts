/**
 * Client-side cached workout snapshot (Prompt 184).
 * IndexedDB only — never put auth tokens or technique media here.
 */

import {
  PWA_WORKOUT_DB,
  PWA_WORKOUT_STORE,
} from "@/domain/pwa-readiness/constants";
import type { WorkoutSessionView } from "@/services/workout/types";

export type CachedWorkoutSnapshot = {
  sessionId: string;
  /** Athlete profile id when known — scoping only, not a secret. */
  athleteKey: string;
  cachedAt: string;
  view: WorkoutSessionView;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PWA_WORKOUT_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PWA_WORKOUT_STORE)) {
        db.createObjectStore(PWA_WORKOUT_STORE, { keyPath: "sessionId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

/** Strip nothing sensitive beyond what the live player already shows. */
export async function cacheWorkoutSnapshot(input: {
  athleteKey: string;
  view: WorkoutSessionView;
}): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  if (input.view.status === "completed") {
    await clearCachedWorkout(input.view.sessionId);
    return;
  }
  const entry: CachedWorkoutSnapshot = {
    sessionId: input.view.sessionId,
    athleteKey: input.athleteKey,
    cachedAt: new Date().toISOString(),
    view: input.view,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PWA_WORKOUT_STORE, "readwrite");
    tx.objectStore(PWA_WORKOUT_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB put failed"));
  });
  db.close();
}

export async function readCachedWorkout(
  sessionId: string,
): Promise<CachedWorkoutSnapshot | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  const row = await new Promise<CachedWorkoutSnapshot | null>(
    (resolve, reject) => {
      const tx = db.transaction(PWA_WORKOUT_STORE, "readonly");
      const req = tx.objectStore(PWA_WORKOUT_STORE).get(sessionId);
      req.onsuccess = () =>
        resolve((req.result as CachedWorkoutSnapshot | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
    },
  );
  db.close();
  return row;
}

export async function clearCachedWorkout(sessionId: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PWA_WORKOUT_STORE, "readwrite");
    tx.objectStore(PWA_WORKOUT_STORE).delete(sessionId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB delete failed"));
  });
  db.close();
}

/** Request Background Sync for pending set logs when supported. */
export async function requestWorkoutBackgroundSync(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    const syncManager = (
      reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }
    ).sync;
    if (!syncManager) return false;
    await syncManager.register("tsm-workout-sync");
    return true;
  } catch {
    return false;
  }
}
