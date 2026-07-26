/**
 * Paid Expert Technique Review orders (Prompt 96).
 */

import { featureFlags } from "@/config/feature-flags";
import { getActiveBillingProvider } from "@/domain/billing/provider";
import { isVerifiedExpertContributor } from "@/domain/expert-contributor";
import {
  HUMAN_ANALYSIS_ENGINE_VERSION,
  HUMAN_ANALYSIS_HONESTY,
  HUMAN_ANALYSIS_ORDER_STATUS_LABELS,
  buildHumanAnalysisTimeline,
  canTransitionHumanAnalysisStatus,
  formatTurnaroundPromise,
  getHumanAnalysisCapacity,
  getHumanAnalysisCatalog,
  getHumanAnalysisProduct,
  isHumanAnalysisOrderStatus,
  isHumanAnalysisProductSku,
  nextStatusAfterPurchase,
  type HumanAnalysisOrderStatus,
  type HumanAnalysisProductSku,
} from "@/domain/human-analysis";
import { prisma } from "@/lib/db";

async function requireAthleteProfile(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return null;
  return profile;
}

async function assertVerifiedExpert(userId: string) {
  const profile = await prisma.expertContributorProfile.findUnique({
    where: { userId },
    select: { verificationStatus: true },
  });
  if (!profile || !isVerifiedExpertContributor(profile.verificationStatus)) {
    return {
      ok: false as const,
      error: "Only verified Expert Contributors may review paid orders.",
    };
  }
  return { ok: true as const };
}

function toOrderView(row: {
  id: string;
  productSku: string;
  status: string;
  paymentStatus: string;
  amountCents: number | null;
  currency: string;
  techniqueAnalysisId: string | null;
  programId: string | null;
  competitionPrepId: string | null;
  athleteNote: string | null;
  expertSummary: string | null;
  expertReportJson: string;
  purchasedAt: Date | null;
  queuedAt: Date | null;
  assignedAt: Date | null;
  reportReadyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const status = isHumanAnalysisOrderStatus(row.status)
    ? row.status
    : ("awaiting_purchase" as HumanAnalysisOrderStatus);
  const product = isHumanAnalysisProductSku(row.productSku)
    ? getHumanAnalysisProduct(row.productSku)
    : undefined;

  return {
    id: row.id,
    productSku: row.productSku as HumanAnalysisProductSku,
    productName: product?.name ?? row.productSku,
    status,
    statusLabel: HUMAN_ANALYSIS_ORDER_STATUS_LABELS[status],
    paymentStatus: row.paymentStatus,
    amountCents: row.amountCents,
    currency: row.currency,
    techniqueAnalysisId: row.techniqueAnalysisId,
    programId: row.programId,
    competitionPrepId: row.competitionPrepId,
    athleteNote: row.athleteNote,
    expertSummary: row.expertSummary,
    expertReportJson: row.expertReportJson,
    purchasedAt: row.purchasedAt,
    queuedAt: row.queuedAt,
    assignedAt: row.assignedAt,
    reportReadyAt: row.reportReadyAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    timeline: buildHumanAnalysisTimeline(status),
  };
}

export async function getHumanAnalysisAthleteHome(userId: string): Promise<{
  enabled: boolean;
  honesty: readonly string[];
  catalog: ReturnType<typeof getHumanAnalysisCatalog>;
  capacity: ReturnType<typeof getHumanAnalysisCapacity>;
  turnaroundPromise: string | null;
  checkoutReady: boolean;
  orders: ReturnType<typeof toOrderView>[];
}> {
  const capacity = getHumanAnalysisCapacity();
  const provider = getActiveBillingProvider();
  const checkoutReady =
    featureFlags.humanAnalysisProduct &&
    featureFlags.billingCheckout &&
    provider.status === "ready";

  if (!featureFlags.humanAnalysisProduct) {
    return {
      enabled: false,
      honesty: HUMAN_ANALYSIS_HONESTY,
      catalog: getHumanAnalysisCatalog(),
      capacity,
      turnaroundPromise: formatTurnaroundPromise(capacity),
      checkoutReady: false,
      orders: [],
    };
  }

  const profile = await requireAthleteProfile(userId);
  const orders = profile
    ? await prisma.humanAnalysisOrder.findMany({
        where: { athleteProfileId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : [];

  return {
    enabled: true,
    honesty: HUMAN_ANALYSIS_HONESTY,
    catalog: getHumanAnalysisCatalog(),
    capacity,
    turnaroundPromise: formatTurnaroundPromise(capacity),
    checkoutReady,
    orders: orders.map(toOrderView),
  };
}

/**
 * Start an order (awaiting purchase). Does not invent a paid entitlement.
 */
export async function createHumanAnalysisOrder(input: {
  userId: string;
  productSku: string;
  athleteNote?: string;
  techniqueAnalysisId?: string | null;
  programId?: string | null;
  competitionPrepId?: string | null;
}): Promise<
  { ok: true; orderId: string } | { ok: false; error: string }
> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  if (!isHumanAnalysisProductSku(input.productSku)) {
    return { ok: false, error: "Unknown product." };
  }

  const product = getHumanAnalysisProduct(input.productSku)!;
  const profile = await requireAthleteProfile(input.userId);
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  if (input.techniqueAnalysisId) {
    const analysis = await prisma.techniqueAnalysis.findFirst({
      where: {
        id: input.techniqueAnalysisId,
        athleteProfileId: profile.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!analysis) {
      return { ok: false, error: "Technique analysis not found." };
    }
  }

  const row = await prisma.humanAnalysisOrder.create({
    data: {
      athleteProfileId: profile.id,
      productSku: input.productSku,
      status: "awaiting_purchase",
      paymentStatus: "unpaid",
      amountCents: product.amountCents,
      currency: product.currency,
      athleteNote: input.athleteNote?.trim().slice(0, 2000) || null,
      techniqueAnalysisId: input.techniqueAnalysisId ?? null,
      programId: input.programId ?? null,
      competitionPrepId: input.competitionPrepId ?? null,
      engineVersion: HUMAN_ANALYSIS_ENGINE_VERSION,
    },
  });

  return { ok: true, orderId: row.id };
}

/**
 * Mark order paid after Stripe webhook (or verified payment adapter).
 * Never call from a client “fake pay” control in production.
 */
export async function activateHumanAnalysisPayment(input: {
  orderId: string;
  externalRef: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus?: "paid" | "waived_dev";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }

  const existing = await prisma.humanAnalysisOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!existing) return { ok: false, error: "Order not found." };

  if (
    existing.paymentStatus === "paid" ||
    existing.paymentStatus === "waived_dev"
  ) {
    return { ok: true };
  }

  if (existing.status !== "awaiting_purchase") {
    return { ok: false, error: "Order is not awaiting purchase." };
  }

  const hasArtifacts = Boolean(
    existing.techniqueAnalysisId ||
      existing.programId ||
      existing.competitionPrepId,
  );
  const next = nextStatusAfterPurchase(hasArtifacts);
  const now = new Date();
  const capacity = getHumanAnalysisCapacity();

  await prisma.humanAnalysisOrder.update({
    where: { id: existing.id },
    data: {
      status: next,
      paymentStatus: input.paymentStatus ?? "paid",
      purchasedAt: now,
      queuedAt: next === "queued" ? now : null,
      externalRef: input.externalRef,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
      stripePaymentIntentId: input.stripePaymentIntentId ?? null,
      capacitySnapshotJson: JSON.stringify({
        intakeOpen: capacity.intakeOpen,
        estimatedTurnaroundBusinessDays:
          capacity.estimatedTurnaroundBusinessDays,
        athleteMessage: capacity.athleteMessage,
        snapshottedAt: now.toISOString(),
      }),
    },
  });

  return { ok: true };
}

/**
 * Development-only activation when checkout is not ready — never production fake pay.
 */
export async function activateHumanAnalysisPaymentForDevelopment(input: {
  userId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (process.env.NODE_ENV === "production") {
    return {
      ok: false,
      error: "Development payment activation is not available in production.",
    };
  }
  const profile = await requireAthleteProfile(input.userId);
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const order = await prisma.humanAnalysisOrder.findFirst({
    where: { id: input.orderId, athleteProfileId: profile.id },
  });
  if (!order) return { ok: false, error: "Order not found." };

  return activateHumanAnalysisPayment({
    orderId: order.id,
    externalRef: `dev_waive:${order.id}`,
    paymentStatus: "waived_dev",
  });
}

export async function attachHumanAnalysisArtifacts(input: {
  userId: string;
  orderId: string;
  techniqueAnalysisId?: string | null;
  programId?: string | null;
  competitionPrepId?: string | null;
  athleteNote?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const profile = await requireAthleteProfile(input.userId);
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const order = await prisma.humanAnalysisOrder.findFirst({
    where: { id: input.orderId, athleteProfileId: profile.id },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (
    order.status !== "purchased" &&
    order.status !== "awaiting_upload" &&
    order.status !== "awaiting_purchase"
  ) {
    return { ok: false, error: "Artifacts can no longer be changed." };
  }

  if (input.techniqueAnalysisId) {
    const analysis = await prisma.techniqueAnalysis.findFirst({
      where: {
        id: input.techniqueAnalysisId,
        athleteProfileId: profile.id,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!analysis) return { ok: false, error: "Technique analysis not found." };
  }

  await prisma.humanAnalysisOrder.update({
    where: { id: order.id },
    data: {
      techniqueAnalysisId:
        input.techniqueAnalysisId === undefined
          ? order.techniqueAnalysisId
          : input.techniqueAnalysisId,
      programId:
        input.programId === undefined ? order.programId : input.programId,
      competitionPrepId:
        input.competitionPrepId === undefined
          ? order.competitionPrepId
          : input.competitionPrepId,
      athleteNote:
        input.athleteNote !== undefined
          ? input.athleteNote.trim().slice(0, 2000) || null
          : order.athleteNote,
    },
  });

  return { ok: true };
}

export async function submitHumanAnalysisToQueue(input: {
  userId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const profile = await requireAthleteProfile(input.userId);
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const order = await prisma.humanAnalysisOrder.findFirst({
    where: { id: input.orderId, athleteProfileId: profile.id },
  });
  if (!order) return { ok: false, error: "Order not found." };

  if (
    order.paymentStatus !== "paid" &&
    order.paymentStatus !== "waived_dev"
  ) {
    return { ok: false, error: "Purchase required before queuing." };
  }

  if (
    !canTransitionHumanAnalysisStatus(
      order.status as HumanAnalysisOrderStatus,
      "queued",
    ) &&
    order.status !== "queued"
  ) {
    return { ok: false, error: `Cannot queue from ${order.status}.` };
  }

  const sku = order.productSku as HumanAnalysisProductSku;
  if (sku === "single_lift_review" && !order.techniqueAnalysisId) {
    return {
      ok: false,
      error: "Attach a technique analysis (upload) before queuing.",
    };
  }
  if (sku === "full_training_review" && !order.programId) {
    return {
      ok: false,
      error: "Attach a program id before queuing a training review.",
    };
  }
  if (sku === "competition_prep_review" && !order.competitionPrepId) {
    return {
      ok: false,
      error: "Attach a competition prep plan before queuing.",
    };
  }

  if (order.status === "queued") return { ok: true };

  const capacity = getHumanAnalysisCapacity();
  const now = new Date();

  await prisma.humanAnalysisOrder.update({
    where: { id: order.id },
    data: {
      status: "queued",
      queuedAt: now,
      capacitySnapshotJson: JSON.stringify({
        intakeOpen: capacity.intakeOpen,
        estimatedTurnaroundBusinessDays:
          capacity.estimatedTurnaroundBusinessDays,
        athleteMessage: capacity.athleteMessage,
        snapshottedAt: now.toISOString(),
      }),
    },
  });

  return { ok: true };
}

export async function getHumanAnalysisOrderForAthlete(input: {
  userId: string;
  orderId: string;
}): Promise<
  | {
      ok: true;
      order: ReturnType<typeof toOrderView>;
      capacity: ReturnType<typeof getHumanAnalysisCapacity>;
      turnaroundPromise: string | null;
      honesty: readonly string[];
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const profile = await requireAthleteProfile(input.userId);
  if (!profile) return { ok: false, error: "Athlete profile required." };

  const order = await prisma.humanAnalysisOrder.findFirst({
    where: { id: input.orderId, athleteProfileId: profile.id },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const capacity = getHumanAnalysisCapacity();
  return {
    ok: true,
    order: toOrderView(order),
    capacity,
    turnaroundPromise: formatTurnaroundPromise(capacity),
    honesty: HUMAN_ANALYSIS_HONESTY,
  };
}

export async function listQueuedHumanAnalysisOrders(input: {
  expertUserId: string;
}): Promise<
  | {
      ok: true;
      items: Array<{
        orderId: string;
        productSku: string;
        productName: string;
        status: string;
        queuedAt: Date | null;
        athleteLabel: string;
      }>;
      honesty: readonly string[];
      capacityMessage: string;
    }
  | { ok: false; error: string }
> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const capacity = getHumanAnalysisCapacity();
  const rows = await prisma.humanAnalysisOrder.findMany({
    where: { status: { in: ["queued", "in_review"] } },
    orderBy: [{ status: "asc" }, { queuedAt: "asc" }],
    take: 50,
    include: {
      athleteProfile: { select: { displayName: true } },
    },
  });

  return {
    ok: true,
    honesty: HUMAN_ANALYSIS_HONESTY,
    capacityMessage: capacity.expertMessage,
    items: rows.map((r) => ({
      orderId: r.id,
      productSku: r.productSku,
      productName:
        getHumanAnalysisProduct(r.productSku as HumanAnalysisProductSku)
          ?.name ?? r.productSku,
      status: r.status,
      queuedAt: r.queuedAt,
      athleteLabel: r.athleteProfile.displayName?.trim() || "Athlete",
    })),
  };
}

export async function claimHumanAnalysisOrder(input: {
  expertUserId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const order = await prisma.humanAnalysisOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!order || order.status !== "queued") {
    return { ok: false, error: "Order is not in the queue." };
  }

  await prisma.humanAnalysisOrder.update({
    where: { id: order.id },
    data: {
      status: "in_review",
      expertUserId: input.expertUserId,
      assignedAt: new Date(),
    },
  });

  return { ok: true };
}

export async function submitHumanAnalysisExpertReport(input: {
  expertUserId: string;
  orderId: string;
  summary: string;
  reportJson?: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const summary = input.summary.trim();
  if (summary.length < 20) {
    return { ok: false, error: "Report summary is too short." };
  }

  const order = await prisma.humanAnalysisOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "in_review" && order.status !== "queued") {
    return { ok: false, error: "Order is not under review." };
  }
  if (order.expertUserId && order.expertUserId !== input.expertUserId) {
    return { ok: false, error: "Another expert owns this order." };
  }

  const now = new Date();
  await prisma.humanAnalysisOrder.update({
    where: { id: order.id },
    data: {
      status: "report_ready",
      expertUserId: input.expertUserId,
      expertSummary: summary.slice(0, 8000),
      expertReportJson: JSON.stringify(input.reportJson ?? { summary }),
      assignedAt: order.assignedAt ?? now,
      reportReadyAt: now,
    },
  });

  return { ok: true };
}

export async function getHumanAnalysisOrderForExpert(input: {
  expertUserId: string;
  orderId: string;
}): Promise<
  | { ok: true; order: ReturnType<typeof toOrderView> }
  | { ok: false; error: string }
> {
  if (!featureFlags.humanAnalysisProduct) {
    return { ok: false, error: "Expert Technique Review is not enabled." };
  }
  const gate = await assertVerifiedExpert(input.expertUserId);
  if (!gate.ok) return gate;

  const order = await prisma.humanAnalysisOrder.findUnique({
    where: { id: input.orderId },
  });
  if (!order) return { ok: false, error: "Order not found." };

  return { ok: true, order: toOrderView(order) };
}
