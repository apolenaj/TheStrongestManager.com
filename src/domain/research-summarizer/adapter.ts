/**
 * Summarizer adapter contract.
 * Stub is extractive/deterministic. Future LLM adapters must:
 * - accept only validated VerifiedPaperInput
 * - echo citation from input (never invent)
 * - return the same ResearchSummarizerOutput shape
 */

import {
  RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
} from "@/domain/research-summarizer/constants";
import type { ResearchSummarizerOutput } from "@/domain/research-summarizer/types";
import {
  buildStubSummarizerMeta,
  extractResearchSummaryFields,
} from "@/domain/research-summarizer/summarize";
import type { ValidatedPaperInput } from "@/domain/research-summarizer/validate-input";

export type ResearchSummarizerAdapterResult = {
  adapterId: string;
  engineVersion: string;
  fields: ResearchSummarizerOutput;
  adapterNotes: string[];
};

export type ResearchSummarizerAdapter = {
  id: string;
  summarize(input: ValidatedPaperInput): Promise<ResearchSummarizerAdapterResult>;
};

/**
 * Deterministic stub — no external LLM; does not invent citations.
 */
export const stubResearchSummarizerAdapter: ResearchSummarizerAdapter = {
  id: RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
  async summarize(input) {
    const meta = buildStubSummarizerMeta();
    return {
      ...meta,
      fields: extractResearchSummaryFields(input),
      adapterNotes: [
        "stub.extractive: fields derived only from operator-supplied verified text.",
        "Citation fields are not generated — they must come from verified_input.",
        "No external LLM call; no model-memory citations.",
      ],
    };
  },
};

let activeAdapter: ResearchSummarizerAdapter = stubResearchSummarizerAdapter;

export function getResearchSummarizerAdapter(): ResearchSummarizerAdapter {
  return activeAdapter;
}

/** Tests / future LLM wiring — production stays on stub until a real adapter is ready. */
export function registerResearchSummarizerAdapter(
  adapter: ResearchSummarizerAdapter,
): void {
  activeAdapter = adapter;
}

export function resetResearchSummarizerAdapterForTests(): void {
  activeAdapter = stubResearchSummarizerAdapter;
}
