/**
 * Operational capacity — gates turnaround promises.
 * Never invent SLA days without published capacity.
 */

export type HumanAnalysisCapacitySnapshot = {
  /** True only when ops explicitly opens intake. */
  intakeOpen: boolean;
  /**
   * Estimated business days — null unless published.
   * UI must not invent a number when null.
   */
  estimatedTurnaroundBusinessDays: number | null;
  /** Athlete-facing capacity line (never a fake SLA). */
  athleteMessage: string;
  expertMessage: string;
};

function envBool(key: string, fallback = false): boolean {
  const raw = process.env[key];
  if (raw == null || raw === "") return fallback;
  return raw === "true";
}

function envPositiveInt(key: string): number | null {
  const raw = process.env[key]?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Capacity is env-published ops config — not marketing copy.
 * HUMAN_ANALYSIS_INTAKE_OPEN=true opens purchase→queue intake messaging.
 * HUMAN_ANALYSIS_TURNAROUND_DAYS only shown when intake is open AND days > 0.
 */
export function getHumanAnalysisCapacity(): HumanAnalysisCapacitySnapshot {
  const intakeOpen = envBool("HUMAN_ANALYSIS_INTAKE_OPEN", false);
  const days = intakeOpen
    ? envPositiveInt("HUMAN_ANALYSIS_TURNAROUND_DAYS")
    : null;

  if (!intakeOpen) {
    return {
      intakeOpen: false,
      estimatedTurnaroundBusinessDays: null,
      athleteMessage:
        "Expert review intake capacity is not published. You can still track order status — no turnaround time is promised.",
      expertMessage:
        "Intake is closed or unpublished. Do not quote turnaround times to athletes.",
    };
  }

  if (days == null) {
    return {
      intakeOpen: true,
      estimatedTurnaroundBusinessDays: null,
      athleteMessage:
        "Expert review intake is open. Status updates appear as your order moves — no specific turnaround time is published yet.",
      expertMessage:
        "Intake is open but turnaround days are unpublished — do not promise a timeline.",
    };
  }

  return {
    intakeOpen: true,
    estimatedTurnaroundBusinessDays: days,
    athleteMessage: `Expert review intake is open. Typical turnaround is about ${days} business day${days === 1 ? "" : "s"} after your order reaches the queue — capacity-dependent, not a guarantee.`,
    expertMessage: `Published capacity target ≈ ${days} business days after queue. Treat as a target, not a hard SLA.`,
  };
}

/**
 * Hard rule: never emit a turnaround promise string unless capacity publishes days.
 */
export function formatTurnaroundPromise(
  capacity: HumanAnalysisCapacitySnapshot,
): string | null {
  if (
    !capacity.intakeOpen ||
    capacity.estimatedTurnaroundBusinessDays == null
  ) {
    return null;
  }
  const d = capacity.estimatedTurnaroundBusinessDays;
  return `About ${d} business day${d === 1 ? "" : "s"} after queuing (capacity target — not guaranteed)`;
}
