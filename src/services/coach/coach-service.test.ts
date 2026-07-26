import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  assertCoachCanAccessAthlete,
  enableCoachRole,
  getCoachDashboard,
  grantCoachAccess,
  revokeCoachAccess,
} from "@/services/coach/coach-service";

describe("coach platform foundation", () => {
  const stamp = Date.now();
  const athleteEmail = `athlete-coach-${stamp}@example.com`;
  const coachEmail = `coach-${stamp}@example.com`;
  const strangerEmail = `stranger-coach-${stamp}@example.com`;
  let athleteUserId = "";
  let coachUserId = "";
  let strangerUserId = "";
  let athleteProfileId = "";
  let accessId = "";

  beforeAll(async () => {
    const passwordHash = await hashPassword("test-password-123");

    const athlete = await prisma.user.create({
      data: {
        email: athleteEmail,
        passwordHash,
        isAthlete: true,
        isCoach: false,
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Grant Athlete",
            primaryDiscipline: "powerlifting",
            sex: "female",
            birthYear: 1990,
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
        isAthlete: true,
        isCoach: false,
        name: "Test Coach",
      },
    });
    coachUserId = coach.id;

    const stranger = await prisma.user.create({
      data: {
        email: strangerEmail,
        passwordHash,
        isAthlete: false,
        isCoach: true,
        name: "Stranger Coach",
      },
    });
    strangerUserId = stranger.id;
  });

  afterAll(async () => {
    for (const id of [athleteUserId, coachUserId, strangerUserId]) {
      if (id) {
        await prisma.user.delete({ where: { id } }).catch(() => undefined);
      }
    }
  });

  it("requires Coach Mode before grant and blocks self-grant", async () => {
    const beforeEnable = await grantCoachAccess({
      athleteUserId,
      coachEmail,
    });
    expect(beforeEnable.ok).toBe(false);
    if (beforeEnable.ok) return;
    expect(beforeEnable.error).toMatch(/Coach Mode/i);

    await enableCoachRole(coachUserId);
    await enableCoachRole(athleteUserId);

    const self = await grantCoachAccess({
      athleteUserId,
      coachEmail: athleteEmail,
    });
    expect(self.ok).toBe(false);
    if (self.ok) return;
    expect(self.error).toMatch(/yourself/i);
  });

  it("grants access only for the chosen coach and defaults safe scopes", async () => {
    const granted = await grantCoachAccess({
      athleteUserId,
      coachEmail,
    });
    expect(granted.ok).toBe(true);
    if (!granted.ok) return;
    accessId = granted.accessId;

    const denied = await assertCoachCanAccessAthlete({
      coachUserId: strangerUserId,
      athleteProfileId,
    });
    expect(denied.ok).toBe(false);

    const allowed = await assertCoachCanAccessAthlete({
      coachUserId,
      athleteProfileId,
      requiredScope: "training",
    });
    expect(allowed.ok).toBe(true);
    if (!allowed.ok) return;
    expect(allowed.scopes).toContain("training");
    expect(allowed.scopes).not.toContain("recovery");
    expect(allowed.scopes).not.toContain("body_metrics_detailed");
    expect(allowed.scopes).not.toContain("technique_media");

    const recoveryDenied = await assertCoachCanAccessAthlete({
      coachUserId,
      athleteProfileId,
      requiredScope: "recovery",
    });
    expect(recoveryDenied.ok).toBe(false);
  });

  it("builds dashboard only for active grants without health fields", async () => {
    await prisma.trainingSession.create({
      data: {
        athleteProfileId,
        status: "completed",
        completedAt: new Date(),
      },
    });

    const dash = await getCoachDashboard(coachUserId);
    expect(dash).not.toBeNull();
    expect(dash!.athletes).toHaveLength(1);
    expect(dash!.athletes[0]!.displayName).toBe("Grant Athlete");
    expect(dash!.athletes[0]!.discipline).toBe("powerlifting");
    expect(dash!.recentActivity.length).toBeGreaterThan(0);
    expect(JSON.stringify(dash)).not.toContain("female");
    expect(JSON.stringify(dash)).not.toContain("1990");
    expect(JSON.stringify(dash)).not.toMatch(/bodyfat|girth|recoveryEntry/i);

    const strangerDash = await getCoachDashboard(strangerUserId);
    expect(strangerDash).not.toBeNull();
    expect(strangerDash!.athletes).toHaveLength(0);
  });

  it("revokes access so the coach loses the athlete", async () => {
    const revoked = await revokeCoachAccess({
      athleteUserId,
      accessId,
      reason: "test revoke",
    });
    expect(revoked.ok).toBe(true);

    const after = await assertCoachCanAccessAthlete({
      coachUserId,
      athleteProfileId,
    });
    expect(after.ok).toBe(false);

    const dash = await getCoachDashboard(coachUserId);
    expect(dash!.athletes).toHaveLength(0);
  });
});
