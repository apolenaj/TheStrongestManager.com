import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  createTechniqueUpload,
  deleteTechniqueAnalysisForUser,
  resolveAnalysisBackendStatus,
} from "@/services/technique/analysis-service";

function fakeMp4Buffer(): Buffer {
  const buf = Buffer.alloc(64);
  buf.writeUInt32BE(24, 0);
  buf.write("ftyp", 4);
  buf.write("isom", 8);
  return buf;
}

describe("resolveAnalysisBackendStatus", () => {
  it("uses development_stub only in development when no backend", () => {
    expect(
      resolveAnalysisBackendStatus({ NODE_ENV: "development" }),
    ).toBe("development_stub");
    expect(
      resolveAnalysisBackendStatus({ NODE_ENV: "production" }),
    ).toBe("unavailable");
  });

  it("never pretends analysis is ready when backend flag is set without a real service", () => {
    expect(
      resolveAnalysisBackendStatus({
        NODE_ENV: "development",
        TECHNIQUE_ANALYSIS_BACKEND: "enabled",
      }),
    ).toBe("unavailable");
  });
});

describe("createTechniqueUpload honesty", () => {
  const email = `technique-upload-${Date.now()}@example.com`;
  let userId = "";
  let exerciseId = "";
  let tempStorage = "";
  const previousStorage = process.env.TECHNIQUE_STORAGE_DIR;

  beforeAll(async () => {
    tempStorage = await mkdtemp(path.join(os.tmpdir(), "technique-"));
    process.env.TECHNIQUE_STORAGE_DIR = tempStorage;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword("test-password-123"),
        athleteProfile: {
          create: {
            units: "kg",
            displayName: "Technique Tester",
            onboardingCompletedAt: new Date(),
          },
        },
        subscription: {
          create: {
            plan: "free",
            status: "active",
          },
        },
        creditBalance: {
          create: {
            balance: 0,
            lastReason: "test_init",
          },
        },
      },
    });
    userId = user.id;

    const exercise = await prisma.exercise.create({
      data: {
        slug: `technique-test-${Date.now()}`,
        name: "Technique Test Squat",
        category: "compound",
        movementPattern: "squat",
        difficulty: "intermediate",
        isPublished: true,
      },
    });
    exerciseId = exercise.id;
  });

  afterAll(async () => {
    if (previousStorage === undefined) delete process.env.TECHNIQUE_STORAGE_DIR;
    else process.env.TECHNIQUE_STORAGE_DIR = previousStorage;

    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    if (exerciseId) {
      await prisma.exercise.delete({ where: { id: exerciseId } }).catch(() => undefined);
    }
    if (tempStorage) {
      await rm(tempStorage, { recursive: true, force: true });
    }
  });

  it("stores video privately and never invents a technique score", async () => {
    const result = await createTechniqueUpload({
      userId,
      exerciseId,
      cameraAngle: "side",
      loadRaw: "100",
      loadUnitPreference: "kg",
      repsRaw: "5",
      consent: true,
      file: {
        buffer: fakeMp4Buffer(),
        fileName: "squat.mp4",
        mimeType: "video/mp4",
        size: fakeMp4Buffer().byteLength,
      },
      clientMeta: {
        durationSeconds: 8,
        widthPx: 1280,
        heightPx: 720,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.overallScore).toBeNull();
    expect(result.status).toBe("awaiting_backend");
    expect(["development_stub", "unavailable"]).toContain(
      result.analysisBackendStatus,
    );

    const row = await prisma.techniqueAnalysis.findUniqueOrThrow({
      where: { id: result.analysisId },
    });
    expect(row.overallScore).toBeNull();
    expect(row.confidenceBasis).toBeNull();
    expect(row.storageKey).toBeTruthy();
    expect(row.analysisConsentAt).toBeTruthy();
    expect(row.loadKg).toBe(100);
    expect(row.reps).toBe(5);
    expect(row.summary).toMatch(/no technique score/i);

    const deleted = await deleteTechniqueAnalysisForUser(
      userId,
      result.analysisId,
    );
    expect(deleted.ok).toBe(true);

    const after = await prisma.techniqueAnalysis.findUniqueOrThrow({
      where: { id: result.analysisId },
    });
    expect(after.status).toBe("deleted");
    expect(after.storageKey).toBeNull();
    expect(after.overallScore).toBeNull();
  });

  it("requires consent", async () => {
    const result = await createTechniqueUpload({
      userId,
      exerciseId,
      cameraAngle: "front",
      loadRaw: null,
      loadUnitPreference: null,
      repsRaw: null,
      consent: false,
      file: {
        buffer: fakeMp4Buffer(),
        fileName: "squat.mp4",
        mimeType: "video/mp4",
        size: fakeMp4Buffer().byteLength,
      },
      clientMeta: {
        durationSeconds: 8,
        widthPx: 1280,
        heightPx: 720,
      },
    });
    expect(result.ok).toBe(false);
  });
});
