import { prisma } from "@/lib/db";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";
import type {
  ProgramDayPrescription,
  ProgramWeekPrescription,
  TrainingMaxesJson,
} from "@/types/programs";

function asWeek(value: unknown): ProgramWeekPrescription | null {
  if (!value || typeof value !== "object") return null;
  const week = value as ProgramWeekPrescription;
  if (typeof week.week !== "number" || !Array.isArray(week.days)) return null;
  return week;
}

function asTrainingMaxes(value: unknown): TrainingMaxesJson {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: TrainingMaxesJson = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function dayKeyOf(day: ProgramDayPrescription): string {
  return String(day.day);
}

export type CatalogLibraryItem = {
  userProgramId: string;
  productName: string;
  productSlug: string;
  source: string;
  status: string;
  isFree: boolean;
  currentWeek: number;
  durationWeeks: number;
  completedAt: string | null;
  kind: "purchased" | "free" | "completed" | "active";
};

export type CatalogActiveProgramView = {
  userProgramId: string;
  productName: string;
  productSlug: string;
  currentWeek: number;
  durationWeeks: number;
  scheduleVariant: string;
  unitSystem: string;
  completionPercent: number;
  currentBlock: string;
  nextWorkout: {
    dayKey: string;
    label: string;
    href: string;
  } | null;
  trainingMaxes: TrainingMaxesJson;
  pendingTmAdjustments: number;
  /** Free-to-paid funnel fields */
  isFree: boolean;
  familyId: string;
  paidProductSlug: string | null;
  methodProgressBlurb: string | null;
  sessionsCompleted: number;
  /** Coarse tonnage proxy: Σ (actualWeight × reps). Unit matches unitSystem. */
  volumeLogged: number;
};

export type CatalogProgramsDashboard = {
  active: CatalogActiveProgramView | null;
  library: CatalogLibraryItem[];
};

export async function getCatalogProgramsDashboard(
  userId: string,
): Promise<CatalogProgramsDashboard> {
  const runs = await prisma.userProgram.findMany({
    where: { userId },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      entitlement: { select: { source: true } },
      workoutSessions: {
        select: {
          weekNumber: true,
          dayKey: true,
          status: true,
          setLogs: {
            select: {
              actualWeight: true,
              prescribedReps: true,
            },
          },
        },
      },
      tmAdjustments: {
        where: { status: "pending" },
        select: { id: true },
      },
      programVersion: {
        select: {
          product: {
            select: {
              name: true,
              slug: true,
              isFree: true,
              durationWeeks: true,
            },
          },
        },
      },
    },
  });

  const library: CatalogLibraryItem[] = [];
  let active: CatalogActiveProgramView | null = null;

  for (const run of runs) {
    const product = run.programVersion.product;
    const week = asWeek(run.firstWeekJson);
    const completedDays = run.workoutSessions.filter(
      (s) => s.weekNumber === run.currentWeek && s.status === "completed",
    ).length;
    const totalDays = week?.days.length ?? 0;
    const completionPercent =
      totalDays > 0
        ? Math.min(100, Math.round((completedDays / totalDays) * 100))
        : 0;

    const familyId = product.slug.replace(/-free$/, "");
    const familyContent = getProgramFamilyContent(familyId);
    const block =
      familyContent?.structure.find((phase) => {
        const match = /(\d+)\s*[–-]\s*(\d+)/.exec(phase.weeks);
        if (!match) return false;
        const start = Number(match[1]);
        const end = Number(match[2]);
        return run.currentWeek >= start && run.currentWeek <= end;
      })?.label ??
      week?.theme ??
      `Week ${run.currentWeek}`;

    const methodProgressBlurb =
      familyContent?.structure
        .map((phase) => `${phase.weeks}: ${phase.label} — ${phase.intent}`)
        .join(" ") ?? null;

    const completedKeys = new Set(
      run.workoutSessions
        .filter(
          (s) =>
            s.weekNumber === run.currentWeek && s.status === "completed",
        )
        .map((s) => s.dayKey),
    );

    let nextWorkout: CatalogActiveProgramView["nextWorkout"] = null;
    if (week && run.status === "active") {
      const nextDay = week.days.find((d) => !completedKeys.has(dayKeyOf(d)));
      if (nextDay) {
        nextWorkout = {
          dayKey: dayKeyOf(nextDay),
          label: nextDay.label ?? `Day ${nextDay.day}`,
          href: `/app/programs/active/${run.id}/day/${encodeURIComponent(dayKeyOf(nextDay))}`,
        };
      }
    }

    const sessionsCompleted = run.workoutSessions.filter(
      (s) => s.status === "completed",
    ).length;

    let volumeLogged = 0;
    for (const session of run.workoutSessions) {
      for (const log of session.setLogs) {
        if (log.actualWeight == null || log.actualWeight <= 0) continue;
        const reps = log.prescribedReps && log.prescribedReps > 0 ? log.prescribedReps : 1;
        volumeLogged += log.actualWeight * reps;
      }
    }
    volumeLogged = Math.round(volumeLogged);

    const kind: CatalogLibraryItem["kind"] =
      run.status === "completed"
        ? "completed"
        : run.status === "active"
          ? "active"
          : product.isFree || run.entitlement.source === "free"
            ? "free"
            : "purchased";

    library.push({
      userProgramId: run.id,
      productName: product.name,
      productSlug: product.slug,
      source: run.entitlement.source,
      status: run.status,
      isFree: product.isFree,
      currentWeek: run.currentWeek,
      durationWeeks: product.durationWeeks,
      completedAt: run.completedAt?.toISOString() ?? null,
      kind,
    });

    if (run.status === "active" && !active) {
      active = {
        userProgramId: run.id,
        productName: product.name,
        productSlug: product.slug,
        currentWeek: run.currentWeek,
        durationWeeks: product.durationWeeks,
        scheduleVariant: run.scheduleVariant,
        unitSystem: run.unitSystem,
        completionPercent,
        currentBlock: block,
        nextWorkout,
        trainingMaxes: asTrainingMaxes(run.trainingMaxes),
        pendingTmAdjustments: run.tmAdjustments.length,
        isFree: product.isFree,
        familyId,
        paidProductSlug: product.isFree ? familyId : null,
        methodProgressBlurb,
        sessionsCompleted,
        volumeLogged,
      };
    }
  }

  return { active, library };
}
