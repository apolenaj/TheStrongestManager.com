import { randomUUID } from "crypto";
import {
  COACH_BRAIN_ENGINE_VERSION,
  COACH_CHAT_HONESTY,
  buildCoachChatAnswer,
  type CoachChatAnswer,
} from "@/domain/coach-brain";
import { prisma } from "@/lib/db";
import { gatherCoachBrainTools } from "@/services/coach-brain/tools";
import { isPainSafeModeActiveForAthlete } from "@/services/pain-safe-response-system";

export type CoachChatTurnResult = {
  runId: string;
  question: string;
  answer: CoachChatAnswer;
  honesty: readonly string[];
  engineVersion: string;
};

/**
 * Conversational coaching turn — grounded in tool bag / AthleteState.
 * Never invents unavailable recovery or performance conclusions.
 */
export async function askCoachChat(input: {
  userId: string;
  question: string;
}): Promise<CoachChatTurnResult | null> {
  const question = input.question.trim();
  if (!question) return null;

  const gathered = await gatherCoachBrainTools(input.userId);
  if (!gathered) return null;

  const painSafeModeActive = await isPainSafeModeActiveForAthlete(
    gathered.athleteProfileId,
  );

  const runId = randomUUID();
  const answer = buildCoachChatAnswer({
    question,
    tools: gathered.tools,
    painSafeModeActive,
  });

  await prisma.coachBrainAuditLog.create({
    data: {
      athleteProfileId: gathered.athleteProfileId,
      actorUserId: input.userId,
      runId,
      action: "chat.answered",
      engineVersion: COACH_BRAIN_ENGINE_VERSION,
      adapterId: "chat.deterministic",
      summary: question.slice(0, 160),
      detailJson: JSON.stringify({
        intent: answer.intent,
        confidence: answer.confidence,
        missingInformation: answer.missingInformation,
        dataRefKinds: answer.dataRefs.map((r) => r.kind),
        // Store answer content for audit — not chain-of-thought
        content: answer.content,
      }),
      safetyFlagsJson: "[]",
    },
  });

  return {
    runId,
    question,
    answer,
    honesty: COACH_CHAT_HONESTY,
    engineVersion: COACH_BRAIN_ENGINE_VERSION,
  };
}
