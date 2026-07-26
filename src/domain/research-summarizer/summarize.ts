/**
 * Deterministic extractive summarizer from verified paper text.
 * Never invents citations, DOIs, or paper titles.
 */

import {
  RESEARCH_SUMMARIZER_ENGINE_VERSION,
  RESEARCH_SUMMARIZER_NOT_STATED,
  RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
} from "@/domain/research-summarizer/constants";
import type { ResearchSummarizerOutput } from "@/domain/research-summarizer/types";
import type { ValidatedPaperInput } from "@/domain/research-summarizer/validate-input";

function firstSentenceMatching(
  text: string,
  patterns: RegExp[],
): string | null {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  for (const sentence of sentences) {
    for (const pattern of patterns) {
      if (pattern.test(sentence)) {
        return sentence.slice(0, 400);
      }
    }
  }
  return null;
}

function excerpt(text: string, max = 280): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max).trim()}…`;
}

/**
 * Build structured summary fields from validated input only.
 * Citation fields are never produced here — they stay on the draft from input.
 */
export function extractResearchSummaryFields(
  input: ValidatedPaperInput,
): ResearchSummarizerOutput {
  const text = input.abstractOrText;

  const researchQuestion =
    firstSentenceMatching(text, [
      /\b(research question|we (aimed|sought|investigated|examined|tested)|objective|hypothesis|purpose of (this|the) (study|trial))\b/i,
      /\?$/,
    ]) ??
    (input.title
      ? `Study focus (from verified title): ${input.title}`
      : RESEARCH_SUMMARIZER_NOT_STATED);

  const methods =
    firstSentenceMatching(text, [
      /\b(method|participant|subject|randomized|protocol|intervention|procedure|design|sample)\b/i,
    ]) ?? RESEARCH_SUMMARIZER_NOT_STATED;

  const findings =
    firstSentenceMatching(text, [
      /\b(result|finding|found|showed|demonstrated|increased|decreased|significant|observed)\b/i,
    ]) ?? RESEARCH_SUMMARIZER_NOT_STATED;

  const limitations =
    firstSentenceMatching(text, [
      /\b(limit|caveat|caution|small sample|underpowered|confound|generaliz|bias|only (men|women|athletes))\b/i,
    ]) ??
    "Limitations were not explicit in the supplied text — reviewer must confirm study constraints before publication.";

  const practicalRelevance =
    findings !== RESEARCH_SUMMARIZER_NOT_STATED
      ? `Educational relevance (draft): ${excerpt(findings, 220)} Confirm applicability to your athletes before coaching use.`
      : "Practical relevance unclear from supplied text — do not publish coaching claims until a reviewer fills this section.";

  return {
    researchQuestion,
    methods,
    findings,
    limitations,
    practicalRelevance,
  };
}

export function buildStubSummarizerMeta(): {
  adapterId: string;
  engineVersion: string;
} {
  return {
    adapterId: RESEARCH_SUMMARIZER_STUB_ADAPTER_ID,
    engineVersion: RESEARCH_SUMMARIZER_ENGINE_VERSION,
  };
}
