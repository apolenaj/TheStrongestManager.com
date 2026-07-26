import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import {
  buildTechniqueReferralPath,
  isValidReferralCode,
  type TechniqueShareCardModel,
  type TechniqueSharePayload,
} from "@/domain/technique-share-cards";

function newToken(): string {
  return randomBytes(16).toString("hex");
}

function newReferralCode(): string {
  return randomBytes(5).toString("hex"); // 10 chars
}

export async function createTechniqueShare(
  userId: string,
  input: {
    analysisId: string;
    card: TechniqueShareCardModel;
  },
): Promise<
  | { ok: true; token: string; path: string; referralCode: string; referralPath: string }
  | { ok: false; error: string }
> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "No athlete profile." };

  // Ensure analysis belongs to athlete
  const analysis = await prisma.techniqueAnalysis.findFirst({
    where: {
      id: input.analysisId,
      athleteProfileId: profile.id,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (!analysis) return { ok: false, error: "Analysis not found." };

  // Public cards must not claim thumbnail media URLs
  const card: TechniqueShareCardModel = {
    ...input.card,
    includeThumbnailInPng: false,
    includedFields: input.card.includedFields.filter((f) => f !== "thumbnail"),
  };

  const referralCode = newReferralCode();
  const referralPath = buildTechniqueReferralPath({ referralCode });
  const payload: TechniqueSharePayload = {
    card,
    referralCode,
    referralPath,
    ctaLabel: card.cta,
    createdFromAnalysisId: input.analysisId,
  };

  const token = newToken();
  await prisma.techniqueShare.create({
    data: {
      athleteProfileId: profile.id,
      techniqueAnalysisId: input.analysisId,
      token,
      referralCode,
      payloadJson: JSON.stringify(payload),
    },
  });

  return {
    ok: true,
    token,
    path: `/share/technique/${token}`,
    referralCode,
    referralPath,
  };
}

export async function getTechniqueShareByToken(
  token: string,
): Promise<{ payload: TechniqueSharePayload; createdAt: string } | null> {
  if (!token || token.length < 16) return null;
  const row = await prisma.techniqueShare.findUnique({
    where: { token },
    select: { payloadJson: true, createdAt: true, expiresAt: true },
  });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    const payload = JSON.parse(row.payloadJson) as TechniqueSharePayload;
    if (!payload?.card?.eyebrow) return null;
    return { payload, createdAt: row.createdAt.toISOString() };
  } catch {
    return null;
  }
}

export async function getTechniqueShareByReferralCode(
  code: string,
): Promise<{ payload: TechniqueSharePayload } | null> {
  if (!isValidReferralCode(code)) return null;
  const row = await prisma.techniqueShare.findUnique({
    where: { referralCode: code },
    select: { payloadJson: true, expiresAt: true },
  });
  if (!row) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    const payload = JSON.parse(row.payloadJson) as TechniqueSharePayload;
    return { payload };
  } catch {
    return null;
  }
}
