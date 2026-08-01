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
  titleEn: string;
  titleCs: string;
  layer: LegendaryContentLayer;
}[] = [
  {
    id: "athlete-and-era",
    titleEn: "The Athlete and the Era",
    titleCs: "Atlet a éra",
    layer: "documented_historical",
  },
  {
    id: "documented-training-method",
    titleEn: "The Documented Training Method",
    titleCs: "Dokumentovaná tréninková metoda",
    layer: "documented_historical",
  },
  {
    id: "training-structure",
    titleEn: "Training Structure",
    titleCs: "Struktura tréninku",
    layer: "documented_historical",
  },
  {
    id: "core-training-routine",
    titleEn: "Core Training Routine (Historical Documentation)",
    titleCs: "Jádrová tréninková rutina (historická dokumentace)",
    layer: "documented_historical",
  },
  {
    id: "documented-nutritional-approach",
    titleEn: "Documented Nutritional Approach & Exact Diet (Historical)",
    titleCs: "Dokumentovaná výživa a dieta (historická)",
    layer: "documented_historical",
  },
  {
    id: "volume-intensity-frequency",
    titleEn: "Volume, Intensity and Frequency Analysis",
    titleCs: "Analýza objemu, intenzity a frekvence",
    layer: "independent_analysis",
  },
  {
    id: "why-it-worked",
    titleEn: "Why It Worked",
    titleCs: "Proč to fungovalo",
    layer: "independent_analysis",
  },
  {
    id: "what-lifters-get-wrong",
    titleEn: "What Most Lifters Get Wrong",
    titleCs: "Co většina lifterů kazí",
    layer: "independent_analysis",
  },
  {
    id: "risks-and-recovery",
    titleEn: "Risks and Recovery Demands",
    titleCs: "Rizika a nároky na regeneraci",
    layer: "independent_analysis",
  },
  {
    id: "verdict",
    titleEn: "The Strongest Verdict",
    titleCs: "Verdikt The Strongest",
    layer: "independent_analysis",
  },
  {
    id: "modernised-application",
    titleEn: "Modernised Application",
    titleCs: "Modernizovaná aplikace",
    layer: "modernised_adaptation",
  },
  {
    id: "example-training-week",
    titleEn: "Example Training Week",
    titleCs: "Ukázkový tréninkový týden",
    layer: "modernised_adaptation",
  },
  {
    id: "sources",
    titleEn: "Sources and Further Reading",
    titleCs: "Zdroje a další čtení",
    layer: "documented_historical",
  },
] as const;

/** Empty section shells — bodies stay blank until a sourced content pass. */
export function createEmptyRequiredSections(): LegendaryMethodSection[] {
  return REQUIRED_LEGENDARY_SECTION_DEFINITIONS.map((def) => ({
    id: def.id,
    title: L(def.titleEn, def.titleCs),
    layer: def.layer,
    body: L(""),
  }));
}

export const LEGENDARY_METHOD_DETAIL_SECTIONS =
  REQUIRED_LEGENDARY_SECTION_DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.titleEn,
    layer: def.layer,
  }));
