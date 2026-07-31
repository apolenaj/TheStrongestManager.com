import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AdaptationsPanel } from "@/components/adaptive/AdaptationsPanel";
import { ButtonLink, EmptyState } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { listAdaptationsForUser } from "@/services/adaptive/adaptation-service";
import { prisma } from "@/lib/db";
import { normalizeMassUnit } from "@/services/units/convert";

export const metadata: Metadata = {
  title: "Adaptations",
  robots: { index: false, follow: false },
};

export default async function AdaptationsPage() {
  const session = await requireSession();
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { units: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Programming"
        title="Adaptations"
        description="Review suggested program changes before anything is applied."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding to unlock adaptive programming suggestions."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const items = await listAdaptationsForUser(session.user.id);
  const units = normalizeMassUnit(profile.units);

  return (
    <AppPage
      eyebrow="Programming"
      title="Adaptations"
      description="Recommended change, reason, and confidence — Accept, Modify, or Decline. Nothing is applied silently."
    >
      <AdaptationsPanel items={items} units={units} />
    </AppPage>
  );
}
