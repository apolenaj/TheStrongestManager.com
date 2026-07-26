import {
  YEAR_IN_REVIEW_CARD_KINDS,
  YEAR_IN_REVIEW_ENGINE_VERSION,
  YEAR_IN_REVIEW_HONESTY,
} from "@/domain/year-in-review/constants";
import type { YearInReviewSnapshot } from "@/domain/year-in-review/types";

export function buildYearInReviewSnapshot(
  generatedAt: string = new Date().toISOString(),
): YearInReviewSnapshot {
  return {
    engineVersion: YEAR_IN_REVIEW_ENGINE_VERSION,
    honesty: YEAR_IN_REVIEW_HONESTY,
    cardKinds: [...YEAR_IN_REVIEW_CARD_KINDS],
    docPath: "docs/YEAR_IN_REVIEW.md",
    generatedAt,
  };
}
