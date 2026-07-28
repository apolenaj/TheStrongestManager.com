import type { LegendaryMethodCategory } from "@/domain/legendary-methods/types";

/**
 * Default conversion hooks for related programme CTAs.
 * Principle-led — never implies athlete creation, approval, or use.
 */
export function defaultLegendaryProgrammeConversionPrompt(
  category: LegendaryMethodCategory,
): string {
  switch (category) {
    case "bodybuilding":
      return "Interested in structured hypertrophy volume principles?";
    case "strongman":
      return "Interested in elite deadlift peaking principles?";
    case "powerlifting":
      return "Interested in relative strength and peaking principles?";
    case "training-system":
      return "Interested in applying these system principles in your own training?";
  }
}
