import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeAdaptiveTraining() {
  return (
    <HomeSection
      id="adaptive-training"
      tone="surface"
      eyebrow="Training"
      title="Programming that follows the sessions you actually complete"
      description="Assign a program, open Today, log the work, then review suggested adaptations — you approve changes; nothing auto-rewrites your plan silently."
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
          The loop is assessment → program → session → feedback → adaptation.
          Not a one-click random workout generator.
        </p>
        <ButtonLink href="/app/today" variant="secondary">
          Open Today
        </ButtonLink>
      </div>
    </HomeSection>
  );
}
