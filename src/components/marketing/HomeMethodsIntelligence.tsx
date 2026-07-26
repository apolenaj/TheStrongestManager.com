import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeMethodsIntelligence() {
  return (
    <HomeSection
      id="methods"
      tone="surface"
      eyebrow="Training methods"
      title="Where a method came from, when it fits, and what it cannot do"
      description="Historical and modern approaches with clear limits — compare options when you need a side-by-side view."
    >
      <ButtonLink href="/methods" variant="secondary">
        Browse training methods
      </ButtonLink>
    </HomeSection>
  );
}
