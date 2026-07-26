import {
  COMMAND_CENTER_DENSITIES,
  COMMAND_CENTER_ENGINE_VERSION,
  COMMAND_CENTER_HONESTY,
  COMMAND_CENTER_SECTION_HREFS,
  COMMAND_CENTER_SECTION_LABELS,
  COMMAND_CENTER_SECTIONS,
} from "@/domain/command-center/constants";
import { defaultAboveFoldSectionIds } from "@/domain/command-center/layout";
import type { CommandCenterSnapshot } from "@/domain/command-center/types";

export function buildCommandCenterSnapshot(
  generatedAt: string = new Date().toISOString(),
): CommandCenterSnapshot {
  return {
    engineVersion: COMMAND_CENTER_ENGINE_VERSION,
    honesty: COMMAND_CENTER_HONESTY,
    sections: COMMAND_CENTER_SECTIONS.map((id) => ({
      id,
      label: COMMAND_CENTER_SECTION_LABELS[id],
      href: COMMAND_CENTER_SECTION_HREFS[id],
    })),
    defaultAboveFold: defaultAboveFoldSectionIds(),
    densities: COMMAND_CENTER_DENSITIES,
    docPath: "docs/COMMAND_CENTER.md",
    generatedAt,
  };
}
