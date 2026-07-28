/**
 * Visible editorial labels for Legendary Training Methods content layers.
 */

export const LEGENDARY_EDITORIAL_LABEL_IDS = [
  "documented",
  "reconstructed",
  "analysis",
  "modernised-example",
  "limited-evidence",
  "conflicting-information",
] as const;

export type LegendaryEditorialLabelId =
  (typeof LEGENDARY_EDITORIAL_LABEL_IDS)[number];

export type LegendaryEditorialLabel = {
  id: LegendaryEditorialLabelId;
  label: string;
  description: string;
};

export const LEGENDARY_EDITORIAL_LABELS: Record<
  LegendaryEditorialLabelId,
  LegendaryEditorialLabel
> = {
  documented: {
    id: "documented",
    label: "Documented information",
    description:
      "Drawn from cited public sources such as books, interviews, meet databases, or official organiser reports.",
  },
  reconstructed: {
    id: "reconstructed",
    label: "Reconstructed from public sources",
    description:
      "Synthesised from multiple public sources for clarity. Not presented as an exact permanent routine.",
  },
  analysis: {
    id: "analysis",
    label: "The Strongest Manager analysis",
    description:
      "Independent coaching commentary and interpretation by The Strongest Manager.",
  },
  "modernised-example": {
    id: "modernised-example",
    label: "Original modernised example",
    description:
      "An original The Strongest Manager training illustration. Not the athlete’s exact programme.",
  },
  "limited-evidence": {
    id: "limited-evidence",
    label: "Limited evidence",
    description:
      "Available public evidence is thin, incomplete, or lower confidence for this claim.",
  },
  "conflicting-information": {
    id: "conflicting-information",
    label: "Conflicting public information",
    description:
      "Credible public sources disagree. Claims stay conservative until resolved.",
  },
};

/** Map content layers used in section shells to primary editorial labels. */
export function editorialLabelForContentLayer(
  layer:
    | "documented_historical"
    | "independent_analysis"
    | "modernised_adaptation",
): LegendaryEditorialLabel {
  switch (layer) {
    case "documented_historical":
      return LEGENDARY_EDITORIAL_LABELS.documented;
    case "independent_analysis":
      return LEGENDARY_EDITORIAL_LABELS.analysis;
    case "modernised_adaptation":
      return LEGENDARY_EDITORIAL_LABELS["modernised-example"];
  }
}
