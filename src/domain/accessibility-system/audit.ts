import {
  ACCESSIBILITY_ENGINE_VERSION,
  ACCESSIBILITY_HONESTY,
  type A11yAuditCriterion,
} from "@/domain/accessibility-system/constants";

/**
 * Static WCAG-oriented audit registry for Accessibility 2.0.
 * Status reflects shipped product posture after Prompt 151 fixes.
 */
export const A11Y_AUDIT_CRITERIA: readonly A11yAuditCriterion[] = [
  {
    id: "kb.skip_link",
    surface: "keyboard",
    wcagRef: "2.4.1",
    title: "Skip to content",
    requirement: "Keyboard users can bypass repeated chrome.",
    status: "pass",
    evidence: "Root layout skip link → #main-content",
  },
  {
    id: "kb.focus_visible",
    surface: "keyboard",
    wcagRef: "2.4.7",
    title: "Visible focus",
    requirement: "Interactive controls show a visible focus ring.",
    status: "pass",
    evidence: "Design-system controls use focus-visible outlines",
  },
  {
    id: "kb.tabs",
    surface: "keyboard",
    wcagRef: "2.1.1",
    title: "Tabs keyboard",
    requirement: "Tab widgets expose tab/tablist/tabpanel roles.",
    status: "pass",
    evidence: "TabsTrigger / TabsContent ARIA roles",
  },
  {
    id: "sr.live_regions",
    surface: "screen_reader",
    wcagRef: "4.1.3",
    title: "Status messages",
    requirement: "Errors and status updates are announced.",
    status: "pass",
    evidence: "FieldError / Alert role=alert; chart tip role=status",
  },
  {
    id: "sr.landmarks",
    surface: "screen_reader",
    wcagRef: "1.3.1",
    title: "Landmarks",
    requirement: "Primary content is in a main landmark.",
    status: "pass",
    evidence: "AppShell / marketing main#main-content",
  },
  {
    id: "chart.sr_table",
    surface: "charts",
    wcagRef: "1.1.1",
    title: "Chart text alternative",
    requirement: "Charts expose a readable data table for assistive tech.",
    status: "pass",
    evidence: "TrendChart sr-only data table + aria-label on SVG",
  },
  {
    id: "chart.keyboard_points",
    surface: "charts",
    wcagRef: "2.1.1",
    title: "Chart point keyboard",
    requirement: "Data points are focusable; arrow keys move between them.",
    status: "pass",
    evidence: "TrendChart tabIndex + ArrowLeft/ArrowRight",
  },
  {
    id: "video.controls",
    surface: "video_analysis",
    wcagRef: "1.2.1",
    title: "Video controls",
    requirement: "Technique video uses native controls; phases are labeled buttons.",
    status: "pass",
    evidence: "TechniqueVideoTimeline controls + phase aria-labels",
  },
  {
    id: "video.timeline_text",
    surface: "video_analysis",
    wcagRef: "1.3.3",
    title: "Timeline not color-only",
    requirement: "Phase selection uses text labels, not color alone.",
    status: "pass",
    evidence: "Labeled phase buttons beside scrubber",
  },
  {
    id: "form.labels",
    surface: "forms",
    wcagRef: "1.3.1",
    title: "Form labels",
    requirement: "Inputs are associated with visible labels; errors use aria-describedby.",
    status: "pass",
    evidence: "FormField Label htmlFor + describedby wiring",
  },
  {
    id: "form.errors",
    surface: "forms",
    wcagRef: "3.3.1",
    title: "Error identification",
    requirement: "Field errors are announced as alerts.",
    status: "pass",
    evidence: "FieldError role=alert",
  },
  {
    id: "modal.dialog",
    surface: "modals",
    wcagRef: "4.1.2",
    title: "Modal semantics",
    requirement: "Modals expose dialog name and description.",
    status: "pass",
    evidence: "Modal uses <dialog> + aria-labelledby/describedby",
  },
  {
    id: "modal.focus_trap",
    surface: "modals",
    wcagRef: "2.4.3",
    title: "Modal focus trap",
    requirement: "Tab cycles inside open modal; Escape closes; focus restores.",
    status: "pass",
    evidence: "useFocusTrap on Modal + Drawer",
  },
  {
    id: "drawer.focus_trap",
    surface: "focus_traps",
    wcagRef: "2.4.3",
    title: "Drawer focus trap",
    requirement: "Drawers trap focus while open.",
    status: "pass",
    evidence: "Drawer + useFocusTrap",
  },
  {
    id: "color.score_text",
    surface: "color_blindness",
    wcagRef: "1.4.1",
    title: "Score not color-only",
    requirement: "Score states include text + symbol; color is secondary.",
    status: "pass",
    evidence: "ScoreRing / scorePresentation symbols ●◆▲■",
  },
  {
    id: "technique.score_dual_cue",
    surface: "technique_scores",
    wcagRef: "1.4.1",
    title: "Technique scores dual cue",
    requirement: "Technique scores must not rely only on color.",
    status: "pass",
    evidence: "Numeric value + text level + symbol on ScoreRing",
  },
] as const;

export type AccessibilityAuditSnapshot = {
  engineVersion: typeof ACCESSIBILITY_ENGINE_VERSION;
  criteria: readonly A11yAuditCriterion[];
  counts: Record<"pass" | "partial" | "fail" | "not_applicable", number>;
  honesty: readonly string[];
  generatedAt: string;
};

export function buildAccessibilityAuditSnapshot(
  generatedAt: string = new Date().toISOString(),
): AccessibilityAuditSnapshot {
  const counts = {
    pass: 0,
    partial: 0,
    fail: 0,
    not_applicable: 0,
  };
  for (const c of A11Y_AUDIT_CRITERIA) {
    counts[c.status] += 1;
  }
  return {
    engineVersion: ACCESSIBILITY_ENGINE_VERSION,
    criteria: A11Y_AUDIT_CRITERIA,
    counts,
    honesty: ACCESSIBILITY_HONESTY,
    generatedAt,
  };
}

export function assertTechniqueScoreNotColorOnly(presentation: {
  hasNumericValue: boolean;
  hasTextLabel: boolean;
  hasNonColorSymbol: boolean;
}): boolean {
  return (
    presentation.hasNumericValue &&
    presentation.hasTextLabel &&
    presentation.hasNonColorSymbol
  );
}
