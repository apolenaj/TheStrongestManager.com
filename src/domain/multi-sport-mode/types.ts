import type { MultiSportFocusId } from "@/domain/multi-sport-mode/constants";

export type MultiSportLoggedPr = {
  metricKey: string;
  value: number;
  unit: string | null;
  recordedAt: Date | null;
};

export type MultiSportGoalSignal = {
  title: string;
  category: string;
  priority: number;
};

export type MultiSportModeSignals = {
  preferredSports: string[];
  primaryDiscipline: string | null;
  /** Active goals — mixed categories allowed. */
  goals: MultiSportGoalSignal[];
  loggedPrs: MultiSportLoggedPr[];
};

export type MultiSportFocusCard = {
  id: MultiSportFocusId;
  label: string;
  href: string;
  prNamespace: "lift" | "sm" | "wl" | "none";
  prCount: number;
};

export type MultiSportPrItem = {
  sportId: MultiSportFocusId;
  metricKey: string;
  label: string;
  value: number;
  unit: string;
  recordedAtIso: string | null;
};

export type MultiSportPrGroup = {
  sportId: MultiSportFocusId;
  sportLabel: string;
  href: string;
  namespace: "lift" | "sm" | "wl" | "none";
  prs: MultiSportPrItem[];
  emptyNote: string | null;
};

export type MultiSportGoalCard = {
  title: string;
  category: string;
  priority: number;
};

export type MultiSportModePayload = {
  engineVersion: string;
  /** True when two or more focuses are selected. */
  isMultiSport: boolean;
  focuses: MultiSportFocusCard[];
  leadDiscipline: string | null;
  prGroups: MultiSportPrGroup[];
  goals: MultiSportGoalCard[];
  mixedGoalsAllowed: true;
  singleProfile: true;
  honesty: readonly string[];
};
