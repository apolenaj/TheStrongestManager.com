/**
 * Stub / none providers — never invent LLM output.
 */

import type {
  AiModelCompleteInput,
  AiModelCompleteResult,
  AiModelProvider,
} from "@/domain/ai-model-router/constants";

/**
 * Explicit no-provider slot (e.g. vision until a real vision LLM is wired).
 */
export const noneAiModelProvider: AiModelProvider = {
  id: "none",
  label: "None (local / unavailable)",
  status: "unavailable",
  supportedTaskKinds: ["vision", "text_reasoning", "summarization", "classification"],
  async complete(_input: AiModelCompleteInput): Promise<AiModelCompleteResult | null> {
    return null;
  },
};

/**
 * Deterministic stub — signals “no live LLM”.
 * Returns null so callers keep using feature-level deterministic engines.
 */
export const stubAiModelProvider: AiModelProvider = {
  id: "stub",
  label: "Stub (deterministic)",
  status: "stub",
  supportedTaskKinds: [
    "text_reasoning",
    "summarization",
    "classification",
    "vision",
  ],
  async complete(_input: AiModelCompleteInput): Promise<AiModelCompleteResult | null> {
    // Never invent NL / scores / citations — null forces deterministic fallbacks.
    return null;
  },
};
