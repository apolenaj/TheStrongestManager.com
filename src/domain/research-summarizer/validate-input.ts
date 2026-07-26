/**
 * Validate verified paper input before summarization.
 * Hard reject missing citation — never invent from model memory.
 */

import {
  RESEARCH_LIBRARY_CATEGORIES,
  type ResearchLibraryCategory,
} from "@/domain/research-library/constants";
import type {
  ResearchSummarizerValidationRejection,
  VerifiedPaperInput,
} from "@/domain/research-summarizer/types";

function isCategory(raw: string): raw is ResearchLibraryCategory {
  return (RESEARCH_LIBRARY_CATEGORIES as readonly string[]).includes(raw);
}

function normalizeUrl(raw: string | null | undefined): string | null {
  const url = raw?.trim() || null;
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

export type ValidatedPaperInput = {
  citationLabel: string;
  citationUrl: string | null;
  title: string | null;
  authors: string | null;
  year: string | null;
  abstractOrText: string;
  category: ResearchLibraryCategory | null;
};

/**
 * Validate operator-supplied verified metadata/text.
 * Rejects blank citationLabel so the summarizer cannot invent citations.
 */
export function validateVerifiedPaperInput(
  input: VerifiedPaperInput,
):
  | { ok: true; value: ValidatedPaperInput }
  | { ok: false; rejection: ResearchSummarizerValidationRejection } {
  const citationLabel = input.citationLabel?.trim() ?? "";
  if (!citationLabel) {
    return {
      ok: false,
      rejection: {
        field: "citationLabel",
        reason:
          "citationLabel is required — never create citations from model memory.",
      },
    };
  }

  const abstractOrText = input.abstractOrText?.trim() ?? "";
  if (abstractOrText.length < 40) {
    return {
      ok: false,
      rejection: {
        field: "abstractOrText",
        reason:
          "Paste verified abstract or paper text (at least ~40 characters). The model must not invent paper content.",
      },
    };
  }

  if (input.citationUrl?.trim() && !normalizeUrl(input.citationUrl)) {
    return {
      ok: false,
      rejection: {
        field: "citationUrl",
        reason:
          "citationUrl must be an http(s) URL when provided — do not invent or keep invalid links.",
      },
    };
  }

  const categoryRaw = input.category?.trim().toLowerCase() ?? "";
  let category: ResearchLibraryCategory | null = null;
  if (categoryRaw) {
    if (!isCategory(categoryRaw)) {
      return {
        ok: false,
        rejection: {
          field: "category",
          reason: `Unknown category “${input.category}”. Use: ${RESEARCH_LIBRARY_CATEGORIES.join(", ")}.`,
        },
      };
    }
    category = categoryRaw;
  }

  return {
    ok: true,
    value: {
      citationLabel,
      citationUrl: normalizeUrl(input.citationUrl),
      title: input.title?.trim() || null,
      authors: input.authors?.trim() || null,
      year: input.year?.trim() || null,
      abstractOrText,
      category,
    },
  };
}
