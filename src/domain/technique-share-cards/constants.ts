/**
 * Viral Technique Score Cards (Prompt 74).
 */

export const TECHNIQUE_SHARE_CTA = "Analyze your lift";

export const TECHNIQUE_SHARE_BRAND = "The Strongest";

/** Opt-in fields — private media never ships unless selected (thumbnail PNG-only). */
export type TechniqueShareFieldId =
  | "score"
  | "strongest_improve"
  | "insight"
  | "thumbnail";

export const TECHNIQUE_SHARE_FIELD_OPTIONS: readonly {
  id: TechniqueShareFieldId;
  label: string;
  /** Off unless athlete enables. */
  privateByDefault: boolean;
  /** Default checked in studio when not private-by-default. */
  defaultOn: boolean;
  description: string;
}[] = [
  {
    id: "score",
    label: "Overall score",
    privateByDefault: false,
    defaultOn: true,
    description: "e.g. 86/100",
  },
  {
    id: "strongest_improve",
    label: "Strongest + Improve",
    privateByDefault: false,
    defaultOn: true,
    description: "Best and weakest component scores",
  },
  {
    id: "insight",
    label: "One insight",
    privateByDefault: true,
    defaultOn: false,
    description: "A single coaching line you choose to share",
  },
  {
    id: "thumbnail",
    label: "Video thumbnail",
    privateByDefault: true,
    defaultOn: false,
    description:
      "PNG export only — public links never embed private video URLs",
  },
] as const;

export function defaultTechniqueShareFields(): TechniqueShareFieldId[] {
  return TECHNIQUE_SHARE_FIELD_OPTIONS.filter((o) => o.defaultOn).map(
    (o) => o.id,
  );
}
