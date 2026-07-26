/**
 * Map router task kinds ↔ Prompt 145 AiTaskClass for cost-control gating.
 */

import type { AiTaskClass } from "@/domain/ai-cost-control";
import type { AiRouterTaskKind } from "@/domain/ai-model-router/constants";

export function taskKindToCostTaskClass(
  taskKind: AiRouterTaskKind,
): AiTaskClass {
  switch (taskKind) {
    case "text_reasoning":
      return "nl_draft";
    case "summarization":
      return "nl_summarize";
    case "classification":
      // Prefer deterministic intent/filter; nl_paraphrase only if explicitly allowlisted later.
      return "intent_route";
    case "vision":
      return "pose";
  }
}
