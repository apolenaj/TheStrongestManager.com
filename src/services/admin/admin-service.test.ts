import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  listAdminAuditLogs,
  listAdminFeatureFlags,
  recordContentReview,
  recordFeatureFlagsReview,
} from "@/services/admin/admin-service";

describe("admin CMS audit", () => {
  const stamp = Date.now();
  const adminEmail = `admin-${stamp}@example.com`;
  const userEmail = `user-${stamp}@example.com`;
  let adminId = "";
  let userId = "";

  beforeAll(async () => {
    const passwordHash = await hashPassword("test-password-123");
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        isAdmin: true,
        isAthlete: true,
      },
    });
    adminId = admin.id;
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        passwordHash,
        isAdmin: false,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    for (const id of [adminId, userId]) {
      if (id) {
        await prisma.user.delete({ where: { id } }).catch(() => undefined);
      }
    }
  });

  it("persists content review and flag review audits", async () => {
    const review = await recordContentReview({
      actorUserId: adminId,
      entityType: "exercise",
      entityId: "romanian-deadlift",
      note: "Aliases look correct",
    });
    expect(review.id).toBeTruthy();

    await recordFeatureFlagsReview({
      actorUserId: adminId,
      note: "Checked marketplace flag off",
    });

    const logs = await listAdminAuditLogs(20);
    expect(logs.some((l) => l.action === "content.note")).toBe(true);
    expect(logs.some((l) => l.action === "flags.reviewed")).toBe(true);
    expect(
      logs.find((l) => l.entityId === "romanian-deadlift")?.actorEmail,
    ).toBe(adminEmail);
  });

  it("exposes feature flags as environment-backed values", () => {
    const flags = listAdminFeatureFlags();
    expect(flags.length).toBeGreaterThan(0);
    expect(flags.every((f) => f.source === "environment")).toBe(true);
  });

  it("stores isAdmin only for staff users", async () => {
    const admin = await prisma.user.findUniqueOrThrow({
      where: { id: adminId },
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(admin.isAdmin).toBe(true);
    expect(user.isAdmin).toBe(false);
  });
});
