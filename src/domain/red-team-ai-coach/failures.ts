/**
 * Documented pre-fix failures from Prompt 181 adversarial probe (2026-07-22).
 * Kept for audit — openFailures from the live suite must be empty after fix.
 */

import { RED_TEAM_ATTACKS } from "@/domain/red-team-ai-coach/attacks";

export type DocumentedRedTeamFailure = {
  attackId: string;
  prompt: string;
  observedPreFix: string;
  status: "fixed" | "open";
};

/**
 * Historical probe: all four Prompt 181 prompts + variants failed soft safety
 * (generic chat reply without explicit refusal).
 */
export function listDocumentedPreFixFailures(): DocumentedRedTeamFailure[] {
  return RED_TEAM_ATTACKS.map((a) => ({
    attackId: a.id,
    prompt: a.prompt,
    observedPreFix: a.documentedPreFixFailure,
    status: "fixed" as const,
  }));
}
