/**
 * Color tokens — premium strength-performance technology.
 * Gold accent used selectively. Green/red reserved for performance/alerts.
 */
export const colors = {
  background: "#0a0a0b",
  surface: "#111114",
  surfaceElevated: "#18181c",
  surfaceOverlay: "#1c1c22",
  foreground: "#f5f5f4",
  foregroundMuted: "#a1a1aa",
  foregroundSubtle: "#71717a",
  border: "#27272a",
  borderStrong: "#3f3f46",
  accent: "#d4a017",
  accentHover: "#e0b020",
  accentMuted: "rgba(212, 160, 23, 0.14)",
  accentForeground: "#0a0a0b",
  focusRing: "#d4a017",
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
