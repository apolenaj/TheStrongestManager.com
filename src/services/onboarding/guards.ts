import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireCompletedOnboarding(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { onboardingCompletedAt: true },
  });

  if (!profile?.onboardingCompletedAt) {
    redirect("/app/onboarding");
  }

  return profile;
}

export async function redirectIfOnboardingComplete(userId: string) {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { onboardingCompletedAt: true },
  });

  if (profile?.onboardingCompletedAt) {
    redirect("/app/dashboard");
  }
}
