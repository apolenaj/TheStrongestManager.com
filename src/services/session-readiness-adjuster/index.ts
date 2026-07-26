import { prisma } from "@/lib/db";
import {
  adjustSessionReadiness,
  buildSessionReadinessAdjusterSnapshot,
  type SessionReadinessAdjustment,
  type SessionReadinessAdjusterSnapshot,
  type SessionReadinessCheckIn,
} from "@/domain/session-readiness-adjuster";
import { saveRecoveryCheckIn } from "@/services/recovery/recovery-service";

export type SessionReadinessPageData = {
  profileId: string;
  /** Prefill from today’s recovery entry when present. */
  prefill: SessionReadinessCheckIn;
  /** Live recommendation from prefill (recomputed client-side on edit). */
  adjustment: SessionReadinessAdjustment;
  todayHref: "/app/today";
  recoveryHref: "/app/recovery";
};

function startOfLocalDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Prefill session readiness from today’s RecoveryEntry when logged.
 * Never invents sleep/fatigue/soreness/motivation.
 */
export async function getSessionReadinessPageData(
  userId: string,
): Promise<SessionReadinessPageData | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;

  const dayStart = startOfLocalDay();
  const today = await prisma.recoveryEntry.findFirst({
    where: {
      athleteProfileId: profile.id,
      recordedAt: { gte: dayStart },
    },
    orderBy: { recordedAt: "desc" },
    select: {
      sleepHours: true,
      fatigue: true,
      soreness: true,
      motivation: true,
    },
  });

  const prefill: SessionReadinessCheckIn = {
    sleepHours: today?.sleepHours ?? null,
    fatigue: today?.fatigue ?? null,
    soreness: today?.soreness ?? null,
    motivation: today?.motivation ?? null,
  };

  return {
    profileId: profile.id,
    prefill,
    adjustment: adjustSessionReadiness(prefill),
    todayHref: "/app/today",
    recoveryHref: "/app/recovery",
  };
}

/**
 * Persist the quick check-in via RecoveryEntry (same honesty rules),
 * then return the session readiness adjustment.
 */
export async function saveSessionReadinessCheckIn(input: {
  userId: string;
  checkIn: SessionReadinessCheckIn;
}): Promise<
  | { ok: true; adjustment: SessionReadinessAdjustment }
  | { ok: false; error: string }
> {
  const saved = await saveRecoveryCheckIn({
    userId: input.userId,
    sleepHours: input.checkIn.sleepHours,
    sleepQuality: null,
    stress: null,
    soreness: input.checkIn.soreness,
    motivation: input.checkIn.motivation,
    fatigue: input.checkIn.fatigue,
    notes: null,
  });
  if (!saved.ok) return saved;

  return {
    ok: true,
    adjustment: adjustSessionReadiness(input.checkIn),
  };
}

export function getSessionReadinessAdminSnapshot(): SessionReadinessAdjusterSnapshot {
  return buildSessionReadinessAdjusterSnapshot();
}
