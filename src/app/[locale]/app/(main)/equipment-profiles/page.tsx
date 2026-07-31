import type { Metadata } from "next";
import Link from "next/link";
import { AppPage } from "@/components/app/AppPage";
import { EquipmentProfilesPanel } from "@/components/equipment-profiles/EquipmentProfilesPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import { EQUIPMENT_AWARE_HONESTY } from "@/domain/equipment-profiles";
import { requireSession } from "@/services/auth/session";
import { getAthleteEquipmentProfile } from "@/services/equipment-profiles";
import { getTravelModeView } from "@/services/travel-training-mode";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Equipment profiles",
  robots: { index: false, follow: false },
};

export default async function EquipmentProfilesPage() {
  const session = await requireSession();

  if (!featureFlags.equipmentAwareProgramming) {
    return (
      <AppPage
        eyebrow="Training"
        title="Equipment profiles"
        description="Commercial gym, home gym, powerlifting gym, or minimal — suggestions respect your gear."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_EQUIPMENT_AWARE_PROGRAMMING.
        </Alert>
      </AppPage>
    );
  }

  const [result, travel] = await Promise.all([
    getAthleteEquipmentProfile({
      userId: session.user.id,
    }),
    featureFlags.travelTrainingMode
      ? getTravelModeView({ userId: session.user.id })
      : Promise.resolve(null),
  ]);

  const travelActive =
    travel && travel.ok && travel.view.active && travel.view.current
      ? travel.view.current
      : null;

  return (
    <FeatureGate
      flag="equipmentAwareProgramming"
      title="Equipment profiles"
      description="Equipment-Aware Programming is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Equipment profiles"
        description={EQUIPMENT_AWARE_HONESTY[0]}
      >
        {travelActive ? (
          <div className="mb-6">
            <Alert tone="warning" title={`Travel Mode — ${travelActive.label}`}>
              Home equipment edits are paused. Checklist below reflects travel
              gear until you{" "}
              <Link
                href="/app/travel-mode"
                className="underline underline-offset-2"
              >
                end travel
              </Link>
              .
            </Alert>
          </div>
        ) : null}
        {result.ok ? (
          <EquipmentProfilesPanel view={result.view} />
        ) : result.error === "No athlete profile." ? (
          <EmptyState
            title="No athlete profile yet"
            description="Complete onboarding to set an equipment profile."
            action={
              <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
            }
          />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
