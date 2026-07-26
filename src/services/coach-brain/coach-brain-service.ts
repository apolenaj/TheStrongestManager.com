import { randomUUID } from "crypto";
import {
  COACH_BRAIN_ENGINE_VERSION,
  COACH_BRAIN_HONESTY,
  COACH_BRAIN_STUB_ADAPTER_ID,
  evaluateCoachBrainRules,
  getCoachBrainReasoningAdapter,
  validateCoachBrainRecommendations,
  type CoachBrainAuditWrite,
  type CoachBrainRunResult,
  type CoachBrainSafetyFlag,
} from "@/domain/coach-brain";
import { prisma } from "@/lib/db";
import { gatherCoachBrainTools } from "@/services/coach-brain/tools";
import { routeAiModelRequest } from "@/services/ai-model-router";

async function writeAudit(entry: CoachBrainAuditWrite): Promise<void> {
  await prisma.coachBrainAuditLog.create({
    data: {
      athleteProfileId: entry.athleteProfileId,
      actorUserId: entry.actorUserId,
      runId: entry.runId,
      action: entry.action,
      engineVersion: entry.engineVersion,
      adapterId: entry.adapterId,
      summary: entry.summary,
      detailJson: JSON.stringify(entry.detail),
      safetyFlagsJson: JSON.stringify(entry.safetyFlags),
    },
  });
}

/**
 * AI Coach Brain orchestration:
 * Athlete Data → Performance Intelligence (via tools) → Rules → Reasoning → Safety → Recommendations.
 *
 * Never modifies programs. Program changes only surface as confirm_adaptation actions.
 */
export async function runCoachBrain(input: {
  userId: string;
  maxRecommendations?: number;
}): Promise<CoachBrainRunResult | null> {
  const gathered = await gatherCoachBrainTools(input.userId);
  if (!gathered) return null;

  const runId = randomUUID();
  const adapter = getCoachBrainReasoningAdapter();
  const engineVersion = COACH_BRAIN_ENGINE_VERSION;

  await writeAudit({
    athleteProfileId: gathered.athleteProfileId,
    actorUserId: input.userId,
    runId,
    action: "run.started",
    engineVersion,
    adapterId: adapter.id,
    summary: "Coach Brain run started",
    detail: { userId: input.userId },
    safetyFlags: [],
  });

  await writeAudit({
    athleteProfileId: gathered.athleteProfileId,
    actorUserId: input.userId,
    runId,
    action: "tools.gathered",
    engineVersion,
    adapterId: adapter.id,
    summary: "Structured tools gathered",
    detail: {
      tools: Object.fromEntries(
        Object.entries(gathered.tools).map(([name, result]) => [
          name,
          { ok: result.ok, missing: result.missing },
        ]),
      ),
    },
    safetyFlags: [],
  });

  const ruleHits = evaluateCoachBrainRules(gathered.tools);

  await writeAudit({
    athleteProfileId: gathered.athleteProfileId,
    actorUserId: input.userId,
    runId,
    action: "rules.evaluated",
    engineVersion,
    adapterId: adapter.id,
    summary: `${ruleHits.length} deterministic rule hit(s)`,
    detail: {
      ruleIds: ruleHits.map((h) => h.ruleId),
    },
    safetyFlags: [],
  });

  const reasoned = await adapter.reason({
    ruleHits,
    maxRecommendations: input.maxRecommendations ?? 3,
  });

  // Prompt 146 — multi-model router (meters latency/errors/cost per attempt).
  // Prompt 145 policy still gates LLM; stub chain never invents completions.
  try {
    await routeAiModelRequest({
      taskKind: "text_reasoning",
      featureId: "coach_brain",
      payload: {
        ruleIds: ruleHits.map((h) => h.ruleId),
        max: input.maxRecommendations ?? 3,
      },
      runId,
      adapterIsStub: reasoned.adapterId === COACH_BRAIN_STUB_ADAPTER_ID,
    });
  } catch {
    // Router / cost metering must never block coaching.
  }

  await writeAudit({
    athleteProfileId: gathered.athleteProfileId,
    actorUserId: input.userId,
    runId,
    action: "reasoning.completed",
    engineVersion,
    adapterId: reasoned.adapterId,
    summary: `${reasoned.recommendations.length} structured recommendation(s)`,
    detail: {
      adapterNotes: reasoned.adapterNotes,
      recommendationIds: reasoned.recommendations.map((r) => r.id),
    },
    safetyFlags: [],
  });

  const safety = validateCoachBrainRecommendations(reasoned.recommendations);

  if (!safety.ok) {
    await writeAudit({
      athleteProfileId: gathered.athleteProfileId,
      actorUserId: input.userId,
      runId,
      action: "safety.rejected",
      engineVersion,
      adapterId: reasoned.adapterId,
      summary: "Safety validation blocked or emptied recommendations",
      detail: {
        flagCodes: safety.flags.map((f) => f.code),
      },
      safetyFlags: safety.flags,
    });

    return {
      runId,
      engineVersion,
      adapterId: reasoned.adapterId,
      athleteProfileId: gathered.athleteProfileId,
      recommendations: [],
      safetyFlags: safety.flags,
      rejected: true,
      honesty: COACH_BRAIN_HONESTY,
      toolsUsed: Object.keys(gathered.tools) as CoachBrainRunResult["toolsUsed"],
    };
  }

  await writeAudit({
    athleteProfileId: gathered.athleteProfileId,
    actorUserId: input.userId,
    runId,
    action: "safety.passed",
    engineVersion,
    adapterId: reasoned.adapterId,
    summary: "Safety validation passed",
    detail: {},
    safetyFlags: safety.flags,
  });

  for (const rec of safety.sanitized) {
    await writeAudit({
      athleteProfileId: gathered.athleteProfileId,
      actorUserId: input.userId,
      runId,
      action: "recommendation.emitted",
      engineVersion,
      adapterId: reasoned.adapterId,
      summary: rec.recommendation.slice(0, 180),
      detail: {
        recommendation: rec,
      },
      safetyFlags: [] as CoachBrainSafetyFlag[],
    });
  }

  return {
    runId,
    engineVersion,
    adapterId: reasoned.adapterId,
    athleteProfileId: gathered.athleteProfileId,
    recommendations: safety.sanitized,
    safetyFlags: safety.flags,
    rejected: false,
    honesty: COACH_BRAIN_HONESTY,
    toolsUsed: Object.keys(gathered.tools) as CoachBrainRunResult["toolsUsed"],
  };
}

export async function listCoachBrainAuditLogs(input: {
  userId: string;
  limit?: number;
}) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return [];

  return prisma.coachBrainAuditLog.findMany({
    where: { athleteProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 40,
  });
}
