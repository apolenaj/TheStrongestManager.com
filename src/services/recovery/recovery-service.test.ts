import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  getRecoveryDashboard,
  saveRecoveryCheckIn,
} from "@/services/recovery/recovery-service";
import {
  getActiveWearableAdapter,
  listWearableAdapters,
} from "@/domain/recovery/wearable";

describe("recovery service", () => {
  const email = `recovery-${Date.now()}@example.com`;
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Recovery Tester",
            onboardingCompletedAt: new Date(),
          },
        },
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });

  it("saves check-in without fabricating sleep and estimates readiness", async () => {
    const withoutSleep = await saveRecoveryCheckIn({
      userId,
      sleepHours: null,
      sleepQuality: null,
      stress: 4,
      soreness: 3,
      motivation: 8,
      fatigue: 3,
    });
    expect(withoutSleep.ok).toBe(true);
    if (!withoutSleep.ok) return;
    expect(withoutSleep.readiness).not.toBeNull();

    const entry = await prisma.recoveryEntry.findUniqueOrThrow({
      where: { id: withoutSleep.entryId },
    });
    expect(entry.sleepHours).toBeNull();
    expect(entry.sleepQuality).toBeNull();
    expect(entry.readinessInputsJson).not.toContain("sleepHours");

    const dash = await getRecoveryDashboard(userId);
    expect(dash).not.toBeNull();
    expect(dash!.latestEstimate?.score).toBe(withoutSleep.readiness);
    expect(dash!.latestEstimate?.sleepIncluded).toBe(false);
    expect(dash!.wearable.status).toBe("unavailable");
    expect(dash!.trainingRelationship.title).toBe("Training relationship");
  });

  it("exposes wearable adapter architecture without fake connections", () => {
    const active = getActiveWearableAdapter();
    expect(active.status).toBe("unavailable");
    expect(active.id).toBe("none");
    const listed = listWearableAdapters();
    expect(listed).toHaveLength(5);
    expect(listed.every((a) => a.status === "not_configured")).toBe(true);
    expect(listed.every((a) => a.id !== "none")).toBe(true);
  });
});
