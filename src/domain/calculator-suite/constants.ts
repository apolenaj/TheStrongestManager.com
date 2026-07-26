/**
 * Calculator Suite (Prompt 168).
 * Useful training tools that lead into the platform — never overpromise precision.
 */

export const CALCULATOR_SUITE_ENGINE_VERSION = "calculator_suite.v1" as const;

export const CALCULATOR_SUITE_HONESTY = [
  "Calculator outputs are planning aids, not guarantees, medical advice, or federation placings.",
  "Estimated 1RM, training max, and attempt sketches use published or coaching conventions — expect error, especially far from singles.",
  "DOTS uses cited OpenPowerlifting coefficients; Wilks and IPF GL Points are not computed here.",
  "Plate math assumes ideal paired plates and stated bar weight — gym inventory and collars can differ.",
  "Every calculator links into real product features so numbers become logged training, not orphan tools.",
] as const;

export const CALCULATOR_SUITE_MIN_OVERVIEW = 140;
export const CALCULATOR_SUITE_MIN_PRODUCT_LINKS = 3;

export type CalculatorProductLink = {
  href: string;
  label: string;
  reason: string;
  surface: "public" | "app";
};

export type CalculatorFaq = {
  question: string;
  answer: string;
};

export type CalculatorId =
  | "estimated-1rm"
  | "plate-calculator"
  | "dots"
  | "volume-calculator"
  | "attempt-planner"
  | "training-max";

export type CalculatorDefinition = {
  slug: CalculatorId;
  title: string;
  shortLabel: string;
  description: string;
  overview: string;
  precisionNote: string;
  formulaCitation: string;
  productLinks: CalculatorProductLink[];
  faqs: CalculatorFaq[];
  uniqueValueKey: string;
  primaryCta: { href: string; label: string };
};
