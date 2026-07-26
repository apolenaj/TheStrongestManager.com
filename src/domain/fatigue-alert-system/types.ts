import type {
  FatigueAlertLevel,
  FatigueAlertSignalKey,
} from "@/domain/fatigue-alert-system/constants";

export type FatigueAlertSignalEvaluation = {
  key: FatigueAlertSignalKey;
  label: string;
  fired: boolean;
  available: boolean;
  detail: string;
};

export type FatigueAlertAnalysis = {
  engineVersion: string;
  windowLabel: string;
  level: FatigueAlertLevel;
  levelLabel: string;
  title: string;
  summary: string;
  explanation: string[];
  signals: FatigueAlertSignalEvaluation[];
  signalsFired: number;
  signalsAvailable: number;
  sessionCount: number;
  /** True when enough data to show a level other than thin-data Normal. */
  publishable: boolean;
  suppressedReason: string | null;
  confidence: "none" | "low" | "medium" | "high";
  honesty: readonly string[];
};
