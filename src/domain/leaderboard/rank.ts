import {
  verificationRank,
  type LeaderboardCategoryId,
  type LiftVerificationTier,
} from "@/domain/leaderboard/constants";

export type LeaderboardFilters = {
  bodyweightClassMaxKg: number | null;
  countryCode: string | null;
  sport: string | null;
  /** When set, only include this verification tier (lift boards). */
  verification: LiftVerificationTier | null;
};

export type LeaderboardAthleteRef = {
  athleteProfileId: string;
  displayName: string | null;
  anonymousLabel: string;
  showDisplayName: boolean;
  countryCode: string | null;
  bodyweightClassMaxKg: number | null;
  sport: string | null;
};

export type LiftBoardEntryInput = {
  athlete: LeaderboardAthleteRef;
  liftLabel: string;
  loadKg: number;
  reps: number | null;
  verification: LiftVerificationTier;
  recordedAt: Date;
};

export type TechniqueImprovementInput = {
  athlete: LeaderboardAthleteRef;
  deltaPoints: number;
  latestScore: number;
  sampleCount: number;
};

export type ConsistencyInput = {
  athlete: LeaderboardAthleteRef;
  completedSessions: number;
  windowDays: number;
};

export type LeaderboardRow = {
  rank: number;
  athleteProfileId: string;
  displayLabel: string;
  valueLabel: string;
  valueNumeric: number;
  verification: LiftVerificationTier | null;
  verificationLabel: string | null;
  meta: string | null;
  countryCode: string | null;
  sport: string | null;
  bodyweightClassMaxKg: number | null;
};

export type LeaderboardBoard = {
  category: LeaderboardCategoryId;
  title: string;
  rows: LeaderboardRow[];
  emptyReason: string | null;
  filtersApplied: LeaderboardFilters;
  safetyNotes: readonly string[];
};

function displayLabel(a: LeaderboardAthleteRef): string {
  if (a.showDisplayName && a.displayName?.trim()) return a.displayName.trim();
  return a.anonymousLabel;
}

function passesFilters(
  a: LeaderboardAthleteRef,
  filters: LeaderboardFilters,
): boolean {
  if (
    filters.countryCode &&
    a.countryCode?.toUpperCase() !== filters.countryCode.toUpperCase()
  ) {
    return false;
  }
  if (filters.sport && a.sport !== filters.sport) return false;
  if (
    filters.bodyweightClassMaxKg != null &&
    (a.bodyweightClassMaxKg == null ||
      Math.abs(a.bodyweightClassMaxKg - filters.bodyweightClassMaxKg) > 0.51)
  ) {
    return false;
  }
  return true;
}

function assignRanks(
  sorted: Array<Omit<LeaderboardRow, "rank">>,
): LeaderboardRow[] {
  const rows: LeaderboardRow[] = [];
  let rank = 0;
  let lastValue: number | null = null;
  let lastVer: number | null = null;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i]!;
    const ver = item.verification
      ? verificationRank(item.verification)
      : 0;
    if (
      lastValue == null ||
      item.valueNumeric !== lastValue ||
      ver !== lastVer
    ) {
      rank = i + 1;
      lastValue = item.valueNumeric;
      lastVer = ver;
    }
    rows.push({ ...item, rank });
  }
  return rows;
}

/**
 * Rank best lifts. Equal loads: higher verification ranks above lower.
 * Never fabricates athletes.
 */
export function buildVerifiedLiftsBoard(
  entries: LiftBoardEntryInput[],
  filters: LeaderboardFilters,
  safetyNotes: readonly string[],
): LeaderboardBoard {
  const filtered = entries.filter((e) => {
    if (!passesFilters(e.athlete, filters)) return false;
    if (filters.verification && e.verification !== filters.verification) {
      return false;
    }
    // Singles preferred for "verified lifts"
    return e.reps == null || e.reps === 1;
  });

  // Best per athlete
  const best = new Map<string, LiftBoardEntryInput>();
  for (const e of filtered) {
    const prev = best.get(e.athlete.athleteProfileId);
    if (!prev) {
      best.set(e.athlete.athleteProfileId, e);
      continue;
    }
    if (e.loadKg > prev.loadKg) {
      best.set(e.athlete.athleteProfileId, e);
    } else if (
      e.loadKg === prev.loadKg &&
      verificationRank(e.verification) > verificationRank(prev.verification)
    ) {
      best.set(e.athlete.athleteProfileId, e);
    }
  }

  const sorted = [...best.values()].sort((a, b) => {
    if (b.loadKg !== a.loadKg) return b.loadKg - a.loadKg;
    return verificationRank(b.verification) - verificationRank(a.verification);
  });

  const rows = assignRanks(
    sorted.map((e) => ({
      athleteProfileId: e.athlete.athleteProfileId,
      displayLabel: displayLabel(e.athlete),
      valueLabel: `${e.loadKg} kg · ${e.liftLabel}`,
      valueNumeric: e.loadKg,
      verification: e.verification,
      verificationLabel: e.verification,
      meta: null,
      countryCode: e.athlete.countryCode,
      sport: e.athlete.sport,
      bodyweightClassMaxKg: e.athlete.bodyweightClassMaxKg,
    })),
  ).map((r) => ({
    ...r,
    verificationLabel:
      r.verification === "competition_verified"
        ? "Competition verified"
        : r.verification === "video_verified"
          ? "Video verified"
          : "Self-reported",
  }));

  return {
    category: "verified_lifts",
    title: "Verified lifts",
    rows,
    emptyReason:
      rows.length === 0
        ? "No opted-in athletes match these filters yet — rankings are never invented."
        : null,
    filtersApplied: filters,
    safetyNotes,
  };
}

export function buildRepPrsBoard(
  entries: LiftBoardEntryInput[],
  filters: LeaderboardFilters,
  safetyNotes: readonly string[],
): LeaderboardBoard {
  const filtered = entries.filter((e) => {
    if (!passesFilters(e.athlete, filters)) return false;
    if (filters.verification && e.verification !== filters.verification) {
      return false;
    }
    return e.reps != null && e.reps >= 2;
  });

  const best = new Map<string, LiftBoardEntryInput & { volume: number }>();
  for (const e of filtered) {
    const volume = e.loadKg * (e.reps as number);
    const prev = best.get(e.athlete.athleteProfileId);
    if (!prev || volume > prev.volume) {
      best.set(e.athlete.athleteProfileId, { ...e, volume });
    }
  }

  const sorted = [...best.values()].sort((a, b) => b.volume - a.volume);
  const rows = assignRanks(
    sorted.map((e) => ({
      athleteProfileId: e.athlete.athleteProfileId,
      displayLabel: displayLabel(e.athlete),
      valueLabel: `${e.loadKg} kg × ${e.reps}`,
      valueNumeric: e.volume,
      verification: e.verification,
      verificationLabel:
        e.verification === "competition_verified"
          ? "Competition verified"
          : e.verification === "video_verified"
            ? "Video verified"
            : "Self-reported",
      meta: e.liftLabel,
      countryCode: e.athlete.countryCode,
      sport: e.athlete.sport,
      bodyweightClassMaxKg: e.athlete.bodyweightClassMaxKg,
    })),
  );

  return {
    category: "rep_prs",
    title: "Rep PRs",
    rows,
    emptyReason:
      rows.length === 0
        ? "No opted-in multi-rep PRs match these filters yet."
        : null,
    filtersApplied: filters,
    safetyNotes,
  };
}

export function buildTechniqueImprovementBoard(
  entries: TechniqueImprovementInput[],
  filters: LeaderboardFilters,
  safetyNotes: readonly string[],
): LeaderboardBoard {
  const filtered = entries.filter(
    (e) => passesFilters(e.athlete, filters) && e.deltaPoints > 0,
  );
  const sorted = [...filtered].sort((a, b) => b.deltaPoints - a.deltaPoints);
  const rows = assignRanks(
    sorted.map((e) => ({
      athleteProfileId: e.athlete.athleteProfileId,
      displayLabel: displayLabel(e.athlete),
      valueLabel: `+${Math.round(e.deltaPoints)} pts`,
      valueNumeric: e.deltaPoints,
      verification: null,
      verificationLabel: null,
      meta: `Latest ${Math.round(e.latestScore)} · ${e.sampleCount} analyses`,
      countryCode: e.athlete.countryCode,
      sport: e.athlete.sport,
      bodyweightClassMaxKg: e.athlete.bodyweightClassMaxKg,
    })),
  );

  return {
    category: "technique_improvement",
    title: "Technique improvement",
    rows,
    emptyReason:
      rows.length === 0
        ? "No opted-in technique improvements in this window yet."
        : null,
    filtersApplied: filters,
    safetyNotes,
  };
}

export function buildConsistencyBoard(
  entries: ConsistencyInput[],
  filters: LeaderboardFilters,
  safetyNotes: readonly string[],
): LeaderboardBoard {
  const filtered = entries.filter(
    (e) => passesFilters(e.athlete, filters) && e.completedSessions > 0,
  );
  const sorted = [...filtered].sort(
    (a, b) => b.completedSessions - a.completedSessions,
  );
  const rows = assignRanks(
    sorted.map((e) => ({
      athleteProfileId: e.athlete.athleteProfileId,
      displayLabel: displayLabel(e.athlete),
      valueLabel: `${e.completedSessions} sessions`,
      valueNumeric: e.completedSessions,
      verification: null,
      verificationLabel: null,
      meta: `${e.windowDays}-day window · not a recovery rank`,
      countryCode: e.athlete.countryCode,
      sport: e.athlete.sport,
      bodyweightClassMaxKg: e.athlete.bodyweightClassMaxKg,
    })),
  );

  return {
    category: "consistency",
    title: "Consistency",
    rows,
    emptyReason:
      rows.length === 0
        ? "No opted-in consistency data matches these filters yet."
        : null,
    filtersApplied: filters,
    safetyNotes,
  };
}
