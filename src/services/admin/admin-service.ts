import { featureFlags, type FeatureFlagKey } from "@/config/feature-flags";
import { ACADEMY_COURSES } from "@/domain/academy/catalog";
import {
  ADMIN_HONESTY,
  type AdminAction,
  type AdminEntityType,
} from "@/domain/admin";
import { PRIORITY_EXERCISES } from "@/domain/exercises/priority-seed";
import { listHistoryEras } from "@/domain/history";
import { getPublishedMethods } from "@/domain/methods/catalog";
import { SEO_TOPIC_CLUSTERS } from "@/domain/seo/clusters";
import { prisma } from "@/lib/db";

export async function writeAdminAudit(input: {
  actorUserId: string;
  action: AdminAction;
  entityType: AdminEntityType;
  entityId?: string | null;
  summary: string;
  detail?: Record<string, unknown>;
}): Promise<{ id: string }> {
  const row = await prisma.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary.trim(),
      detailJson: JSON.stringify(input.detail ?? {}),
    },
  });
  return { id: row.id };
}

export async function listAdminAuditLogs(limit = 50) {
  const rows = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, email: true, name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    summary: row.summary,
    detailJson: row.detailJson,
    createdAt: row.createdAt.toISOString(),
    actorEmail: row.actor.email,
    actorName: row.actor.name,
  }));
}

export function getAdminDashboardSnapshot() {
  return {
    honesty: ADMIN_HONESTY,
    counts: {
      exercises: PRIORITY_EXERCISES.length,
      methods: getPublishedMethods().length,
      articles: SEO_TOPIC_CLUSTERS.length + listHistoryEras().length,
      academy: ACADEMY_COURSES.filter((c) => c.isPublished).length,
    },
  };
}

export function listAdminExercises() {
  return PRIORITY_EXERCISES.map((e) => ({
    id: e.slug,
    title: e.name,
    aliases: e.aliases ?? [],
    href: `/exercises/${e.slug}`,
    blurb: e.description ?? "",
  }));
}

export function listAdminMethods() {
  return getPublishedMethods().map((m) => ({
    id: m.slug,
    title: m.name,
    aliases: m.aliases ?? [],
    href: `/methods/${m.slug}`,
    blurb: m.summary,
  }));
}

export function listAdminArticles() {
  const learn = SEO_TOPIC_CLUSTERS.map((c) => ({
    id: `learn:${c.slug}`,
    title: c.title,
    kind: "pillar" as const,
    href: `/learn/${c.slug}`,
    blurb: c.description,
  }));
  const history = listHistoryEras().map((e) => ({
    id: `history:${e.slug}`,
    title: e.title,
    kind: "history" as const,
    href: `/history/${e.slug}`,
    blurb: e.teaser,
  }));
  return [...learn, ...history];
}

export function listAdminAcademy() {
  return ACADEMY_COURSES.filter((c) => c.isPublished).map((c) => ({
    id: c.slug,
    title: c.title,
    href: `/academy/${c.slug}`,
    blurb: c.summary,
    modules: c.modules.length,
  }));
}

export async function listAdminProgramTemplates() {
  const rows = await prisma.program.findMany({
    where: { kind: "template" },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
      description: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.name,
    status: r.status,
    updatedAt: r.updatedAt.toISOString(),
    blurb: r.description ?? "Program template",
  }));
}

export function listAdminFeatureFlags() {
  return (Object.keys(featureFlags) as FeatureFlagKey[]).map((key) => ({
    key,
    enabled: featureFlags[key],
    source: "environment" as const,
  }));
}

export async function recordContentReview(input: {
  actorUserId: string;
  entityType: Exclude<AdminEntityType, "feature_flag" | "system">;
  entityId: string;
  note?: string;
}) {
  const summary = input.note?.trim()
    ? `Reviewed ${input.entityType} “${input.entityId}”: ${input.note.trim()}`
    : `Reviewed ${input.entityType} “${input.entityId}”`;
  return writeAdminAudit({
    actorUserId: input.actorUserId,
    action: input.note?.trim() ? "content.note" : "content.reviewed",
    entityType: input.entityType,
    entityId: input.entityId,
    summary,
    detail: { note: input.note?.trim() || null },
  });
}

export async function recordFeatureFlagsReview(input: {
  actorUserId: string;
  note?: string;
}) {
  const flags = listAdminFeatureFlags();
  return writeAdminAudit({
    actorUserId: input.actorUserId,
    action: "flags.reviewed",
    entityType: "feature_flag",
    entityId: null,
    summary: input.note?.trim() || "Reviewed live feature flag configuration",
    detail: {
      flags: Object.fromEntries(flags.map((f) => [f.key, f.enabled])),
      note: input.note?.trim() || null,
    },
  });
}

export async function recordAdminAccess(actorUserId: string) {
  return writeAdminAudit({
    actorUserId,
    action: "admin.access",
    entityType: "system",
    summary: "Opened admin console",
  });
}
