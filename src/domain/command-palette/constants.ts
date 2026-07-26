/**
 * Command Palette (Prompt 190).
 * Power-user command interface — keyboard accessible, deterministic routes.
 * Does not invent data or run AI; navigates to real app surfaces.
 */

export const COMMAND_PALETTE_ENGINE_VERSION = "command_palette.v1" as const;

export const COMMAND_PALETTE_HONESTY = [
  "The command palette jumps to real app routes — it does not invent workouts, PRs, scores, or coach replies.",
  "Commands are deterministic navigation (and optional search query params), not autonomous actions that mutate training data without your confirmation on the destination page.",
  "Keyboard: Ctrl/Cmd+Shift+P opens the palette; arrows move, Enter runs, Escape closes. ⌘K remains content search.",
] as const;

export const COMMAND_PALETTE_CATEGORIES = [
  "training",
  "technique",
  "coach",
  "library",
  "progress",
  "recovery",
  "navigation",
] as const;

export type CommandPaletteCategory =
  (typeof COMMAND_PALETTE_CATEGORIES)[number];

export const COMMAND_PALETTE_CATEGORY_LABELS: Record<
  CommandPaletteCategory,
  string
> = {
  training: "Training",
  technique: "Technique",
  coach: "Coach",
  library: "Library",
  progress: "Progress",
  recovery: "Recovery",
  navigation: "Navigation",
};

/** Primary shortcut chord — distinct from ⌘K content search. */
export const COMMAND_PALETTE_SHORTCUT = {
  key: "p",
  shiftKey: true,
  metaOrCtrl: true,
  label: "⌘⇧P / Ctrl+Shift+P",
} as const;
