/** Display helpers for commercial program catalog UI. */

import { formatLocalizedMoney } from "@/domain/money/format-localized";

/**
 * Format a program price for the active locale.
 * Canonical amounts stay in catalog currency (usually GBP pence);
 * `cs` displays approximate CZK list prices.
 */
export function formatProgramPriceGbp(
  pence: number,
  currency = "gbp",
  locale: string = "en",
): string {
  return formatLocalizedMoney(pence, currency, locale);
}

const RECOVERY_LABELS: Record<string, Record<string, string>> = {
  en: {
    low: "Low recovery demand",
    moderate: "Moderate recovery demand",
    high: "High recovery demand",
  },
  cs: {
    low: "Nízká náročnost regenerace",
    moderate: "Střední náročnost regenerace",
    high: "Vysoká náročnost regenerace",
  },
};

const SCHEDULE_LABELS: Record<string, Record<string, string>> = {
  en: {
    "3day": "3 days / week",
    "4day": "4 days / week",
    "5day": "5 days / week",
    "6day": "6 days / week",
  },
  cs: {
    "3day": "3 dny / týden",
    "4day": "4 dny / týden",
    "5day": "5 dnů / týden",
    "6day": "6 dnů / týden",
  },
};

const GOAL_LABELS: Record<string, Record<string, string>> = {
  en: {
    strength: "Strength",
    powerlifting: "Powerlifting",
    hypertrophy: "Hypertrophy",
    general_strength: "General strength",
    competition_prep: "Competition prep",
  },
  cs: {
    strength: "Síla",
    powerlifting: "Powerlifting",
    hypertrophy: "Hypertrofie",
    general_strength: "Obecná síla",
    competition_prep: "Příprava na závody",
  },
};

const METHOD_LABELS: Record<string, Record<string, string>> = {
  en: {
    "linear-periodization": "Linear periodization",
    "daily-undulating-periodization": "DUP",
    "block-periodization": "Block periodization",
    conjugate: "Conjugate",
    "high-frequency-training": "High-frequency training",
  },
  cs: {
    "linear-periodization": "Lineární periodizace",
    "daily-undulating-periodization": "DUP",
    "block-periodization": "Bloková periodizace",
    conjugate: "Conjugate",
    "high-frequency-training": "Vysokofrekvenční trénink",
  },
};

function pickLocaleMap(
  maps: Record<string, Record<string, string>>,
  locale: string,
): Record<string, string> {
  return maps[locale] ?? maps.en;
}

export function formatRecoveryDemand(
  value: string,
  locale: string = "en",
): string {
  return pickLocaleMap(RECOVERY_LABELS, locale)[value] ?? value;
}

export function formatScheduleLabel(
  value: string,
  locale: string = "en",
): string {
  return pickLocaleMap(SCHEDULE_LABELS, locale)[value] ?? value;
}

export function formatGoalLabel(value: string, locale: string = "en"): string {
  return pickLocaleMap(GOAL_LABELS, locale)[value] ?? value;
}

export function formatMethodLabel(
  methodId: string | null,
  locale: string = "en",
): string {
  if (!methodId) {
    return locale === "cs" ? "Více metod" : "Multi-method";
  }
  return pickLocaleMap(METHOD_LABELS, locale)[methodId] ?? methodId;
}
