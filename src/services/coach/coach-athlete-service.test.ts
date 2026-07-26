import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  createCoachModification,
  createCoachNote,
  getCoachAthleteWorkspace,
  withdrawCoachModification,
} from "@/services/coach/coach-athlete-service";
import {
  enableCoachRole,
  grantCoachAccess,
} from "@/services/coach/coach-service";
import { serializeCoachScopes } from "@/domain/coach";

describe("coach athlete workspace", () => {
  const stamp = Date.now();
  const athleteEmail = `ws-athlete-${stamp}@example.com`;
  const coachEmail = `ws-coach-${stamp}@example.com`;
  let athleteUserId = "";
  let coachUserId = "";
  let athleteProfileId = "";

  beforeAll(async () => {
    const passwordHash = await hashPassword("test-password-123");

    const athlete = await prisma.user.create({
      data: {
        email: athleteEmail,
        passwordHash,
        isAthlete: true,
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Workspace Athlete",
            primaryDiscipline: "powerlifting",
            sex: "male",
            birthYear: 1988,
            onboardingCompletedAt: new Date(),
          },
        },
      },
      include: { athleteProfile: true },
    });
    athleteUserId = athlete.id;
    athleteProfileId = athlete.athleteProfile!.id;

    const coach = await prisma.user.create({
      data: {
        email: coachEmail,
        passwordHash,
        isCoach: false,
        name: "Workspace Coach",
      },
    });
    coachUserId = coach.id;

    await enableCoachRole(coachUserId);
    await grantCoachAccess({
      athleteUserId,
      coachEmail,
    });

    await prisma.trainingSession.create({
      data: {
        athleteProfileId,
        status: "completed",
        completedAt: new Date(),
        workoutNameSnapshot: "Squat day",
      },
    });

    await prisma.programAdaptation.create({
      data: {
        athleteProfileId,
        changeKind: "keep_load",
        recommendedChange: "Hold load this week",
        reason: "Engine test suggestion",
        confidence: "low",
        status: "pending",
        source: "heuristic",
        engineVersion: "adaptive.v1",
      },
    });

    await prisma.recoveryEntry.create({
      data: {
        athleteProfileId,
        readiness: 72,
        soreness: 4,
        notes: "secret recovery",
      },
    });
  });

  afterAll(async () => {
    for (const id of [athleteUserId, coachUserId]) {
      if (id) {
        await prisma.user.delete({ where: { id } }).catch(() => undefined);
      }
    }
  });

  it("loads scoped workspace and omits recovery + health fields by default", async () => {
    const result = await getCoachAthleteWorkspace({
      coachUserId,
      athleteProfileId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.view.displayName).toBe("Workspace Athlete");
    expect(result.view.sectionAccess.training).toBe(true);
    expect(result.view.sectionAccess.recovery).toBe(false);
    expect(result.view.recovery.locked).toBe(true);
    expect(result.view.recovery.entries).toHaveLength(0);
    expect(result.view.training.sessions.length).toBeGreaterThan(0);
    expect(result.view.recommendations.aiEngine.length).toBeGreaterThan(0);
    expect(result.view.recommendations.aiEngine[0]!.authorshipLabel).toBe(
      "AI suggestion",
    );
    expect(JSON.stringify(result.view)).not.toContain("male");
    expect(JSON.stringify(result.view)).not.toContain("1988");
    expect(JSON.stringify(result.view)).not.toContain("secret recovery");
  });

  it("creates timestamped notes and auditable human coach modifications", async () => {
    const note = await createCoachNote({
      coachUserId,
      athleteProfileId,
      section: "training",
      body: "Bar path looked solid on squat day.",
      relatedType: "training_session",
    });
    expect(note.ok).toBe(true);

    const mod = await createCoachModification({
      coachUserId,
      athleteProfileId,
      kind: "program_change",
      title: "Deload next week",
      body: "Suggest a light week before the meet.",
    });
    expect(mod.ok).toBe(true);
    if (!mod.ok) return;

    const events = await prisma.coachModificationEvent.findMany({
      where: { modificationId: mod.modificationId },
    });
    expect(events).toHaveLength(1);
    expect(events[0]!.eventType).toBe("created");
    expect(events[0]!.actorUserId).toBe(coachUserId);

    const workspace = await getCoachAthleteWorkspace({
      coachUserId,
      athleteProfileId,
    });
    expect(workspace.ok).toBe(true);
    if (!workspace.ok) return;
    expect(workspace.view.notes.some((n) => n.body.includes("Bar path"))).toBe(
      true,
    );
    expect(
      workspace.view.notes.find((n) => n.body.includes("Bar path"))
        ?.sourceLabel,
    ).toBe("Coach note");
    const human = workspace.view.recommendations.humanCoach.find(
      (m) => m.id === mod.modificationId,
    );
    expect(human?.authorshipLabel).toBe("Human coach");
    expect(human?.eventCount).toBe(1);

    const withdrawn = await withdrawCoachModification({
      coachUserId,
      modificationId: mod.modificationId,
    });
    expect(withdrawn.ok).toBe(true);
    const after = await prisma.coachModificationEvent.count({
      where: { modificationId: mod.modificationId },
    });
    expect(after).toBe(2);
  });

  it("surfaces recovery only when recovery scope is granted", async () => {
    await prisma.coachAthleteAccess.updateMany({
      where: { coachUserId, athleteProfileId },
      data: {
        scopesJson: serializeCoachScopes([
          "training",
          "programs",
          "technique_summary",
          "recovery",
        ]),
      },
    });

    const result = await getCoachAthleteWorkspace({
      coachUserId,
      athleteProfileId,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.view.recovery.locked).toBe(false);
    expect(result.view.recovery.entries.length).toBeGreaterThan(0);
    expect(result.view.recovery.entries[0]!.readiness).toBe(72);
  });
});
