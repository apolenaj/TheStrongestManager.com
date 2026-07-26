import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { featureFlags } from "@/config/feature-flags";
import { resolveOnboardingIntro } from "@/services/growth-experiments";

export default async function OnboardingPage() {
  const intro = await resolveOnboardingIntro();

  return (
    <OnboardingWizard
      personalized={featureFlags.advancedOnboardingPersonalization}
      introEyebrow={intro.introEyebrow}
      introSupport={intro.introSupport}
    />
  );
}
