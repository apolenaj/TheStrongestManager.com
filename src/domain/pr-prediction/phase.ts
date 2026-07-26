import type { TrainingPhaseHint } from "@/domain/pr-prediction/types";

/**
 * Infer a coarse training-phase hint from program / block naming.
 * Unknown when nothing matches — never invent peaking.
 */
export function inferTrainingPhase(
  programOrBlockName: string | null | undefined,
): TrainingPhaseHint {
  if (!programOrBlockName?.trim()) return "unknown";
  const n = programOrBlockName.toLowerCase();

  if (/\bdeload\b|\bunload\b|\brecovery.?week\b/.test(n)) return "deload";
  if (/\bpeak\b|\btaper\b|\bmeet\b|\bcomp(etition)?\b/.test(n)) return "peaking";
  if (/\bintensif|\bstrength.?block\b|\bintensity\b/.test(n)) {
    return "intensification";
  }
  if (/\baccumul|\bhypertroph|\bvolume.?block\b|\bbase.?build\b/.test(n)) {
    return "accumulation";
  }
  return "unknown";
}

export function mapTrendDirection(
  direction: "up" | "down" | "flat" | "unknown" | null | undefined,
): import("@/domain/pr-prediction/types").PerformanceTrendHint {
  if (direction === "up") return "improving";
  if (direction === "down") return "declining";
  if (direction === "flat") return "stable";
  return "unknown";
}
