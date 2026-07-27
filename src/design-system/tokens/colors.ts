/**
 * Color tokens — Phase 1 premium redesign.
 * Signal Lime is reserved for primary CTAs, active states, and highlights only.
 */
export const colors = {
  background: "#070807",
  surface: "#121412",
  surfaceElevated: "#181B18",
  surfaceOverlay: "#1C201C",
  foreground: "#F3F1EA",
  foregroundMuted: "#A6AAA5",
  foregroundSubtle: "#8B908A",
  border: "rgba(255, 255, 255, 0.10)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  accent: "#B7FF2A",
  accentHover: "#C8FF52",
  accentMuted: "rgba(183, 255, 42, 0.14)",
  accentForeground: "#070807",
  focusRing: "#B7FF2A",
  /** Score / performance states */
  score: {
    excellent: "#22c55e",
    excellentMuted: "rgba(34, 197, 94, 0.14)",
    good: "#84cc16",
    goodMuted: "rgba(132, 204, 22, 0.14)",
    needsAttention: "#f59e0b",
    needsAttentionMuted: "rgba(245, 158, 11, 0.14)",
    critical: "#ef4444",
    criticalMuted: "rgba(239, 68, 68, 0.14)",
  },
  /** Semantic alerts (map onto score where appropriate) */
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#38bdf8",
} as const;

export type ScoreLevel = "excellent" | "good" | "needsAttention" | "critical";

export const scoreLabels: Record<ScoreLevel, string> = {
  excellent: "Excellent",
  good: "Good",
  needsAttention: "Needs attention",
  critical: "Critical",
};

export function scoreLevelFromValue(value: number): ScoreLevel {
  if (value >= 85) return "excellent";
  if (value >= 70) return "good";
  if (value >= 50) return "needsAttention";
  return "critical";
}
