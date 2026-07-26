import {
  COACH_PLATFORM_HONESTY,
  DEFAULT_COACH_SCOPES,
  describeRoles,
  hasCoachScope,
  parseCoachScopes,
  serializeCoachScopes,
  type CoachScope,
  type UserRoles,
} from "@/domain/coach";
import { prisma } from "@/lib/db";
import {
  buildCoachAttentionQueue,
  mapGrantForAttention,
  type CoachAttentionQueueView,
} from "@/services/coach/multi-athlete-dashboard-service";
import { featureFlags } from "@/config/feature-flags";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function getUserRoles(userId: string): Promise<UserRoles | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAthlete: true, isCoach: true },
  });
  if (!user) return null;
  return { isAthlete: user.isAthlete, isCoach: user.isCoach };
}

export async function enableCoachRole(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await prisma.user.update({
    where: { id: userId },
    data: { isCoach: true },
  });
  return { ok: true };
}

export async function setAthleteRole(
  userId: string,
  isAthlete: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isCoach: true },
  });
  if (!user) return { ok: false, error: "User not found." };
  if (!isAthlete && !user.isCoach) {
    return { ok: false, error: "Keep at least one role (athlete or coach)." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { isAthlete },
  });
  return { ok: true };
}

/**
 * Athlete grants (or re-activates) access for a coach identified by email.
 */
export async function grantCoachAccess(input: {
  athleteUserId: string;
  coachEmail: string;
  scopes?: CoachScope[];
  note?: string;
}): Promise<{ ok: true; accessId: string } | { ok: false; error: string }> {
  const email = input.coachEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid coach email." };
  }

  const athleteProfile = await prisma.athleteProfile.findUnique({
    where: { userId: input.athleteUserId },
    select: { id: true },
  });
  if (!athleteProfile) {
    return { ok: false, error: "Complete athlete onboarding before granting coach access." };
  }

  const coach = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isCoach: true, email: true },
  });
  if (!coach) {
    return {
      ok: false,
      error: "No account found for that email. The coach must create an account first.",
    };
  }
  if (coach.id === input.athleteUserId) {
    return { ok: false, error: "You cannot grant coach access to yourself." };
  }
  if (!coach.isCoach) {
    return {
      ok: false,
      error: "That user has not enabled Coach Mode yet. Ask them to enable it in Settings.",
    };
  }

  const scopes = input.scopes?.length
    ? input.scopes
    : [...DEFAULT_COACH_SCOPES];
  // Strip sensitive unless explicitly included
  const scopesJson = serializeCoachScopes(scopes);

  const existing = await prisma.coachAthleteAccess.findUnique({
    where: {
      coachUserId_athleteProfileId: {
        coachUserId: coach.id,
        athleteProfileId: athleteProfile.id,
      },
    },
  });

  if (existing?.status === "active") {
    const updated = await prisma.coachAthleteAccess.update({
      where: { id: existing.id },
      data: {
        scopesJson,
        inviteNote: input.note?.trim() || existing.inviteNote,
      },
    });
    return { ok: true, accessId: updated.id };
  }

  const row = existing
    ? await prisma.coachAthleteAccess.update({
        where: { id: existing.id },
        data: {
          status: "active",
          scopesJson,
          grantedAt: new Date(),
          revokedAt: null,
          revokedByUserId: null,
          revokeReason: null,
          invitedByUserId: input.athleteUserId,
          inviteNote: input.note?.trim() || null,
        },
      })
    : await prisma.coachAthleteAccess.create({
        data: {
          coachUserId: coach.id,
          athleteProfileId: athleteProfile.id,
          status: "active",
          scopesJson,
          grantedAt: new Date(),
          invitedByUserId: input.athleteUserId,
          inviteNote: input.note?.trim() || null,
        },
      });

  return { ok: true, accessId: row.id };
}

export async function revokeCoachAccess(input: {
  athleteUserId: string;
  accessId: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.athleteUserId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const access = await prisma.coachAthleteAccess.findFirst({
    where: {
      id: input.accessId,
      athleteProfileId: profile.id,
    },
  });
  if (!access) return { ok: false, error: "Access grant not found." };
  if (access.status === "revoked") return { ok: true };

  await prisma.coachAthleteAccess.update({
    where: { id: access.id },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      revokedByUserId: input.athleteUserId,
      revokeReason: input.reason?.trim() || "Revoked by athlete",
    },
  });
  return { ok: true };
}

export async function listAthleteCoachGrants(athleteUserId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: athleteUserId },
    select: { id: true },
  });
  if (!profile) return [];

  const rows = await prisma.coachAthleteAccess.findMany({
    where: { athleteProfileId: profile.id },
    orderBy: { updatedAt: "desc" },
    include: {
      coachUser: { select: { id: true, email: true, name: true, isCoach: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    scopes: parseCoachScopes(row.scopesJson),
    coachEmail: row.coachUser.email,
    coachName: row.coachUser.name,
    grantedAt: row.grantedAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }));
}

export type CoachDashboardView = {
  roles: UserRoles;
  rolesLabel: string;
  honesty: readonly string[];
  athletes: Array<{
    accessId: string;
    athleteProfileId: string;
    displayName: string;
    discipline: string | null;
    scopes: CoachScope[];
    adherencePct: number | null;
    recentSessions7d: number;
    techniqueTrendLabel: string | null;
    alerts: string[];
    /** Highest urgency label when on attention queue; null if quiet. */
    attentionUrgency: string | null;
    attentionCategories: string[];
  }>;
  recentActivity: Array<{
    id: string;
    athleteLabel: string;
    title: string;
    when: string;
  }>;
  alerts: Array<{ id: string; severity: "info" | "warning"; message: string }>;
  upcomingReviews: Array<{
    id: string;
    athleteLabel: string;
    title: string;
    href: string | null;
  }>;
  /** Prompt 86 prioritized attention queue (null when flag off). */
  attention: CoachAttentionQueueView | null;
};

/**
 * Coach dashboard — only active grants. Never includes recovery / bodyfat / media unless scoped.
 */
export async function getCoachDashboard(
  coachUserId: string,
): Promise<CoachDashboardView | null> {
  const roles = await getUserRoles(coachUserId);
  if (!roles?.isCoach) return null;

  const grants = await prisma.coachAthleteAccess.findMany({
    where: { coachUserId, status: "active" },
    include: {
      athleteProfile: {
        select: {
          id: true,
          displayName: true,
          primaryDiscipline: true,
          userId: true,
          // Explicitly omit sex, birthYear, movementNotes, painCaution*
          programs: {
            where: { status: "active", kind: "athlete" },
            take: 1,
            select: { id: true, name: true },
          },
          trainingSessions: {
            where: {
              status: "completed",
              completedAt: { gte: daysAgo(28) },
            },
            orderBy: { completedAt: "desc" },
            take: 20,
            select: {
              id: true,
              completedAt: true,
              status: true,
              workout: { select: { name: true } },
            },
          },
          techniqueAnalyses: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              overallScore: true,
              status: true,
              createdAt: true,
              analysisBackendStatus: true,
            },
          },
        },
      },
    },
    orderBy: { grantedAt: "desc" },
  });

  const athletes: CoachDashboardView["athletes"] = [];
  const recentActivity: CoachDashboardView["recentActivity"] = [];
  const alerts: CoachDashboardView["alerts"] = [];
  const upcomingReviews: CoachDashboardView["upcomingReviews"] = [];

  const weekAgo = daysAgo(7);

  for (const grant of grants) {
    const scopes = parseCoachScopes(grant.scopesJson);
    const profile = grant.athleteProfile;
    const label =
      profile.displayName?.trim() ||
      `Athlete ${profile.id.slice(-6)}`;

    const sessions7d = profile.trainingSessions.filter(
      (s) => s.completedAt && s.completedAt >= weekAgo,
    ).length;
    const sessions28d = profile.trainingSessions.length;

    // Simple adherence heuristic: sessions in 28d vs expected ~8–12 — qualitative only
    let adherencePct: number | null = null;
    if (hasCoachScope(scopes, "programs") || hasCoachScope(scopes, "training")) {
      if (sessions28d > 0) {
        adherencePct = Math.min(100, Math.round((sessions28d / 12) * 100));
      } else {
        adherencePct = 0;
      }
    }

    let techniqueTrendLabel: string | null = null;
    if (hasCoachScope(scopes, "technique_summary")) {
      const scored = profile.techniqueAnalyses.filter(
        (t) => t.overallScore != null,
      );
      if (scored.length >= 2) {
        const recent = scored[0]!.overallScore!;
        const prior = scored[1]!.overallScore!;
        const delta = Math.round(recent - prior);
        techniqueTrendLabel =
          delta === 0
            ? `Technique score steady at ${recent}`
            : delta > 0
              ? `Technique score +${delta} vs prior`
              : `Technique score ${delta} vs prior`;
      } else if (scored.length === 1) {
        techniqueTrendLabel = `Latest technique score ${scored[0]!.overallScore}`;
      } else {
        techniqueTrendLabel = "No scored technique analyses yet";
      }
    }

    const athleteAlerts: string[] = [];
    if (hasCoachScope(scopes, "training") && sessions7d === 0 && sessions28d > 0) {
      athleteAlerts.push("No completed sessions in the last 7 days");
      alerts.push({
        id: `inactive-${profile.id}`,
        severity: "warning",
        message: `${label}: no completed sessions in the last 7 days`,
      });
    }
    if (
      hasCoachScope(scopes, "technique_summary") &&
      profile.techniqueAnalyses.some((t) => t.status === "awaiting_pose")
    ) {
      athleteAlerts.push("Technique upload awaiting pose analysis");
      upcomingReviews.push({
        id: `tech-${profile.id}`,
        athleteLabel: label,
        title: "Technique analysis awaiting completion",
        href: null, // media hidden without technique_media scope
      });
    }

    athletes.push({
      accessId: grant.id,
      athleteProfileId: profile.id,
      displayName: label,
      discipline: profile.primaryDiscipline,
      scopes,
      adherencePct,
      recentSessions7d: sessions7d,
      techniqueTrendLabel,
      alerts: athleteAlerts,
      attentionUrgency: null,
      attentionCategories: [],
    });

    if (hasCoachScope(scopes, "training")) {
      for (const session of profile.trainingSessions.slice(0, 3)) {
        if (!session.completedAt) continue;
        recentActivity.push({
          id: session.id,
          athleteLabel: label,
          title: session.workout?.name ?? "Training session completed",
          when: session.completedAt.toISOString(),
        });
      }
    }
  }

  recentActivity.sort(
    (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime(),
  );

  let attention: CoachAttentionQueueView | null = null;
  if (featureFlags.multiAthleteCoachDashboard) {
    attention = await buildCoachAttentionQueue({
      coachUserId,
      grants: grants.map(mapGrantForAttention),
    });

    const byAthlete = new Map<
      string,
      { urgency: string; categories: string[] }
    >();
    for (const item of attention.items) {
      const existing = byAthlete.get(item.athleteProfileId);
      if (!existing) {
        byAthlete.set(item.athleteProfileId, {
          urgency: item.urgency,
          categories: [item.categoryLabel],
        });
      } else if (!existing.categories.includes(item.categoryLabel)) {
        existing.categories.push(item.categoryLabel);
      }
    }

    for (const athlete of athletes) {
      const hit = byAthlete.get(athlete.athleteProfileId);
      if (hit) {
        athlete.attentionUrgency = hit.urgency;
        athlete.attentionCategories = hit.categories;
      }
    }

    // Roster: athletes needing attention first, then by name
    const urgencyRank: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    athletes.sort((a, b) => {
      const ua = a.attentionUrgency
        ? (urgencyRank[a.attentionUrgency] ?? 0)
        : 0;
      const ub = b.attentionUrgency
        ? (urgencyRank[b.attentionUrgency] ?? 0)
        : 0;
      if (ub !== ua) return ub - ua;
      return a.displayName.localeCompare(b.displayName);
    });
  }

  return {
    roles,
    rolesLabel: describeRoles(roles),
    honesty: COACH_PLATFORM_HONESTY,
    athletes,
    recentActivity: recentActivity.slice(0, 12),
    alerts,
    upcomingReviews,
    attention,
  };
}

/** Assert coach may read athlete profile under an active grant. */
export async function assertCoachCanAccessAthlete(input: {
  coachUserId: string;
  athleteProfileId: string;
  requiredScope?: CoachScope;
}): Promise<
  | { ok: true; scopes: CoachScope[] }
  | { ok: false; error: string }
> {
  const grant = await prisma.coachAthleteAccess.findFirst({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
      status: "active",
    },
  });
  if (!grant) {
    return { ok: false, error: "No active access grant for this athlete." };
  }
  const scopes = parseCoachScopes(grant.scopesJson);
  if (input.requiredScope && !hasCoachScope(scopes, input.requiredScope)) {
    return {
      ok: false,
      error: `Scope “${input.requiredScope}” was not granted by the athlete.`,
    };
  }
  return { ok: true, scopes };
}
