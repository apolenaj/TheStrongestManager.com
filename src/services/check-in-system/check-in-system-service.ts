/**
 * Weekly Check-in System service (Prompt 133).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  CHECK_IN_AI_SUMMARY_LABEL,
  CHECK_IN_ENGINE_VERSION,
  CHECK_IN_HONESTY,
  CHECK_IN_QUESTION_CATALOG,
  assembleCheckInAiSummary,
  defaultEnabledQuestionKeys,
  resolveQuestionsForKeys,
  sanitizeEnabledQuestionKeys,
  weekKeyFromDate,
  weekStartFromWeekKey,
  type CheckInQuestionDef,
} from "@/domain/check-in-system";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function parseResponses(
  raw: string | null | undefined,
): Record<string, string | number | boolean | null> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string | number | boolean | null>;
  } catch {
    return {};
  }
}

async function resolveEnabledKeysForAthlete(
  athleteProfileId: string,
): Promise<{ keys: string[]; coachUserId: string | null }> {
  // Prefer athlete-specific coach template from any active grant (most recently updated).
  const grants = await prisma.coachAthleteAccess.findMany({
    where: { athleteProfileId, status: "active" },
    select: { coachUserId: true },
  });
  const coachIds = grants.map((g) => g.coachUserId);
  if (coachIds.length === 0) {
    return { keys: defaultEnabledQuestionKeys(), coachUserId: null };
  }

  const specific = await prisma.coachCheckInTemplate.findFirst({
    where: {
      athleteProfileId,
      coachUserId: { in: coachIds },
      status: "active",
    },
    orderBy: { updatedAt: "desc" },
  });
  if (specific) {
    return {
      keys: sanitizeEnabledQuestionKeys(
        parseJsonArray(specific.enabledQuestionKeysJson),
      ),
      coachUserId: specific.coachUserId,
    };
  }

  const defaults = await prisma.coachCheckInTemplate.findMany({
    where: {
      coachUserId: { in: coachIds },
      athleteProfileId: null,
      status: "active",
    },
    orderBy: { updatedAt: "desc" },
  });
  if (defaults[0]) {
    return {
      keys: sanitizeEnabledQuestionKeys(
        parseJsonArray(defaults[0].enabledQuestionKeysJson),
      ),
      coachUserId: defaults[0].coachUserId,
    };
  }

  return { keys: defaultEnabledQuestionKeys(), coachUserId: coachIds[0] ?? null };
}

export type AthleteCheckInView = {
  honesty: readonly string[];
  weekKey: string;
  weekStart: string;
  status: string;
  questions: CheckInQuestionDef[];
  responses: Record<string, string | number | boolean | null>;
  checkInId: string | null;
  summary: null | {
    id: string;
    sourceLabel: string;
    body: string;
    createdAt: string;
  };
  catalog: CheckInQuestionDef[];
};

export async function getAthleteCheckInView(input: {
  userId: string;
}): Promise<
  | { ok: true; view: AthleteCheckInView }
  | { ok: false; error: string }
> {
  if (!featureFlags.checkInSystem) {
    return { ok: false, error: "Check-in System is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const now = new Date();
  const weekKey = weekKeyFromDate(now);
  const weekStart = weekStartFromWeekKey(weekKey);
  const { keys, coachUserId } = await resolveEnabledKeysForAthlete(profile.id);
  const questions = resolveQuestionsForKeys(keys);

  let checkIn = await prisma.weeklyCheckIn.findUnique({
    where: {
      athleteProfileId_weekKey: {
        athleteProfileId: profile.id,
        weekKey,
      },
    },
    include: {
      summaries: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!checkIn) {
    checkIn = await prisma.weeklyCheckIn.create({
      data: {
        athleteProfileId: profile.id,
        weekKey,
        weekStart,
        status: "pending",
        templateSnapshotJson: JSON.stringify(keys),
        configuredByCoachUserId: coachUserId,
        engineVersion: CHECK_IN_ENGINE_VERSION,
      },
      include: {
        summaries: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  const snapshotKeys = sanitizeEnabledQuestionKeys(
    parseJsonArray(checkIn.templateSnapshotJson),
  );
  const activeQuestions =
    checkIn.status === "submitted"
      ? resolveQuestionsForKeys(snapshotKeys)
      : questions;

  const latest = checkIn.summaries[0] ?? null;

  return {
    ok: true,
    view: {
      honesty: CHECK_IN_HONESTY,
      weekKey,
      weekStart: weekStart.toISOString(),
      status: checkIn.status,
      questions: activeQuestions,
      responses: parseResponses(checkIn.responsesJson),
      checkInId: checkIn.id,
      summary: latest
        ? {
            id: latest.id,
            sourceLabel: CHECK_IN_AI_SUMMARY_LABEL,
            body: latest.summaryBody,
            createdAt: latest.createdAt.toISOString(),
          }
        : null,
      catalog: [...CHECK_IN_QUESTION_CATALOG],
    },
  };
}

export async function submitWeeklyCheckIn(input: {
  userId: string;
  responses: Record<string, string | number | boolean | null>;
}): Promise<{ ok: true; checkInId: string } | { ok: false; error: string }> {
  if (!featureFlags.checkInSystem) {
    return { ok: false, error: "Feature off." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  const view = await getAthleteCheckInView({ userId: input.userId });
  if (!view.ok || !view.view.checkInId) {
    return { ok: false, error: view.ok ? "Check-in unavailable." : view.error };
  }

  const allowedKeys = new Set(view.view.questions.map((q) => q.key));
  const cleaned: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input.responses)) {
    if (!allowedKeys.has(key)) continue;
    cleaned[key] = value;
  }

  const keys = view.view.questions.map((q) => q.key);

  const updated = await prisma.weeklyCheckIn.update({
    where: { id: view.view.checkInId },
    data: {
      status: "submitted",
      responsesJson: JSON.stringify(cleaned),
      templateSnapshotJson: JSON.stringify(keys),
      submittedAt: new Date(),
    },
  });

  // Auto-generate AI summary on submit
  const summary = assembleCheckInAiSummary({
    weekKey: updated.weekKey,
    questions: view.view.questions,
    responses: cleaned,
  });
  await prisma.weeklyCheckInSummary.create({
    data: {
      checkInId: updated.id,
      summaryBody: summary.body,
      source: "ai_summary",
      engineVersion: summary.engineVersion,
      requestedByUserId: input.userId,
    },
  });

  return { ok: true, checkInId: updated.id };
}

export type CoachCheckInConfigView = {
  honesty: readonly string[];
  athleteProfileId: string;
  athleteDisplayName: string | null;
  enabledKeys: string[];
  catalog: CheckInQuestionDef[];
  isAthleteSpecific: boolean;
};

export async function getCoachCheckInConfig(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; view: CoachCheckInConfigView }
  | { ok: false; error: string }
> {
  if (!featureFlags.checkInSystem) {
    return { ok: false, error: "Feature off." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const athlete = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select: { id: true, displayName: true },
  });
  if (!athlete) return { ok: false, error: "Athlete not found." };

  const specific = await prisma.coachCheckInTemplate.findFirst({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
      status: "active",
    },
  });
  const fallback = await prisma.coachCheckInTemplate.findFirst({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: null,
      status: "active",
    },
  });

  const row = specific ?? fallback;
  const enabledKeys = sanitizeEnabledQuestionKeys(
    row ? parseJsonArray(row.enabledQuestionKeysJson) : null,
  );

  return {
    ok: true,
    view: {
      honesty: CHECK_IN_HONESTY,
      athleteProfileId: athlete.id,
      athleteDisplayName: athlete.displayName,
      enabledKeys,
      catalog: [...CHECK_IN_QUESTION_CATALOG],
      isAthleteSpecific: Boolean(specific),
    },
  };
}

export async function saveCoachCheckInConfig(input: {
  coachUserId: string;
  athleteProfileId: string;
  enabledKeys: string[];
  applyAsDefault?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.checkInSystem) {
    return { ok: false, error: "Feature off." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const keys = sanitizeEnabledQuestionKeys(input.enabledKeys);
  const targetAthleteId = input.applyAsDefault ? null : input.athleteProfileId;

  const existing = await prisma.coachCheckInTemplate.findFirst({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: targetAthleteId,
    },
  });

  if (existing) {
    await prisma.coachCheckInTemplate.update({
      where: { id: existing.id },
      data: {
        enabledQuestionKeysJson: JSON.stringify(keys),
        status: "active",
      },
    });
  } else {
    await prisma.coachCheckInTemplate.create({
      data: {
        coachUserId: input.coachUserId,
        athleteProfileId: targetAthleteId,
        enabledQuestionKeysJson: JSON.stringify(keys),
        cadence: "weekly",
        status: "active",
      },
    });
  }

  return { ok: true };
}

export async function summarizeWeeklyCheckIn(input: {
  userId: string;
  checkInId: string;
}): Promise<{ ok: true; summaryId: string } | { ok: false; error: string }> {
  if (!featureFlags.checkInSystem) {
    return { ok: false, error: "Feature off." };
  }

  const checkIn = await prisma.weeklyCheckIn.findUnique({
    where: { id: input.checkInId },
    include: {
      athleteProfile: { select: { userId: true, id: true } },
    },
  });
  if (!checkIn) return { ok: false, error: "Check-in not found." };

  const isOwner = checkIn.athleteProfile.userId === input.userId;
  let allowed = isOwner;
  if (!allowed) {
    const access = await assertCoachCanAccessAthlete({
      coachUserId: input.userId,
      athleteProfileId: checkIn.athleteProfileId,
    });
    allowed = access.ok;
  }
  if (!allowed) return { ok: false, error: "Access denied." };

  if (checkIn.status !== "submitted") {
    return { ok: false, error: "Submit the check-in before summarizing." };
  }

  const keys = sanitizeEnabledQuestionKeys(
    parseJsonArray(checkIn.templateSnapshotJson),
  );
  const questions = resolveQuestionsForKeys(keys);
  const responses = parseResponses(checkIn.responsesJson);
  const summary = assembleCheckInAiSummary({
    weekKey: checkIn.weekKey,
    questions,
    responses,
  });

  const row = await prisma.weeklyCheckInSummary.create({
    data: {
      checkInId: checkIn.id,
      summaryBody: summary.body,
      source: "ai_summary",
      engineVersion: summary.engineVersion,
      requestedByUserId: input.userId,
    },
  });

  return { ok: true, summaryId: row.id };
}
