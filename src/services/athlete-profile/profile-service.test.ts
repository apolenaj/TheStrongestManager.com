import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  appendPersonalRecord,
  getAthleteProfileForUser,
} from "@/services/athlete-profile/profile-service";

describe("personal record history", () => {
  const email = `profile-pr-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            onboardingCompletedAt: new Date(),
            primaryDiscipline: "powerlifting",
          },
        },
      },
      include: { athleteProfile: true },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("appends PR rows instead of overwriting", async () => {
    const first = await appendPersonalRecord(userId, {
      liftId: "squat",
      rawValue: "150",
    });
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.isNewBest).toBe(true);

    const second = await appendPersonalRecord(userId, {
      liftId: "squat",
      rawValue: "160",
    });
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.isNewBest).toBe(true);

    const third = await appendPersonalRecord(userId, {
      liftId: "squat",
      rawValue: "140",
    });
    expect(third.ok).toBe(true);
    if (third.ok) expect(third.isNewBest).toBe(false);

    const profile = await getAthleteProfileForUser(userId);
    const squat = profile?.lifts.find((lift) => lift.liftId === "squat");
    expect(squat?.history).toHaveLength(3);
    expect(squat?.best?.valueKg).toBe(160);
    expect(squat?.current?.valueKg).toBe(140);
  });

  it("respects lb preference for display and input", async () => {
    await prisma.athleteProfile.update({
      where: { userId },
      data: { units: "lb" },
    });

    const logged = await appendPersonalRecord(userId, {
      liftId: "bench",
      rawValue: "225", // lb
    });
    expect(logged.ok).toBe(true);

    const profile = await getAthleteProfileForUser(userId);
    expect(profile?.units).toBe("lb");
    const bench = profile?.lifts.find((lift) => lift.liftId === "bench");
    expect(bench?.best?.displayUnit).toBe("lb");
    expect(bench?.best?.displayValue).toBeCloseTo(225, 0);
    expect(bench?.best?.valueKg).toBeCloseTo(102.06, 0);
  });
});
