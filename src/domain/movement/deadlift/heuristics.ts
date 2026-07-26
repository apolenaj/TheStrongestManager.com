import type {
  ObservableMetric,
  TechniqueHeuristic,
} from "@/domain/movement/types";

/**
 * Technique heuristics from observable metrics.
 * Observational only — never joint force, injury risk, or medical claims.
 */
export function buildDeadliftHeuristics(
  metrics: ObservableMetric[],
): TechniqueHeuristic[] {
  const byKey = new Map(metrics.map((m) => [m.key, m]));
  const heuristics: TechniqueHeuristic[] = [];

  const consistency = byKey.get("torso_angle_consistency_deg");
  if (
    consistency &&
    consistency.value != null &&
    consistency.confidence !== "none" &&
    consistency.value > 12
  ) {
    heuristics.push({
      id: "torso_angle_variable",
      label: "Variable torso angle (image plane)",
      observation: `Torso angle stddev was ${consistency.value}° during the pull region. This is an image-plane consistency observation only — not a spine-load or injury assessment.`,
      confidence: consistency.confidence,
      confidenceScore: consistency.confidenceScore * 0.9,
      relatedMetricKeys: [consistency.key],
    });
  }

  const lockout = byKey.get("lockout_hip_shoulder_dy");
  if (
    lockout &&
    lockout.value != null &&
    lockout.confidence !== "none" &&
    lockout.value > 0.08
  ) {
    heuristics.push({
      id: "lockout_not_stacked_in_frame",
      label: "Lockout not stacked in frame",
      observation: `At lockout, |hip.y − shoulder.y| averaged ${lockout.value} (normalized). Suggests shoulders and hips were not vertically close in the image — not a verified incomplete lockout in 3D.`,
      confidence: lockout.confidence,
      confidenceScore: lockout.confidenceScore * 0.85,
      relatedMetricKeys: [lockout.key],
    });
  }

  const symmetry = byKey.get("left_right_hip_symmetry");
  if (
    symmetry &&
    symmetry.value != null &&
    symmetry.confidence !== "none" &&
    symmetry.confidence !== "low" &&
    symmetry.value > 0.06
  ) {
    heuristics.push({
      id: "hip_asymmetry_in_frame",
      label: "Hip asymmetry in frame",
      observation: `Left/right hip offset from midline averaged ${symmetry.value}. Meaningful mainly on front/rear views; not a diagnosis of imbalance or injury risk.`,
      confidence: symmetry.confidence,
      confidenceScore: symmetry.confidenceScore * 0.8,
      relatedMetricKeys: [symmetry.key],
    });
  }

  return heuristics;
}
