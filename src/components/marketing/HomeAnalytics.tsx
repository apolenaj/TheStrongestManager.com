import { ButtonLink } from "@/design-system";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeAnalytics() {
  return (
    <HomeSection
      id="analytics"
      eyebrow="Progress"
      title="Charts from logged sessions — empty until you train"
      description="Progress shows volume, strength trends, and adherence after you log work. New accounts start blank on purpose."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
          Score bands stay consistent: Excellent, Good, Needs attention, and
          Critical (performance band — not a medical status) — each tied to
          documented rules. Full analytics charts are on Pro and Performance.
        </p>
        <ButtonLink href="/app/progress" variant="secondary">
          Open progress
        </ButtonLink>
      </div>
    </HomeSection>
  );
}
