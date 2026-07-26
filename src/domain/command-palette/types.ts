import type { CommandPaletteCategory } from "@/domain/command-palette/constants";

export type CommandPaletteAction = {
  id: string;
  /** Primary label shown in the list (e.g. "Log workout"). */
  label: string;
  /** Optional subtitle for context. */
  description: string;
  category: CommandPaletteCategory;
  /** Destination path (may include query string). */
  href: string;
  /** Extra keywords for fuzzy match. */
  keywords: readonly string[];
  /** Example highlighted in docs / empty state. */
  example?: boolean;
};

export type CommandPaletteMatch = {
  command: CommandPaletteAction;
  score: number;
};

export type CommandPaletteSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  commandCount: number;
  examples: Array<{ id: string; label: string; href: string }>;
  shortcutLabel: string;
  categories: Array<{ id: CommandPaletteCategory; label: string }>;
  docPath: "docs/COMMAND_PALETTE.md";
  generatedAt: string;
};
