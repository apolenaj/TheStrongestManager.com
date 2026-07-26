/**
 * Content Moderation service (Prompt 139).
 * Report → Review → Remove / Suspend + append-only audit log.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  CONTENT_MODERATION_ACTION_LABELS,
  CONTENT_MODERATION_ENGINE_VERSION,
  CONTENT_MODERATION_HONESTY,
  CONTENT_MODERATION_REPORT_REASON_LABELS,
  CONTENT_MODERATION_REPORT_STATUS_LABELS,
  CONTENT_MODERATION_TARGET_LABELS,
  isContentModerationAction,
  isContentModerationRelatedType,
  isContentModerationReportReason,
  isContentModerationReportStatus,
  nextReportStatusAfterAction,
  targetForRelatedType,
  type ContentModerationAction,
  type ContentModerationRelatedType,
  type ContentModerationReportReason,
  type ContentModerationReportStatus,
  type ContentModerationTarget,
} from "@/domain/content-moderation";
import { prisma } from "@/lib/db";
import { trackProductEventSafe } from "@/services/analytics/track";
import { moderateCommunityContent } from "@/services/community-qa/community-qa-service";
import { moderateMessage } from "@/services/messaging/messaging-service";
import { reviewProgramMarketplaceListing } from "@/services/program-marketplace/program-marketplace-service";

export type ContentModerationReportView = {
  id: string;
  target: ContentModerationTarget;
  targetLabel: string;
  relatedType: string;
  relatedId: string;
  reason: string;
  reasonLabel: string;
  details: string | null;
  status: ContentModerationReportStatus;
  statusLabel: string;
  createdAt: string;
  reviewedAt: string | null;
  resolutionAction: string | null;
};

export type ContentModerationAuditView = {
  id: string;
  action: string;
  actionLabel: string;
  target: string;
  relatedType: string;
  relatedId: string;
  reasonCode: string | null;
  createdAt: string;
  reportId: string | null;
};

async function writeAudit(input: {
  reportId?: string | null;
  action: ContentModerationAction;
  target: ContentModerationTarget;
  relatedType: string;
  relatedId: string;
  reasonCode?: string | null;
  note?: string | null;
  actorUserId: string;
}) {
  return prisma.contentModerationAuditLog.create({
    data: {
      reportId: input.reportId ?? null,
      action: input.action,
      target: input.target,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      reasonCode: input.reasonCode ?? null,
      note: input.note?.trim().slice(0, 1000) || null,
      actorUserId: input.actorUserId,
      engineVersion: CONTENT_MODERATION_ENGINE_VERSION,
    },
  });
}

/**
 * Apply domain-specific remove/suspend/restore via existing adapters.
 * Fail closed — unknown types get audit only + error for mutating actions.
 */
async function applyTargetMutation(input: {
  action: "remove" | "suspend" | "restore";
  relatedType: ContentModerationRelatedType;
  relatedId: string;
  actorUserId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const note = input.note ?? null;

  if (input.relatedType === "community_question") {
    const action =
      input.action === "restore"
        ? "restore"
        : input.action === "remove"
          ? "remove"
          : "hide";
    return moderateCommunityContent(input.actorUserId, {
      kind: "question",
      id: input.relatedId,
      action,
      reason: note,
    });
  }

  if (input.relatedType === "community_answer") {
    const action =
      input.action === "restore"
        ? "restore"
        : input.action === "remove"
          ? "remove"
          : "hide";
    return moderateCommunityContent(input.actorUserId, {
      kind: "answer",
      id: input.relatedId,
      action,
      reason: note,
    });
  }

  if (input.relatedType === "program_listing") {
    if (input.action === "suspend" || input.action === "remove") {
      return reviewProgramMarketplaceListing({
        listingId: input.relatedId,
        actorUserId: input.actorUserId,
        toStatus: "suspended",
        reviewNote: note,
      });
    }
    if (input.action === "restore") {
      return reviewProgramMarketplaceListing({
        listingId: input.relatedId,
        actorUserId: input.actorUserId,
        toStatus: "published",
        reviewNote: note,
      });
    }
  }

  if (input.relatedType === "coach_marketplace_profile") {
    const profile = await prisma.coachMarketplaceProfile.findUnique({
      where: { id: input.relatedId },
    });
    if (!profile) return { ok: false, error: "Coach profile not found." };
    if (input.action === "suspend" || input.action === "remove") {
      await prisma.coachMarketplaceProfile.update({
        where: { id: profile.id },
        data: {
          listingStatus: "suspended",
          suspendedAt: new Date(),
        },
      });
      return { ok: true };
    }
    if (input.action === "restore") {
      await prisma.coachMarketplaceProfile.update({
        where: { id: profile.id },
        data: {
          listingStatus: "published",
          suspendedAt: null,
          publishedAt: profile.publishedAt ?? new Date(),
        },
      });
      return { ok: true };
    }
  }

  if (input.relatedType === "message") {
    const action =
      input.action === "restore"
        ? "restore"
        : input.action === "remove"
          ? "remove"
          : "hide";
    return moderateMessage({
      adminUserId: input.actorUserId,
      messageId: input.relatedId,
      action,
      reason: note,
    });
  }

  // expert_article / other_ugc / message_thread — audit-only until dedicated adapters.
  if (
    input.relatedType === "expert_article" ||
    input.relatedType === "other_ugc" ||
    input.relatedType === "message_thread"
  ) {
    return { ok: true };
  }

  return { ok: false, error: "No moderation adapter for this content type." };
}

export async function submitContentModerationReport(input: {
  reporterUserId: string;
  relatedType: string;
  relatedId: string;
  reason: string;
  details?: string | null;
}): Promise<
  | { ok: true; reportId: string; message: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.contentModeration) {
    return { ok: false, error: "Content Moderation is not enabled." };
  }
  if (!isContentModerationRelatedType(input.relatedType)) {
    return { ok: false, error: "Invalid content type." };
  }
  if (!isContentModerationReportReason(input.reason)) {
    return { ok: false, error: "Choose a valid report reason." };
  }
  const relatedId = input.relatedId.trim();
  if (!relatedId) return { ok: false, error: "Missing content id." };

  const target = targetForRelatedType(input.relatedType);

  // Soft dedupe: one open report per reporter+content.
  const existing = await prisma.contentModerationReport.findFirst({
    where: {
      reporterUserId: input.reporterUserId,
      relatedType: input.relatedType,
      relatedId,
      status: { in: ["open", "in_review"] },
    },
  });
  if (existing) {
    return {
      ok: true,
      reportId: existing.id,
      message: "You already have an open report for this content.",
    };
  }

  const report = await prisma.contentModerationReport.create({
    data: {
      target,
      relatedType: input.relatedType,
      relatedId,
      reason: input.reason,
      details: input.details?.trim().slice(0, 2000) || null,
      status: "open",
      reporterUserId: input.reporterUserId,
      engineVersion: CONTENT_MODERATION_ENGINE_VERSION,
    },
  });

  await writeAudit({
    reportId: report.id,
    action: "report",
    target,
    relatedType: input.relatedType,
    relatedId,
    reasonCode: input.reason,
    note: input.details,
    actorUserId: input.reporterUserId,
  });

  trackProductEventSafe({
    name: "content_moderation_reported",
    props: {
      reportId: report.id,
      target,
      relatedType: input.relatedType,
      reason: input.reason,
    },
    userId: input.reporterUserId,
  });

  return {
    ok: true,
    reportId: report.id,
    message: "Report submitted. Staff will review — thank you.",
  };
}

export async function listContentModerationQueue(input: {
  actorUserId: string;
}): Promise<
  | {
      ok: true;
      reports: ContentModerationReportView[];
      honesty: readonly string[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.contentModeration) {
    return { ok: false, error: "Content Moderation is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) return { ok: false, error: "Staff only." };

  const rows = await prisma.contentModerationReport.findMany({
    where: { status: { in: ["open", "in_review"] } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return {
    ok: true,
    honesty: CONTENT_MODERATION_HONESTY,
    reports: rows.map((r) => {
      const status = isContentModerationReportStatus(r.status)
        ? r.status
        : ("open" as const);
      const target = r.target as ContentModerationTarget;
      return {
        id: r.id,
        target,
        targetLabel: CONTENT_MODERATION_TARGET_LABELS[target] ?? r.target,
        relatedType: r.relatedType,
        relatedId: r.relatedId,
        reason: r.reason,
        reasonLabel:
          CONTENT_MODERATION_REPORT_REASON_LABELS[
            r.reason as ContentModerationReportReason
          ] ?? r.reason,
        details: r.details,
        status,
        statusLabel: CONTENT_MODERATION_REPORT_STATUS_LABELS[status],
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        resolutionAction: r.resolutionAction,
      };
    }),
  };
}

export async function listContentModerationAuditLog(input: {
  actorUserId: string;
  limit?: number;
}): Promise<
  | { ok: true; entries: ContentModerationAuditView[] }
  | { ok: false; error: string }
> {
  if (!featureFlags.contentModeration) {
    return { ok: false, error: "Content Moderation is not enabled." };
  }
  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) return { ok: false, error: "Staff only." };

  const rows = await prisma.contentModerationAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 50,
  });

  return {
    ok: true,
    entries: rows.map((e) => ({
      id: e.id,
      action: e.action,
      actionLabel:
        CONTENT_MODERATION_ACTION_LABELS[e.action as ContentModerationAction] ??
        e.action,
      target: e.target,
      relatedType: e.relatedType,
      relatedId: e.relatedId,
      reasonCode: e.reasonCode,
      createdAt: e.createdAt.toISOString(),
      reportId: e.reportId,
    })),
  };
}

export async function reviewContentModerationReport(input: {
  reportId: string;
  actorUserId: string;
  action: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.contentModeration) {
    return { ok: false, error: "Content Moderation is not enabled." };
  }
  if (!isContentModerationAction(input.action)) {
    return { ok: false, error: "Invalid moderation action." };
  }
  if (input.action === "report") {
    return { ok: false, error: "Use the report flow to file reports." };
  }

  const actor = await prisma.user.findUnique({
    where: { id: input.actorUserId },
    select: { isAdmin: true },
  });
  if (!actor?.isAdmin) {
    return { ok: false, error: "Only staff can review reports." };
  }

  const report = await prisma.contentModerationReport.findUnique({
    where: { id: input.reportId },
  });
  if (!report) return { ok: false, error: "Report not found." };
  if (!isContentModerationReportStatus(report.status)) {
    return { ok: false, error: "Invalid report status." };
  }
  if (report.status === "resolved" || report.status === "dismissed") {
    return { ok: false, error: "Report is already closed." };
  }
  if (!isContentModerationRelatedType(report.relatedType)) {
    return { ok: false, error: "Unknown related type on report." };
  }

  const nextStatus = nextReportStatusAfterAction(
    input.action,
    report.status,
  );

  if (
    input.action === "remove" ||
    input.action === "suspend" ||
    input.action === "restore"
  ) {
    const mutated = await applyTargetMutation({
      action: input.action,
      relatedType: report.relatedType,
      relatedId: report.relatedId,
      actorUserId: input.actorUserId,
      note: input.note,
    });
    if (!mutated.ok) return mutated;
  }

  const now = new Date();
  if (nextStatus) {
    await prisma.contentModerationReport.update({
      where: { id: report.id },
      data: {
        status: nextStatus,
        reviewedByUserId: input.actorUserId,
        reviewedAt: now,
        resolutionAction:
          input.action === "review" ? report.resolutionAction : input.action,
        resolutionNote: input.note?.trim().slice(0, 1000) || null,
      },
    });
  } else if (input.action === "note") {
    await prisma.contentModerationReport.update({
      where: { id: report.id },
      data: {
        reviewedByUserId: input.actorUserId,
        reviewedAt: report.reviewedAt ?? now,
      },
    });
  }

  await writeAudit({
    reportId: report.id,
    action: input.action,
    target: report.target as ContentModerationTarget,
    relatedType: report.relatedType,
    relatedId: report.relatedId,
    reasonCode: report.reason,
    note: input.note,
    actorUserId: input.actorUserId,
  });

  trackProductEventSafe({
    name: "content_moderation_reviewed",
    props: {
      reportId: report.id,
      action: input.action,
      target: report.target,
      relatedType: report.relatedType,
    },
    userId: input.actorUserId,
  });

  if (input.action === "remove" || input.action === "suspend") {
    trackProductEventSafe({
      name:
        input.action === "remove"
          ? "content_moderation_removed"
          : "content_moderation_suspended",
      props: {
        reportId: report.id,
        target: report.target,
        relatedType: report.relatedType,
      },
      userId: input.actorUserId,
    });
  }

  return { ok: true };
}

export async function getContentModerationHubView(input: {
  actorUserId: string;
}): Promise<
  | {
      ok: true;
      reports: ContentModerationReportView[];
      audit: ContentModerationAuditView[];
      honesty: readonly string[];
    }
  | { ok: false; error: string }
> {
  const queue = await listContentModerationQueue({
    actorUserId: input.actorUserId,
  });
  if (!queue.ok) return queue;
  const audit = await listContentModerationAuditLog({
    actorUserId: input.actorUserId,
    limit: 40,
  });
  if (!audit.ok) return audit;
  return {
    ok: true,
    reports: queue.reports,
    audit: audit.entries,
    honesty: queue.honesty,
  };
}
