import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeExerciseIntelligence() {
  return (
    <HomeSection
      id="exercises"
      eyebrow="Exercises"
      title="Lifts tied to technique, programming, and methods"
      description="Browse a curated catalog by muscle, equipment, and sport role — then open cues and related methods without scrolling a random dump."
    >
      <ButtonLink href="/exercises" variant="secondary">
        Browse exercises
      </ButtonLink>
    </HomeSection>
  );
}
