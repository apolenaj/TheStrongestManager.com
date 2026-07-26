/**
 * Recently viewed exercises — client-only, privacy-friendly (localStorage).
 * Not analytics; no server tracking.
 */

const STORAGE_KEY = "tsm:recent-exercises";
const MAX_RECENT = 8;

export type RecentExerciseEntry = {
  slug: string;
  name: string;
  viewedAt: number;
};

export function readRecentExercises(): RecentExerciseEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentExerciseEntry =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as RecentExerciseEntry).slug === "string" &&
          typeof (item as RecentExerciseEntry).name === "string",
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberExerciseView(slug: string, name: string): void {
  if (typeof window === "undefined") return;
  const next: RecentExerciseEntry[] = [
    { slug, name, viewedAt: Date.now() },
    ...readRecentExercises().filter((item) => item.slug !== slug),
  ].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — discovery still works without recent history.
  }
}
