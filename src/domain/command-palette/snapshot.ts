import {
  COMMAND_PALETTE_CATEGORIES,
  COMMAND_PALETTE_CATEGORY_LABELS,
  COMMAND_PALETTE_ENGINE_VERSION,
  COMMAND_PALETTE_HONESTY,
  COMMAND_PALETTE_SHORTCUT,
} from "@/domain/command-palette/constants";
import {
  COMMAND_PALETTE_ACTIONS,
  exampleCommands,
} from "@/domain/command-palette/catalog";
import type { CommandPaletteSnapshot } from "@/domain/command-palette/types";

export function buildCommandPaletteSnapshot(
  generatedAt: string = new Date().toISOString(),
): CommandPaletteSnapshot {
  return {
    engineVersion: COMMAND_PALETTE_ENGINE_VERSION,
    honesty: COMMAND_PALETTE_HONESTY,
    commandCount: COMMAND_PALETTE_ACTIONS.length,
    examples: exampleCommands().map((c) => ({
      id: c.id,
      label: c.label,
      href: c.href,
    })),
    shortcutLabel: COMMAND_PALETTE_SHORTCUT.label,
    categories: COMMAND_PALETTE_CATEGORIES.map((id) => ({
      id,
      label: COMMAND_PALETTE_CATEGORY_LABELS[id],
    })),
    docPath: "docs/COMMAND_PALETTE.md",
    generatedAt,
  };
}
