import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { AthleteProfileEditor } from "@/components/athlete-profile/AthleteProfileEditor";
import { PublicProfileSettingsForm } from "@/components/public-profile/PublicProfileSettingsForm";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { EmptyState } from "@/design-system";
import { ButtonLink } from "@/design-system";
import { requireSession } from "@/services/auth/session";
import { getAthleteProfileForUser } from "@/services/athlete-profile/profile-service";
import { getPublicProfileSettings } from "@/services/public-profile";

export const metadata: Metadata = {
  title: "Athlete profile",
  robots: { index: false, follow: false },
};

export default async function AthleteProfilePage() {
  const session = await requireSession();
  const [profile, publicSettings] = await Promise.all([
    getAthleteProfileForUser(session.user.id),
    getPublicProfileSettings(session.user.id),
  ]);

  if (!profile) {
    return (
      <AppPage
        eyebrow="Athlete"
        title="Athlete profile"
        description="Complete onboarding to create your persistent athlete profile."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Onboarding builds your profile from the answers you provide — nothing is invented."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  return (
    <AppPage
      eyebrow="Athlete"
      title="Athlete profile"
      description="Persistent training identity. Edits are saved explicitly; personal records append history instead of overwriting."
    >
      <div className="grid gap-8">
        <AthleteProfileEditor profile={profile} />
        <FeatureGate
          flag="publicAthleteProfile"
          title="Public profile"
          description="Optional public athlete profiles are behind a feature flag."
        >
          {publicSettings ? (
            <PublicProfileSettingsForm settings={publicSettings} />
          ) : null}
        </FeatureGate>
      </div>
    </AppPage>
  );
}
