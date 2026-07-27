/** Display helpers for commercial program catalog UI. */

export function formatProgramPriceGbp(pence: number, currency = "gbp"): string {
  if (pence <= 0) return "Free";
  if (currency.toLowerCase() !== "gbp") {
    return `${(pence / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pence / 100);
}

export function formatRecoveryDemand(value: string): string {
  const map: Record<string, string> = {
    low: "Low recovery demand",
    moderate: "Moderate recovery demand",
    high: "High recovery demand",
  };
  return map[value] ?? value;
}

export function formatScheduleLabel(value: string): string {
  const map: Record<string, string> = {
    "3day": "3 days / week",
    "4day": "4 days / week",
    "5day": "5 days / week",
    "6day": "6 days / week",
  };
  return map[value] ?? value;
}

export function formatGoalLabel(value: string): string {
  const map: Record<string, string> = {
    strength: "Strength",
    powerlifting: "Powerlifting",
    hypertrophy: "Hypertrophy",
    general_strength: "General strength",
    competition_prep: "Competition prep",
  };
  return map[value] ?? value;
}

export function formatMethodLabel(methodId: string | null): string {
  if (!methodId) return "Multi-method";
  const map: Record<string, string> = {
    "linear-periodization": "Linear periodization",
    "daily-undulating-periodization": "DUP",
    "block-periodization": "Block periodization",
    conjugate: "Conjugate",
    "high-frequency-training": "High-frequency training",
  };
  return map[methodId] ?? methodId;
}
