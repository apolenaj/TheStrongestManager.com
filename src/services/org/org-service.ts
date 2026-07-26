/**
 * Gym / team organization service (Prompt 87).
 * Aggregates only for aggregateOptIn members. Never loads private health fields.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  ORG_GYM_HONESTY,
  ORG_KIND_LABELS,
  ORG_MEMBER_ROLE_LABELS,
  athleteIncludedInOrgAggregates,
  buildOrgAnalytics,
  buildOrgRosterRows,
  canManageOrgMembers,
  canManageOrgTeams,
  canViewOrgAggregates,
  isOrgKind,
  isOrgMemberRole,
  orgRoleUnlocksPrivateAthleteData,
  parseOrgCapabilities,
  type OrgAnalyticsSummary,
  type OrgCapability,
  type OrgKind,
  type OrgMemberRole,
  type OrgPrincipal,
  type OrgRosterRow,
} from "@/domain/org";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "org";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  kindLabel: string;
  role: string;
  roleLabel: string;
};

export type OrgDashboardView = {
  honesty: readonly string[];
  organization: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    kindLabel: string;
  };
  viewer: {
    role: OrgMemberRole;
    roleLabel: string;
    canViewAggregates: boolean;
    canManageMembers: boolean;
    unlocksPrivateData: boolean;
  };
  memberCounts: {
    totalActive: number;
    coaches: number;
    athletes: number;
    optedInAthletes: number;
  };
  teams: Array<{ id: string; name: string; memberCount: number }>;
  analytics: OrgAnalyticsSummary | null;
  roster: OrgRosterRow[];
  /** True when viewer is athlete member — show opt-in control. */
  selfMembership: {
    id: string;
    role: string;
    aggregateOptIn: boolean;
  } | null;
};

function toPrincipal(
  role: OrgMemberRole,
  status: string,
  extra: OrgCapability[] = [],
): OrgPrincipal {
  return {
    role,
    status:
      status === "active"
        ? "active"
        : status === "invited"
          ? "invited"
          : "revoked",
    extraCapabilities: extra,
  };
}

export async function listOrganizationsForUser(
  userId: string,
): Promise<OrgListItem[]> {
  if (!featureFlags.gymTeamDashboard) return [];

  const rows = await prisma.orgMembership.findMany({
    where: { userId, status: "active" },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, kind: true, status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rows
    .filter((r) => r.organization.status === "active")
    .map((r) => {
      const role = isOrgMemberRole(r.role) ? r.role : "org_athlete";
      const kind = isOrgKind(r.organization.kind)
        ? r.organization.kind
        : "other";
      return {
        id: r.organization.id,
        name: r.organization.name,
        slug: r.organization.slug,
        kind: r.organization.kind,
        kindLabel: ORG_KIND_LABELS[kind],
        role,
        roleLabel: ORG_MEMBER_ROLE_LABELS[role],
      };
    });
}

/**
 * Create a gym/team org and make the creator org_admin.
 */
export async function createOrganization(input: {
  userId: string;
  name: string;
  kind?: string;
}): Promise<
  { ok: true; organizationId: string; slug: string } | { ok: false; error: string }
> {
  if (!featureFlags.gymTeamDashboard) {
    return { ok: false, error: "Gym / team dashboard is not enabled." };
  }

  const name = input.name.trim();
  if (name.length < 2) {
    return { ok: false, error: "Organization name must be at least 2 characters." };
  }

  const kind: OrgKind = isOrgKind(input.kind ?? "gym")
    ? (input.kind as OrgKind)
    : "gym";
  const slug = await uniqueSlug(name);

  const org = await prisma.$transaction(async (tx) => {
    const row = await tx.organization.create({
      data: {
        name,
        slug,
        kind,
        status: "active",
        createdByUserId: input.userId,
      },
    });
    await tx.orgMembership.create({
      data: {
        organizationId: row.id,
        userId: input.userId,
        role: "org_admin",
        status: "active",
        joinedAt: new Date(),
        aggregateOptIn: false,
      },
    });
    await tx.orgSubscription.create({
      data: {
        organizationId: row.id,
        plan: "org_free",
        status: "active",
      },
    });
    return row;
  });

  return { ok: true, organizationId: org.id, slug: org.slug };
}

export async function createTeam(input: {
  userId: string;
  organizationId: string;
  name: string;
}): Promise<{ ok: true; teamId: string } | { ok: false; error: string }> {
  if (!featureFlags.gymTeamDashboard) {
    return { ok: false, error: "Gym / team dashboard is not enabled." };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
  });
  if (!membership || membership.status !== "active") {
    return { ok: false, error: "Not a member of this organization." };
  }
  const role = isOrgMemberRole(membership.role)
    ? membership.role
    : "org_athlete";
  const principal = toPrincipal(role, membership.status, []);
  if (!canManageOrgTeams(principal)) {
    return { ok: false, error: "You cannot manage teams in this organization." };
  }

  const teamName = input.name.trim();
  if (teamName.length < 2) {
    return { ok: false, error: "Team name must be at least 2 characters." };
  }

  const team = await prisma.team.create({
    data: {
      organizationId: input.organizationId,
      name: teamName,
      status: "active",
    },
  });
  return { ok: true, teamId: team.id };
}

export async function setAggregateOptIn(input: {
  userId: string;
  organizationId: string;
  aggregateOptIn: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.gymTeamDashboard) {
    return { ok: false, error: "Gym / team dashboard is not enabled." };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
  });
  if (!membership || membership.status !== "active") {
    return { ok: false, error: "Membership not found." };
  }

  await prisma.orgMembership.update({
    where: { id: membership.id },
    data: { aggregateOptIn: input.aggregateOptIn },
  });
  return { ok: true };
}

/**
 * Org dashboard — training aggregates only; never recovery/body/media/notes.
 */
export async function getOrgDashboard(input: {
  userId: string;
  organizationId: string;
}): Promise<
  { ok: true; view: OrgDashboardView } | { ok: false; error: string }
> {
  if (!featureFlags.gymTeamDashboard) {
    return { ok: false, error: "Gym / team dashboard is not enabled." };
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId,
      },
    },
    include: {
      organization: true,
    },
  });

  if (!membership || membership.status !== "active") {
    return { ok: false, error: "Not a member of this organization." };
  }
  if (membership.organization.status !== "active") {
    return { ok: false, error: "Organization is archived." };
  }

  const role: OrgMemberRole = isOrgMemberRole(membership.role)
    ? membership.role
    : "org_athlete";

  const [allMembers, teams, orgPerms] = await Promise.all([
    prisma.orgMembership.findMany({
      where: {
        organizationId: input.organizationId,
        status: "active",
      },
      select: {
        id: true,
        userId: true,
        role: true,
        athleteProfileId: true,
        aggregateOptIn: true,
        status: true,
        athleteProfile: {
          select: {
            id: true,
            displayName: true,
            // Explicitly omit sex, birthYear, movementNotes
          },
        },
      },
    }),
    prisma.team.findMany({
      where: { organizationId: input.organizationId, status: "active" },
      select: {
        id: true,
        name: true,
        memberships: {
          where: { status: "active" },
          select: {
            userId: true,
            athleteProfileId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.orgPermission.findMany({
      where: { organizationId: input.organizationId },
      select: { principalType: true, principalKey: true, permissionsJson: true },
    }),
  ]);

  // Merge extra capabilities for viewer
  const extraCaps: OrgCapability[] = [];
  for (const p of orgPerms) {
    if (
      (p.principalType === "role" && p.principalKey === role) ||
      (p.principalType === "user" && p.principalKey === input.userId)
    ) {
      extraCaps.push(...parseOrgCapabilities(p.permissionsJson));
    }
  }
  const principalWithExtra = toPrincipal(role, membership.status, extraCaps);
  const canView = canViewOrgAggregates(principalWithExtra);

  const memberCounts = {
    totalActive: allMembers.length,
    coaches: allMembers.filter((m) => m.role === "org_coach").length,
    athletes: allMembers.filter((m) => m.role === "org_athlete").length,
    optedInAthletes: allMembers.filter(
      (m) =>
        m.role === "org_athlete" &&
        athleteIncludedInOrgAggregates({
          membershipStatus: m.status,
          aggregateOptIn: m.aggregateOptIn,
        }),
    ).length,
  };

  const teamViews = teams.map((t) => ({
    id: t.id,
    name: t.name,
    memberCount: t.memberships.length,
  }));

  let analytics: OrgAnalyticsSummary | null = null;
  let roster: OrgRosterRow[] = [];

  if (canView) {
    const optedIn = allMembers.filter((m) =>
      athleteIncludedInOrgAggregates({
        membershipStatus: m.status,
        aggregateOptIn: m.aggregateOptIn,
      }),
    );
    const profileIds = optedIn
      .map((m) => m.athleteProfileId)
      .filter((id): id is string => Boolean(id));

    const now = new Date();
    const d7 = daysAgo(7, now);
    const d14 = daysAgo(14, now);
    const d28 = daysAgo(28, now);

    const [sessions, techniqueRows] =
      profileIds.length > 0
        ? await Promise.all([
            prisma.trainingSession.findMany({
              where: {
                athleteProfileId: { in: profileIds },
                status: "completed",
                completedAt: { gte: d28 },
              },
              select: {
                athleteProfileId: true,
                completedAt: true,
              },
            }),
            prisma.techniqueAnalysis.findMany({
              where: {
                athleteProfileId: { in: profileIds },
                deletedAt: null,
                overallScore: { not: null },
                createdAt: { gte: d28 },
              },
              select: {
                athleteProfileId: true,
                overallScore: true,
                createdAt: true,
                // Never select storageKey / mediaUrl
              },
            }),
          ])
        : [[], []];

    const teamByAthlete = new Map<
      string,
      { ids: string[]; names: string[] }
    >();
    for (const team of teams) {
      for (const tm of team.memberships) {
        if (!tm.athleteProfileId) continue;
        const cur = teamByAthlete.get(tm.athleteProfileId) ?? {
          ids: [],
          names: [],
        };
        cur.ids.push(team.id);
        cur.names.push(team.name);
        teamByAthlete.set(tm.athleteProfileId, cur);
      }
    }

    const signals = optedIn
      .filter((m) => m.athleteProfileId)
      .map((m) => {
        const pid = m.athleteProfileId!;
        const athSessions = sessions.filter((s) => s.athleteProfileId === pid);
        const last7 = athSessions.filter(
          (s) => s.completedAt && s.completedAt >= d7,
        ).length;
        const last28 = athSessions.length;
        let adherencePct: number | null = null;
        if (last28 > 0) {
          adherencePct = Math.min(100, Math.round((last28 / 12) * 100));
        } else {
          adherencePct = 0;
        }

        const tech = techniqueRows.filter((t) => t.athleteProfileId === pid);
        const recent = tech.filter((t) => t.createdAt >= d14);
        const earlier = tech.filter(
          (t) => t.createdAt < d14 && t.createdAt >= d28,
        );
        const recentMean = mean(
          recent
            .map((t) => t.overallScore)
            .filter((v): v is number => v != null),
        );
        const earlierMean = mean(
          earlier
            .map((t) => t.overallScore)
            .filter((v): v is number => v != null),
        );
        let techniqueDelta: number | null = null;
        if (recentMean != null && earlierMean != null) {
          techniqueDelta = recentMean - earlierMean;
        }

        const teamsFor = teamByAthlete.get(pid) ?? { ids: [], names: [] };
        const label =
          m.athleteProfile?.displayName?.trim() ||
          `Athlete ${pid.slice(-6)}`;

        return {
          athleteProfileId: pid,
          displayName: label,
          teamIds: teamsFor.ids,
          teamNames: teamsFor.names,
          sessionsLast7d: last7,
          sessionsLast28d: last28,
          adherencePct,
          techniqueDelta,
        };
      });

    analytics = buildOrgAnalytics(
      signals,
      teams.map((t) => ({ id: t.id, name: t.name })),
    );
    roster = buildOrgRosterRows(signals);
  }

  const kind = isOrgKind(membership.organization.kind)
    ? membership.organization.kind
    : "other";

  const unlocks = orgRoleUnlocksPrivateAthleteData(principalWithExtra);

  return {
    ok: true,
    view: {
      honesty: ORG_GYM_HONESTY,
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        kind: membership.organization.kind,
        kindLabel: ORG_KIND_LABELS[kind],
      },
      viewer: {
        role,
        roleLabel: ORG_MEMBER_ROLE_LABELS[role],
        canViewAggregates: canView,
        canManageMembers: canManageOrgMembers(principalWithExtra),
        unlocksPrivateData: unlocks,
      },
      memberCounts,
      teams: teamViews,
      analytics,
      roster,
      selfMembership: {
        id: membership.id,
        role: membership.role,
        aggregateOptIn: membership.aggregateOptIn,
      },
    },
  };
}
