import { prisma } from "@/lib/db";
import {
  isProgramCatalogExperience,
  isProgramCatalogGoal,
  isProgramCatalogSchedule,
  slugsMatchingGoal,
  type ProgramCatalogExperience,
  type ProgramCatalogGoal,
  type ProgramCatalogSchedule,
} from "@/domain/program-catalog/catalog";
import {
  mergeCatalogWithSeed,
  seedToPublicProgramProduct,
  toEntitledProgramProduct,
  toPublicProgramProduct,
  type PublicEntitlement,
  type PublicProgramDetail,
  type PublicProgramProduct,
} from "@/domain/program-catalog/public";
import { seedDefinitionBySlug } from "@/domain/program-catalog/catalog";

export type ProgramCatalogListFilters = {
  goal?: ProgramCatalogGoal;
  experience?: ProgramCatalogExperience;
  schedule?: ProgramCatalogSchedule;
};

export type ProgramCatalogListResult =
  | { ok: true; programs: PublicProgramProduct[] }
  | { ok: false; error: "validation_error"; message: string };

export type ProgramCatalogDetailResult =
  | { ok: true; program: PublicProgramDetail }
  | { ok: false; error: "not_found" | "validation_error"; message: string };

export type UserEntitlementsResult =
  | { ok: true; entitlements: PublicEntitlement[] }
  | { ok: false; error: "unauthorized"; message: string };

type ParsedFilters =
  | { ok: true; filters: ProgramCatalogListFilters }
  | { ok: false; error: "validation_error"; message: string };

function parseFilters(raw: {
  goal?: string | null;
  experience?: string | null;
  schedule?: string | null;
}): ParsedFilters {
  const filters: ProgramCatalogListFilters = {};

  if (raw.goal) {
    if (!isProgramCatalogGoal(raw.goal)) {
      return {
        ok: false,
        error: "validation_error",
        message:
          "Invalid goal. Use strength, powerlifting, hypertrophy, general_strength, or competition_prep.",
      };
    }
    filters.goal = raw.goal;
  }

  if (raw.experience) {
    if (!isProgramCatalogExperience(raw.experience)) {
      return {
        ok: false,
        error: "validation_error",
        message: "Invalid experience. Use beginner, intermediate, or advanced.",
      };
    }
    filters.experience = raw.experience;
  }

  if (raw.schedule) {
    if (!isProgramCatalogSchedule(raw.schedule)) {
      return {
        ok: false,
        error: "validation_error",
        message: "Invalid schedule. Use 3day, 4day, 5day, or 6day.",
      };
    }
    filters.schedule = raw.schedule;
  }

  return { ok: true, filters };
}

/**
 * Public catalog — published products only. Never returns stripePriceId.
 */
export async function listPublicProgramCatalog(raw: {
  goal?: string | null;
  experience?: string | null;
  schedule?: string | null;
}): Promise<ProgramCatalogListResult> {
  const parsed = parseFilters(raw);
  if (!parsed.ok) return parsed;

  const where: {
    status: "published";
    difficulty?: string;
    availableSchedules?: { has: string };
    slug?: { in: string[] };
  } = { status: "published" };

  if (parsed.filters.experience) {
    where.difficulty = parsed.filters.experience;
  }
  if (parsed.filters.schedule) {
    where.availableSchedules = { has: parsed.filters.schedule };
  }
  if (parsed.filters.goal) {
    where.slug = { in: slugsMatchingGoal(parsed.filters.goal) };
  }

  const rows = await prisma.programProduct.findMany({
    where,
    orderBy: [{ isFree: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      methodId: true,
      durationWeeks: true,
      availableSchedules: true,
      difficulty: true,
      recoveryDemand: true,
      isFree: true,
      status: true,
      defaultCurrency: true,
      displayPrice: true,
      bundleIds: true,
      // stripePriceId intentionally omitted
    },
  });

  const programs = mergeCatalogWithSeed(
    rows
      .map(toPublicProgramProduct)
      .filter((p): p is PublicProgramProduct => p !== null),
  );

  return { ok: true, programs };
}

/**
 * Public detail by slug — published only. Template prescriptions are not exposed.
 */
export async function getPublicProgramBySlug(
  slugRaw: string,
): Promise<ProgramCatalogDetailResult> {
  const slug = slugRaw.trim().toLowerCase();
  if (!slug || slug.length > 120) {
    return {
      ok: false,
      error: "validation_error",
      message: "Invalid program slug.",
    };
  }

  const row = await prisma.programProduct.findFirst({
    where: { slug, status: "published" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      methodId: true,
      durationWeeks: true,
      availableSchedules: true,
      difficulty: true,
      recoveryDemand: true,
      isFree: true,
      status: true,
      defaultCurrency: true,
      displayPrice: true,
      bundleIds: true,
      versions: {
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          version: true,
          releaseNotes: true,
          templates: {
            select: { scheduleVariant: true },
            orderBy: { scheduleVariant: "asc" },
          },
        },
      },
    },
  });

  if (!row) {
    const seed = seedDefinitionBySlug(slug);
    if (!seed) {
      return { ok: false, error: "not_found", message: "Program not found." };
    }
    return {
      ok: true,
      program: {
        ...seedToPublicProgramProduct(seed),
        versions: [],
      },
    };
  }

  const product = toPublicProgramProduct(row);
  if (!product) {
    return { ok: false, error: "not_found", message: "Program not found." };
  }

  return {
    ok: true,
    program: {
      ...product,
      versions: row.versions.map((v) => ({
        id: v.id,
        version: v.version,
        releaseNotes: v.releaseNotes,
        scheduleVariants: v.templates.map((t) => t.scheduleVariant),
      })),
    },
  };
}

/**
 * Programs the user is entitled to. Omits Stripe / order provider secrets.
 */
export async function listUserProgramEntitlements(
  userId: string | null | undefined,
): Promise<UserEntitlementsResult> {
  if (!userId) {
    return {
      ok: false,
      error: "unauthorized",
      message: "Unauthorized.",
    };
  }

  const now = new Date();
  const rows = await prisma.programEntitlement.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { grantedAt: "desc" },
    select: {
      id: true,
      source: true,
      grantedAt: true,
      expiresAt: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          methodId: true,
          durationWeeks: true,
          availableSchedules: true,
          difficulty: true,
          recoveryDemand: true,
          isFree: true,
          status: true,
          defaultCurrency: true,
          displayPrice: true,
          bundleIds: true,
        },
      },
    },
  });

  const entitlements: PublicEntitlement[] = [];
  for (const row of rows) {
    const product = toEntitledProgramProduct(row.product);
    if (!product) continue;
    entitlements.push({
      id: row.id,
      source: row.source,
      grantedAt: row.grantedAt.toISOString(),
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      product,
    });
  }

  return { ok: true, entitlements };
}
