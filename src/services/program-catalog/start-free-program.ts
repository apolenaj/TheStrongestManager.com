import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateFirstTrainingWeek } from "@/domain/program-catalog/generate-week-one";
import {
  trainingMaxesFromOneRmsKg,
  validateOptionalOneRms,
  type OneRmInput,
} from "@/domain/program-catalog/one-rm";
import type { UnitSystem } from "@/types/programs";

export type StartFreeProgramInput = {
  userId: string;
  productSlug: string;
  scheduleVariant: string;
  unitSystem: UnitSystem;
  oneRms: OneRmInput;
  competitionDate?: string | null;
  weakestLift?: "squat" | "bench" | "deadlift" | "none";
};

export type StartFreeProgramResult =
  | {
      ok: true;
      userProgramId: string;
      entitlementId: string;
      productSlug: string;
    }
  | { ok: false; error: string };

function parseCompetitionDate(
  raw: string | null | undefined,
): Date | null | { error: string } {
  if (raw == null || raw.trim() === "") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return { error: "Competition date must be YYYY-MM-DD." };
  }
  const date = new Date(`${raw.trim()}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Competition date is invalid." };
  }
  const min = new Date();
  min.setUTCHours(0, 0, 0, 0);
  const max = new Date(min);
  max.setUTCFullYear(max.getUTCFullYear() + 3);
  if (date < min) {
    return { error: "Competition date cannot be in the past." };
  }
  if (date > max) {
    return { error: "Competition date must be within 3 years." };
  }
  return date;
}

/**
 * Grant free entitlement (if needed), create UserProgram, persist week-1 schedule.
 */
export async function startFreeProgramOnboarding(
  input: StartFreeProgramInput,
): Promise<StartFreeProgramResult> {
  if (input.unitSystem !== "kg" && input.unitSystem !== "lb") {
    return { ok: false, error: "Units must be kg or lb." };
  }

  const oneRmCheck = validateOptionalOneRms(input.oneRms, input.unitSystem);
  if (!oneRmCheck.ok) return oneRmCheck;

  const competition = parseCompetitionDate(input.competitionDate);
  if (competition && "error" in competition) {
    return { ok: false, error: competition.error };
  }

  const product = await prisma.programProduct.findFirst({
    where: {
      slug: input.productSlug,
      status: "published",
      isFree: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      availableSchedules: true,
      versions: {
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          templates: {
            select: { scheduleVariant: true },
          },
        },
      },
    },
  });

  if (!product) {
    return { ok: false, error: "Free program not found or not published." };
  }

  if (!product.availableSchedules.includes(input.scheduleVariant)) {
    return {
      ok: false,
      error: `Schedule must be one of: ${product.availableSchedules.join(", ")}.`,
    };
  }

  const version = product.versions[0];
  if (!version) {
    return { ok: false, error: "No published program version available." };
  }

  const trainingMaxes = trainingMaxesFromOneRmsKg(oneRmCheck.valuesKg);
  const firstWeek = generateFirstTrainingWeek({
    scheduleVariant: input.scheduleVariant,
    unitSystem: input.unitSystem,
    trainingMaxes,
    weakestLift: input.weakestLift,
    productName: product.name,
  });

  const existingActive = await prisma.userProgram.findFirst({
    where: {
      userId: input.userId,
      status: "active",
      entitlement: { productId: product.id },
    },
    select: { id: true },
  });
  if (existingActive) {
    return {
      ok: false,
      error:
        "You already have an active run of this free program. Finish or abandon it before starting again.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let entitlement = await tx.programEntitlement.findFirst({
        where: {
          userId: input.userId,
          productId: product.id,
          source: "free",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
      });

      if (!entitlement) {
        entitlement = await tx.programEntitlement.create({
          data: {
            userId: input.userId,
            productId: product.id,
            source: "free",
            grantedAt: new Date(),
          },
          select: { id: true },
        });
      }

      const userProgram = await tx.userProgram.create({
        data: {
          userId: input.userId,
          entitlementId: entitlement.id,
          programVersionId: version.id,
          startDate: new Date(),
          scheduleVariant: input.scheduleVariant,
          unitSystem: input.unitSystem,
          trainingMaxes: trainingMaxes as Prisma.InputJsonValue,
          competitionDate: competition instanceof Date ? competition : null,
          firstWeekJson: firstWeek as unknown as Prisma.InputJsonValue,
          status: "active",
          currentWeek: 1,
        },
        select: { id: true },
      });

      return {
        userProgramId: userProgram.id,
        entitlementId: entitlement.id,
      };
    });

    const { trackProductEventSafe } = await import(
      "@/services/analytics/track"
    );
    trackProductEventSafe({
      name: "free_program_started",
      props: {
        productSlug: product.slug,
        userProgramId: result.userProgramId,
      },
      userId: input.userId,
    });

    return {
      ok: true,
      userProgramId: result.userProgramId,
      entitlementId: result.entitlementId,
      productSlug: product.slug,
    };
  } catch {
    return {
      ok: false,
      error: "Unable to start the free program. Please try again.",
    };
  }
}

export async function getUserProgramWeekOne(input: {
  userId: string;
  userProgramId: string;
}) {
  return prisma.userProgram.findFirst({
    where: { id: input.userProgramId, userId: input.userId },
    select: {
      id: true,
      scheduleVariant: true,
      unitSystem: true,
      trainingMaxes: true,
      competitionDate: true,
      firstWeekJson: true,
      currentWeek: true,
      status: true,
      startDate: true,
      programVersion: {
        select: {
          version: true,
          product: {
            select: { slug: true, name: true, isFree: true },
          },
        },
      },
    },
  });
}
