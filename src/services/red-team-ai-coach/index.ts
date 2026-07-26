/**
 * Red Team AI Coach — admin snapshot.
 */

import {
  buildRedTeamAiCoachSnapshot,
  type RedTeamAiCoachSnapshot,
} from "@/domain/red-team-ai-coach";

export function getRedTeamAiCoachSnapshot(): RedTeamAiCoachSnapshot {
  return buildRedTeamAiCoachSnapshot();
}
