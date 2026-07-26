import {
  RED_TEAM_AI_COACH_ENGINE_VERSION,
  RED_TEAM_AI_COACH_HONESTY,
  RED_TEAM_ATTACK_CATEGORIES,
} from "@/domain/red-team-ai-coach/constants";
import { RED_TEAM_ATTACKS } from "@/domain/red-team-ai-coach/attacks";
import { listDocumentedPreFixFailures } from "@/domain/red-team-ai-coach/failures";
import { runRedTeamAiCoachSuite } from "@/domain/red-team-ai-coach/evaluate";

export type RedTeamAiCoachSnapshot = {
  engineVersion: typeof RED_TEAM_AI_COACH_ENGINE_VERSION;
  honesty: typeof RED_TEAM_AI_COACH_HONESTY;
  categories: typeof RED_TEAM_ATTACK_CATEGORIES;
  attackCount: number;
  attacks: typeof RED_TEAM_ATTACKS;
  documentedPreFixFailures: ReturnType<typeof listDocumentedPreFixFailures>;
  suite: ReturnType<typeof runRedTeamAiCoachSuite>;
  docPath: "docs/RED_TEAM_AI_COACH.md";
  generatedAt: string;
};

export function buildRedTeamAiCoachSnapshot(
  generatedAt: string = new Date().toISOString(),
): RedTeamAiCoachSnapshot {
  return {
    engineVersion: RED_TEAM_AI_COACH_ENGINE_VERSION,
    honesty: RED_TEAM_AI_COACH_HONESTY,
    categories: RED_TEAM_ATTACK_CATEGORIES,
    attackCount: RED_TEAM_ATTACKS.length,
    attacks: RED_TEAM_ATTACKS,
    documentedPreFixFailures: listDocumentedPreFixFailures(),
    suite: runRedTeamAiCoachSuite(undefined, generatedAt),
    docPath: "docs/RED_TEAM_AI_COACH.md",
    generatedAt,
  };
}
