import {
  buildCommandPaletteSnapshot,
  type CommandPaletteSnapshot,
} from "@/domain/command-palette";

export function getCommandPaletteSnapshot(): CommandPaletteSnapshot {
  return buildCommandPaletteSnapshot();
}
