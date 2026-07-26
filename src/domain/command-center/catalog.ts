import {
  COMMAND_CENTER_SECTION_HREFS,
  COMMAND_CENTER_SECTION_LABELS,
  type CommandCenterSectionId,
} from "@/domain/command-center/constants";
import type { CommandCenterWidgetDef } from "@/domain/command-center/types";

/**
 * Widget catalog — one primary widget per section.
 * Default: only `today` above the fold.
 */
export const COMMAND_CENTER_WIDGET_CATALOG: readonly CommandCenterWidgetDef[] = [
  {
    id: "today",
    label: COMMAND_CENTER_SECTION_LABELS.today,
    href: COMMAND_CENTER_SECTION_HREFS.today,
    description: "Next session, checklist, and the action that matters now.",
    defaultFold: "above",
    defaultVisible: true,
    defaultOrder: 0,
    defaultSpan: 2,
  },
  {
    id: "performance",
    label: COMMAND_CENTER_SECTION_LABELS.performance,
    href: COMMAND_CENTER_SECTION_HREFS.performance,
    description: "Athlete / strength / consistency signals when enough data exists.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 10,
    defaultSpan: 1,
  },
  {
    id: "training",
    label: COMMAND_CENTER_SECTION_LABELS.training,
    href: COMMAND_CENTER_SECTION_HREFS.training,
    description: "Load, recent sessions, and program context from logged work.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 20,
    defaultSpan: 1,
  },
  {
    id: "technique",
    label: COMMAND_CENTER_SECTION_LABELS.technique,
    href: COMMAND_CENTER_SECTION_HREFS.technique,
    description: "Technique scores and uploads — empty until real analyses exist.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 30,
    defaultSpan: 1,
  },
  {
    id: "recovery",
    label: COMMAND_CENTER_SECTION_LABELS.recovery,
    href: COMMAND_CENTER_SECTION_HREFS.recovery,
    description: "Recovery Readiness from check-ins — not a medical diagnosis.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 40,
    defaultSpan: 1,
  },
  {
    id: "nutrition",
    label: COMMAND_CENTER_SECTION_LABELS.nutrition,
    href: COMMAND_CENTER_SECTION_HREFS.nutrition,
    description: "Mealnexio status and deep links — never invented macros.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 50,
    defaultSpan: 1,
  },
  {
    id: "goal_trajectory",
    label: COMMAND_CENTER_SECTION_LABELS.goal_trajectory,
    href: COMMAND_CENTER_SECTION_HREFS.goal_trajectory,
    description: "Goal progress trajectory — qualitative when data is thin.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 60,
    defaultSpan: 1,
  },
  {
    id: "ai_coach",
    label: COMMAND_CENTER_SECTION_LABELS.ai_coach,
    href: COMMAND_CENTER_SECTION_HREFS.ai_coach,
    description: "AI Coach entry — recommendations from athlete data, never auto-applied.",
    defaultFold: "below",
    defaultVisible: true,
    defaultOrder: 70,
    defaultSpan: 1,
  },
] as const;

export function getWidgetDef(
  id: CommandCenterSectionId,
): CommandCenterWidgetDef | undefined {
  return COMMAND_CENTER_WIDGET_CATALOG.find((w) => w.id === id);
}
