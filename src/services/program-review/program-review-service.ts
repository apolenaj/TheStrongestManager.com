import { prisma } from "@/lib/db";
import {
  assembleProgramAiReview,
  extractProgramStructureSignals,
  PROGRAM_REVIEW_ENGINE_VERSION,
  type ProgramAiReviewPayload,
  type ProgramGraphForReview,
  type ProgramReviewAthleteContext,
} from "@/domain/program-review";

export type ProgramReviewOption = {
  id: string;
  name: string;
  kind: string;
  status: string;
};

export type ProgramReviewHistoryItem = {
  id: string;
  programId: string;
  programName: string;
  summary: string | null;
  createdAtIso: string;
};

export type ProgramReviewView = {
  athleteProfileId: string;
  options: ProgramReviewOption[];
  selectedProgramId: string | null;
  review: ProgramAiReviewPayload | null;
  storedId: string | null;
  history: ProgramReviewHistoryItem[];
};

function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

const workoutInclude = {
  workoutExercises: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      exercise: {
        select: {
          name: true,
          movementPattern: true,
          category: true,
          difficulty: true,
          equipment: true,
        },
      },
    },
  },
};

async function loadProgramGraph(
  programId: string,
): Promise<ProgramGraphForReview | null> {
  const program = await prisma.program.findFirst({
    where: { id: programId },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          workout: { include: workoutInclude },
          days: {
            orderBy: { dayIndex: "asc" },
            include: {
              workout: { include: workoutInclude },
            },
          },
        },
      },
      progressionRules: { select: { ruleKind: true } },
    },
  });
  if (!program) return null;
  return program as unknown as ProgramGraphForReview;
}

async function loadAthleteContext(
  athleteProfileId: string,
): Promise<ProgramReviewAthleteContext> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { id: athleteProfileId },
    include: {
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        take: 1,
      },
      trainingExperience: true,
      recoveryEntries: {
        where: { readiness: { not: null } },
        orderBy: { recordedAt: "desc" },
        take: 7,
        select: { readiness: true },
      },
    },
  });

  if (!profile) {
    return {
      goalTitle: null,
      goalCategory: null,
      experienceLevel: null,
      daysPerWeek: null,
      sessionLengthMinutes: null,
      availableEquipment: [],
      recoveryCapacity: "unknown",
      primaryDiscipline: null,
    };
  }

  const exp = profile.trainingExperience;
  const habits = (exp?.recoveryHabits ?? "").toLowerCase();
  const readiness = profile.recoveryEntries
    .map((r) => r.readiness)
    .filter((n): n is number => n != null);
  const avgReady =
    readiness.length >= 3
      ? readiness.reduce((a, b) => a + b, 0) / readiness.length
      : null;

  let recoveryCapacity: ProgramReviewAthleteContext["recoveryCapacity"] =
    "unknown";
  if (/limited|poor sleep|high stress/.test(habits)) {
    recoveryCapacity = "limited";
  } else if (/solid|high|excellent sleep/.test(habits)) {
    recoveryCapacity = "high";
  } else if (avgReady != null) {
    if (avgReady < 55) recoveryCapacity = "limited";
    else if (avgReady >= 75) recoveryCapacity = "high";
    else recoveryCapacity = "moderate";
  } else if (habits.length > 0) {
    recoveryCapacity = "moderate";
  }

  return {
    goalTitle: profile.goals[0]?.title ?? null,
    goalCategory: profile.goals[0]?.category ?? null,
    experienceLevel: exp?.level ?? null,
    daysPerWeek: exp?.daysPerWeek ?? null,
    sessionLengthMinutes: exp?.sessionLengthMinutes ?? null,
    availableEquipment: parseJsonStringArray(exp?.availableEquipment),
    recoveryCapacity,
    primaryDiscipline: profile.primaryDiscipline,
  };
}

/**
 * Run AI-assisted program review for an athlete-owned or template program.
 * Set persist=true to append a history row (does not overwrite past reviews).
 */
export async function getProgramAiReview(input: {
  userId: string;
  programId?: string | null;
  persist?: boolean;
}): Promise<ProgramReviewView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) return null;

  const [athletePrograms, templates] = await Promise.all([
    prisma.program.findMany({
      where: { athleteProfileId: profile.id, kind: "athlete" },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, name: true, kind: true, status: true },
    }),
    prisma.program.findMany({
      where: { kind: "template" },
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: { id: true, name: true, kind: true, status: true },
    }),
  ]);

  const options: ProgramReviewOption[] = [
    ...athletePrograms,
    ...templates,
  ];

  const selectedProgramId =
    input.programId && options.some((o) => o.id === input.programId)
      ? input.programId
      : (athletePrograms.find((p) => p.status === "active")?.id ??
        athletePrograms[0]?.id ??
        templates[0]?.id ??
        null);

  async function loadHistory(): Promise<ProgramReviewHistoryItem[]> {
    const historyRows = await prisma.programAiReview.findMany({
      where: { athleteProfileId: profile!.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { program: { select: { name: true } } },
    });
    return historyRows.map((r) => ({
      id: r.id,
      programId: r.programId,
      programName: r.program.name,
      summary: r.summary,
      createdAtIso: r.createdAt.toISOString(),
    }));
  }

  let history = await loadHistory();

  if (!selectedProgramId) {
    return {
      athleteProfileId: profile.id,
      options,
      selectedProgramId: null,
      review: null,
      storedId: null,
      history,
    };
  }

  const allowed =
    athletePrograms.some((p) => p.id === selectedProgramId) ||
    templates.some((p) => p.id === selectedProgramId);
  if (!allowed) {
    return {
      athleteProfileId: profile.id,
      options,
      selectedProgramId: null,
      review: null,
      storedId: null,
      history,
    };
  }

  const graph = await loadProgramGraph(selectedProgramId);
  if (!graph) {
    return {
      athleteProfileId: profile.id,
      options,
      selectedProgramId,
      review: null,
      storedId: null,
      history,
    };
  }

  const context = await loadAthleteContext(profile.id);
  const signals = extractProgramStructureSignals(graph);
  const review = assembleProgramAiReview({ signals, context });

  let storedId: string | null = null;
  if (input.persist) {
    const stored = await prisma.programAiReview.create({
      data: {
        athleteProfileId: profile.id,
        programId: selectedProgramId,
        engineVersion: PROGRAM_REVIEW_ENGINE_VERSION,
        summary: review.overview.slice(0, 240),
        reviewJson: JSON.stringify(review),
      },
      select: { id: true },
    });
    storedId = stored.id;
    history = await loadHistory();
  }

  return {
    athleteProfileId: profile.id,
    options,
    selectedProgramId,
    review,
    storedId,
    history,
  };
}
