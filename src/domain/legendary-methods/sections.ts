import { L } from "@/domain/legendary-methods/localized";
import type {
  LegendaryContentLayer,
  LegendaryMethodSection,
  LegendaryMethodSectionId,
} from "@/domain/legendary-methods/types";

/**
 * Required editorial sections for a complete Legendary Methods profile.
 * Layer tags distinguish history vs independent analysis vs modern adaptation.
 */
export const REQUIRED_LEGENDARY_SECTION_DEFINITIONS: readonly {
  id: LegendaryMethodSectionId;
  title: string;
  layer: LegendaryContentLayer;
}[] = [
  {
    id: "athlete-and-era",
    title: "The Athlete and the Era",
    layer: "documented_historical",
  },
  {
    id: "documented-training-method",
    title: "The Documented Training Method",
    layer: "documented_historical",
  },
  {
    id: "training-structure",
    title: "Training Structure",
    layer: "documented_historical",
  },
  {
    id: "core-training-routine",
    title: "Core Training Routine (Historical Documentation)",
    layer: "documented_historical",
  },
  {
    id: "documented-nutritional-approach",
    title: "Documented Nutritional Approach & Exact Diet (Historical)",
    layer: "documented_historical",
  },
  {
    id: "volume-intensity-frequency",
    title: "Volume, Intensity and Frequency Analysis",
    layer: "independent_analysis",
  },
  {
    id: "why-it-worked",
    title: "Why It Worked",
    layer: "independent_analysis",
  },
  {
    id: "what-lifters-get-wrong",
    title: "What Most Lifters Get Wrong",
    layer: "independent_analysis",
  },
  {
    id: "risks-and-recovery",
    title: "Risks and Recovery Demands",
    layer: "independent_analysis",
  },
  {
    id: "verdict",
    title: "The Strongest Verdict",
    layer: "independent_analysis",
  },
  {
    id: "modernised-application",
    title: "Modernised Application",
    layer: "modernised_adaptation",
  },
  {
    id: "example-training-week",
    title: "Example Training Week",
    layer: "modernised_adaptation",
  },
  {
    id: "sources",
    title: "Sources and Further Reading",
    layer: "documented_historical",
  },
] as const;

/** Empty section shells — bodies stay blank until a sourced content pass. */
export function createEmptyRequiredSections(): LegendaryMethodSection[] {
  return REQUIRED_LEGENDARY_SECTION_DEFINITIONS.map((def) => ({
    id: def.id,
    title: L(def.title),
    layer: def.layer,
    body: L(""),
  }));
}

export const LEGENDARY_METHOD_DETAIL_SECTIONS =
  REQUIRED_LEGENDARY_SECTION_DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.title,
    layer: def.layer,
  }));
