/**
 * Accessibility 2.0 — advanced WCAG audit architecture (Prompt 151).
 * Technique / performance scores must never rely on color alone.
 */

export const ACCESSIBILITY_ENGINE_VERSION = "accessibility.v2" as const;

export const ACCESSIBILITY_HONESTY = [
  "Accessibility 2.0 audits keyboard, screen readers, charts, video, forms, modals, focus traps, and color perception.",
  "Technique and performance scores always expose a text label (and symbol) — color is reinforcement, never the only cue.",
  "Native dialogs and drawers trap focus while open and restore it on close; charts expose a data table alternative.",
] as const;

export type A11ySurfaceId =
  | "keyboard"
  | "screen_reader"
  | "charts"
  | "video_analysis"
  | "forms"
  | "modals"
  | "focus_traps"
  | "color_blindness"
  | "technique_scores";

export type A11yAuditStatus = "pass" | "partial" | "fail" | "not_applicable";

export type A11yAuditCriterion = {
  id: string;
  surface: A11ySurfaceId;
  /** WCAG 2.2 oriented short reference (informative). */
  wcagRef: string;
  title: string;
  requirement: string;
  status: A11yAuditStatus;
  evidence: string;
};

export type ScoreLevel = "excellent" | "good" | "needsAttention" | "critical";

/** Text labels — required for color-blind safety. */
export const SCORE_TEXT_LABELS: Record<ScoreLevel, string> = {
  excellent: "Excellent",
  good: "Good",
  needsAttention: "Needs attention",
  critical: "Critical",
};

/**
 * Non-color symbols for score levels (color blindness).
 * Distinct shapes so hue is never the sole differentiator.
 */
export const SCORE_SYMBOLS: Record<ScoreLevel, string> = {
  excellent: "●",
  good: "◆",
  needsAttention: "▲",
  critical: "■",
};

export function formatScoreAnnouncement(
  value: number,
  level: ScoreLevel,
  label?: string,
): string {
  const rounded = Math.round(value);
  const text = SCORE_TEXT_LABELS[level];
  const symbol = SCORE_SYMBOLS[level];
  if (label) return `${label}: ${rounded}, ${text} ${symbol}`;
  return `${rounded}, ${text} ${symbol}`;
}

export function scorePresentation(level: ScoreLevel): {
  text: string;
  symbol: string;
  announcement: string;
} {
  return {
    text: SCORE_TEXT_LABELS[level],
    symbol: SCORE_SYMBOLS[level],
    announcement: `${SCORE_TEXT_LABELS[level]} ${SCORE_SYMBOLS[level]}`,
  };
}

/** Focusable selector used by focus-trap helpers. */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
