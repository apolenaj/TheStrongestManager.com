import {
  WEAK_POINT_ENGINE_VERSION,
  WEAK_POINT_HONESTY,
  WPI_LOCKOUT_STABLE_MIN,
  WPI_LOW_SESSION_COUNT_28D,
  WPI_MIN_RECOVERY_CHECKINS,
  WPI_MIN_TECHNIQUE_ANALYSES,
  WPI_PREFERRED_TECHNIQUE_ANALYSES,
  WPI_TECHNIQUE_ISSUE_MAX,
} from "@/domain/weak-point-intelligence/constants";
import type {
  WeakPointFinding,
  WeakPointIntelligenceResult,
  WeakPointSignals,
  WeakPointTechniqueSample,
} from "@/domain/weak-point-intelligence/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";

function confRank(c: ConfidenceLevel): number {
  return { none: 0, low: 1, medium: 2, high: 3 }[c];
}

function avgObserved(
  samples: WeakPointTechniqueSample[],
  componentId: string,
): { avg: number; n: number; labels: string[] } | null {
  const scores: number[] = [];
  const labels: string[] = [];
  for (const s of samples) {
    const c = s.components.find(
      (x) =>
        x.id === componentId &&
        x.status === "observed" &&
        x.score != null &&
        confRank(x.confidence) >= confRank("medium"),
    );
    if (c?.score != null) {
      scores.push(c.score);
      labels.push(`${c.label} ${c.score}/100 (${s.createdAtIso.slice(0, 10)})`);
    }
  }
  if (scores.length === 0) return null;
  return {
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    n: scores.length,
    labels,
  };
}

/**
 * Detect evidence-backed weak points.
 * Never emits muscular weakness from appearance; never invents technique metrics.
 */
export function detectWeakPoints(
  signals: WeakPointSignals,
): WeakPointIntelligenceResult {
  const findings: WeakPointFinding[] = [];
  const missingInformation: string[] = [];

  const tech = signals.techniqueSamples;
  if (tech.length < WPI_MIN_TECHNIQUE_ANALYSES) {
    missingInformation.push(
      `≥${WPI_MIN_TECHNIQUE_ANALYSES} completed technique analyses with component scores`,
    );
  }

  // —— Technical: deadlift floor position (slow off floor, stable lockout) ——
  const floorFinding = detectDeadliftFloorWeakness(tech);
  if (floorFinding) findings.push(floorFinding);

  const lockoutFinding = detectDeadliftLockoutWeakness(tech);
  if (lockoutFinding) findings.push(lockoutFinding);

  // —— Strength: stalled / thin lift logs ——
  if (signals.lifts.length === 0) {
    missingInformation.push("Logged lift metrics (squat/bench/deadlift)");
  } else if (signals.performanceTrendDirection === "down") {
    const recent = signals.lifts.slice(0, 3);
    findings.push({
      id: "strength-performance-trend-down",
      category: "strength_weakness",
      title: "Strength trend down",
      potentialWeakPoint: "Overall strength progress",
      detail:
        "Performance trend from AthleteState is down. This is a logged-signal heuristic — not a muscular diagnosis.",
      confidence: "low",
      evidence: [
        {
          label: "Performance trend",
          detail: `direction=${signals.performanceTrendDirection}`,
        },
        ...recent.map((l) => ({
          label: l.label,
          detail: `${l.valueKg} kg (${l.recordedAtIso.slice(0, 10)})`,
        })),
      ],
      recommendedValidation: [
        "Confirm recent e1RM or working-set logs on Progress.",
        "Compare best sets this block vs the previous block under similar RPE.",
      ],
      prescriptionWeakPoint: "general_strength",
      href: "/app/progress",
      missingInformation: [],
    });
  }

  // —— Muscular: ONLY from lift imbalance logs — never appearance ——
  const muscular = detectMuscularFromLogs(signals);
  if (muscular) findings.push(muscular);
  else if (!hasPairedLiftLogs(signals)) {
    missingInformation.push(
      "Paired lift logs across patterns (required before any muscular-weakness claim)",
    );
  }

  // —— Programming ——
  if (!signals.hasActiveProgram) {
    findings.push({
      id: "programming-no-active-program",
      category: "programming_weakness",
      title: "No active program",
      potentialWeakPoint: "Programming structure",
      detail:
        "No active athlete program is assigned — programming weakness here means missing structure, not a bad plan.",
      confidence: "medium",
      evidence: [
        {
          label: "Active program",
          detail: "none on file",
        },
      ],
      recommendedValidation: [
        "Assign a program template under Programs.",
        "Re-run Weak Point Intelligence after 2–3 scheduled weeks.",
      ],
      prescriptionWeakPoint: null,
      href: "/app/programs",
      missingInformation: [],
    });
  } else if (
    signals.skippedProgramSessionsLast28Days >
    signals.completedSessionsLast28Days
  ) {
    findings.push({
      id: "programming-skip-heavy",
      category: "programming_weakness",
      title: "Skipped sessions outweigh completed",
      potentialWeakPoint: "Program adherence",
      detail:
        "More program-linked skips than completions in 28 days — a programming/execution gap, not a physique claim.",
      confidence: "medium",
      evidence: [
        {
          label: "Completed (28d, program-linked)",
          detail: String(signals.completedSessionsLast28Days),
        },
        {
          label: "Skipped (28d, program-linked)",
          detail: String(signals.skippedProgramSessionsLast28Days),
        },
      ],
      recommendedValidation: [
        "Review whether session density matches schedule.",
        "Open Adaptations if load needs an explicit change.",
      ],
      prescriptionWeakPoint: null,
      href: "/app/adaptations",
      missingInformation: [],
    });
  }

  // —— Recovery ——
  if (signals.recoveryCheckInsLast7Days < WPI_MIN_RECOVERY_CHECKINS) {
    missingInformation.push(
      `≥${WPI_MIN_RECOVERY_CHECKINS} readiness check-ins in 7 days`,
    );
  } else if (
    signals.avgReadinessLast7Days != null &&
    signals.avgReadinessLast7Days < 55
  ) {
    findings.push({
      id: "recovery-low-readiness",
      category: "recovery_limitation",
      title: "Low average readiness",
      potentialWeakPoint: "Recovery capacity",
      detail:
        "Athlete-reported readiness averages below 55 across enough check-ins. This is a recovery limitation signal — not a medical diagnosis.",
      confidence: "medium",
      evidence: [
        {
          label: "Check-ins (7d)",
          detail: String(signals.recoveryCheckInsLast7Days),
        },
        {
          label: "Average readiness",
          detail: `${Math.round(signals.avgReadinessLast7Days)}/100`,
        },
        ...(signals.latestReadiness != null
          ? [
              {
                label: "Latest readiness",
                detail: `${signals.latestReadiness}/100`,
              },
            ]
          : []),
        ...(signals.loadSpikeFlagged
          ? [
              {
                label: "Load spike",
                detail: "FatigueTrend flagged volume spike vs baseline",
              },
            ]
          : []),
      ],
      recommendedValidation: [
        "Continue daily readiness logs for another week.",
        "Compare readiness on training vs rest days.",
      ],
      prescriptionWeakPoint: null,
      href: "/app/recovery",
      missingInformation: [],
    });
  }

  // —— Consistency ——
  if (
    signals.completedSessionsLast28Days < WPI_LOW_SESSION_COUNT_28D &&
    signals.completedSessionsLast28Days +
      signals.skippedProgramSessionsLast28Days >
      0
  ) {
    findings.push({
      id: "consistency-low-completions",
      category: "consistency_issue",
      title: "Low session completion",
      potentialWeakPoint: "Training consistency",
      detail: `Only ${signals.completedSessionsLast28Days} completed session(s) in 28 days are logged.`,
      confidence: "medium",
      evidence: [
        {
          label: "Completed sessions (28d)",
          detail: String(signals.completedSessionsLast28Days),
        },
      ],
      recommendedValidation: [
        "Log completed sessions from Today or Training.",
        "Check whether the calendar matches available days/week.",
      ],
      prescriptionWeakPoint: null,
      href: "/app/today",
      missingInformation: [],
    });
  } else if (signals.completedSessionsLast28Days === 0) {
    missingInformation.push("Completed training sessions in the last 28 days");
  }

  // Drop anything without evidence (hard rule)
  const valid = findings.filter((f) => f.evidence.length > 0);

  return {
    engineVersion: WEAK_POINT_ENGINE_VERSION,
    findings: valid,
    honesty: WEAK_POINT_HONESTY,
    missingInformation: [...new Set(missingInformation)],
    emptyReason:
      valid.length === 0
        ? "No evidence-backed weak points yet — log technique, lifts, recovery, or sessions so findings can cite real signals."
        : null,
  };
}

function detectDeadliftFloorWeakness(
  samples: WeakPointTechniqueSample[],
): WeakPointFinding | null {
  if (samples.length < WPI_MIN_TECHNIQUE_ANALYSES) return null;

  const start = avgObserved(samples, "start_position");
  const hip = avgObserved(samples, "hip_rise_pattern");
  const lockout = avgObserved(samples, "lockout");

  const floorWeak =
    (start != null && start.avg <= WPI_TECHNIQUE_ISSUE_MAX) ||
    (hip != null && hip.avg <= WPI_TECHNIQUE_ISSUE_MAX);
  const lockoutStable =
    lockout != null && lockout.avg >= WPI_LOCKOUT_STABLE_MIN;

  if (!floorWeak || !lockoutStable) return null;

  const n = Math.max(start?.n ?? 0, hip?.n ?? 0, lockout?.n ?? 0);
  const evidence = [
    {
      label: "Technique analyses",
      detail: `${samples.length} recent completed analysis/analyses on file`,
    },
  ];
  if (start) {
    evidence.push({
      label: "Start / floor position",
      detail: `Avg start_position ${Math.round(start.avg)}/100 across ${start.n} observed sample(s) — proxy for difficulty leaving the floor (not bar-speed telemetry).`,
    });
  }
  if (hip) {
    evidence.push({
      label: "Hip-rise pattern",
      detail: `Avg hip_rise_pattern ${Math.round(hip.avg)}/100 — early/inconsistent hip rise often accompanies a slow first pull in film.`,
    });
  }
  if (lockout) {
    evidence.push({
      label: "Lockout",
      detail: `Avg lockout ${Math.round(lockout.avg)}/100 — relatively stable vs floor scores.`,
    });
  }

  const confidence: ConfidenceLevel =
    samples.length >= WPI_PREFERRED_TECHNIQUE_ANALYSES && n >= 2
      ? "medium"
      : "low";

  return {
    id: "technical-deadlift-floor",
    category: "technical_weakness",
    title: "Deadlift floor position",
    potentialWeakPoint: "Deadlift floor position",
    detail:
      "Technique components near the floor are weaker than lockout on recent analyses. This is an image-plane technique finding — not a claim about muscle size from appearance.",
    confidence,
    evidence,
    recommendedValidation: [
      "Compare paused deadlift performance (pause just off the floor) vs conventional working sets.",
      "Re-film a side-view first pull and re-run technique analysis.",
      "Optionally open Exercise picks with weak point “Improve deadlift off the floor”.",
    ],
    prescriptionWeakPoint: "deadlift_off_floor",
    href: "/app/exercise-prescription?weakPoint=deadlift_off_floor",
    missingInformation:
      samples.length < WPI_PREFERRED_TECHNIQUE_ANALYSES
        ? [`${WPI_PREFERRED_TECHNIQUE_ANALYSES} recent analyses preferred for stronger confidence`]
        : [],
  };
}

function detectDeadliftLockoutWeakness(
  samples: WeakPointTechniqueSample[],
): WeakPointFinding | null {
  if (samples.length < WPI_MIN_TECHNIQUE_ANALYSES) return null;
  const lockout = avgObserved(samples, "lockout");
  const start = avgObserved(samples, "start_position");
  if (!lockout || lockout.avg > WPI_TECHNIQUE_ISSUE_MAX) return null;
  // Prefer contrast: lockout weak while start is OK
  if (start && start.avg < WPI_LOCKOUT_STABLE_MIN - 10) {
    // both weak — still report lockout but lower confidence
  }

  return {
    id: "technical-deadlift-lockout",
    category: "technical_weakness",
    title: "Deadlift lockout",
    potentialWeakPoint: "Deadlift lockout",
    detail:
      "Lockout component scores are low on recent analyses. Hip-extension accessories may help — validate before assuming a muscular deficit.",
    confidence: samples.length >= WPI_PREFERRED_TECHNIQUE_ANALYSES ? "medium" : "low",
    evidence: [
      {
        label: "Technique analyses",
        detail: `${samples.length} recent analyses`,
      },
      {
        label: "Lockout",
        detail: `Avg lockout ${Math.round(lockout.avg)}/100 across ${lockout.n} observed sample(s)`,
      },
      ...lockout.labels.slice(0, 3).map((l) => ({
        label: "Sample",
        detail: l,
      })),
    ],
    recommendedValidation: [
      "Compare block-pull or rack-pull lockout strength vs floor pulls at similar RPE.",
      "Re-film lockout from the side and re-analyze.",
    ],
    prescriptionWeakPoint: "deadlift_lockout",
    href: "/app/exercise-prescription?weakPoint=deadlift_lockout",
    missingInformation: [],
  };
}

function bestLiftsByKey(signals: WeakPointSignals): Map<string, number> {
  const byKey = new Map<string, number>();
  for (const lift of signals.lifts) {
    const prev = byKey.get(lift.metricKey);
    if (prev == null || lift.valueKg > prev) byKey.set(lift.metricKey, lift.valueKg);
  }
  return byKey;
}

function hasPairedLiftLogs(signals: WeakPointSignals): boolean {
  const byKey = bestLiftsByKey(signals);
  const squat = byKey.get("lift_squat");
  const bench = byKey.get("lift_bench");
  const deadlift = byKey.get("lift_deadlift");
  return (
    (squat != null && deadlift != null) || (squat != null && bench != null)
  );
}

/**
 * Muscular weakness ONLY from lift logs (relative lift levels).
 * Never from photos, bodyweight alone, or “looks weak.”
 */
function detectMuscularFromLogs(
  signals: WeakPointSignals,
): WeakPointFinding | null {
  const byKey = bestLiftsByKey(signals);

  const squat = byKey.get("lift_squat");
  const bench = byKey.get("lift_bench");
  const deadlift = byKey.get("lift_deadlift");

  // Classic log-based imbalance: deadlift far behind squat (same units, same athlete logs)
  if (squat != null && deadlift != null && squat >= 100 && deadlift < squat * 0.85) {
    return {
      id: "muscular-hinge-lag-logs",
      category: "muscular_weakness",
      title: "Hinge strength lag (logged)",
      potentialWeakPoint: "Posterior-chain / hinge strength (log-based)",
      detail:
        "Deadlift on file is materially below squat on file. This is a lift-log imbalance — not a visual muscular diagnosis.",
      confidence: "low",
      evidence: [
        {
          label: "Best squat on file",
          detail: `${squat} kg`,
        },
        {
          label: "Best deadlift on file",
          detail: `${deadlift} kg`,
        },
        {
          label: "Ratio",
          detail: `deadlift/squat = ${Math.round((deadlift / squat) * 100)}% (threshold < 85%)`,
        },
      ],
      recommendedValidation: [
        "Confirm both lifts are recent and similarly tested (not one stale max).",
        "Compare Romanian deadlift working sets vs conventional deadlift at similar RPE.",
      ],
      prescriptionWeakPoint: "posterior_chain",
      href: "/app/exercise-prescription?weakPoint=posterior_chain",
      missingInformation: [],
    };
  }

  if (bench != null && squat != null && squat >= 100 && bench < squat * 0.55) {
    return {
      id: "muscular-press-lag-logs",
      category: "muscular_weakness",
      title: "Press strength lag (logged)",
      potentialWeakPoint: "Pressing strength (log-based)",
      detail:
        "Bench on file is low relative to squat on file. Log-ratio heuristic only — not appearance-based.",
      confidence: "low",
      evidence: [
        { label: "Best squat on file", detail: `${squat} kg` },
        { label: "Best bench on file", detail: `${bench} kg` },
        {
          label: "Ratio",
          detail: `bench/squat = ${Math.round((bench / squat) * 100)}% (threshold < 55%)`,
        },
      ],
      recommendedValidation: [
        "Retest bench under similar conditions to the squat log.",
        "Check upper-back volume before assuming a pure pressing-muscle deficit.",
      ],
      prescriptionWeakPoint: "bench_press",
      href: "/app/exercise-prescription?weakPoint=bench_press",
      missingInformation: [],
    };
  }

  return null;
}
