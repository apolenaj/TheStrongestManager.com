import { HomeSection } from "@/components/marketing/HomeSection";

export function HomeNutrition() {
  return (
    <HomeSection
      id="nutrition"
      tone="surface"
      eyebrow="Nutrition"
      title="Mealnexio sync is planned — not live yet"
      description="Training and fueling should connect when a real API is available. Until then, Nutrition shows status and empty targets instead of invented macros."
    >
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
        Visit Mealnexio for nutrition tooling today. In-app sync stays behind a
        feature flag until the adapter ships.
      </p>
      <p className="mt-4">
        <a
          href="https://mealnexio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          Visit Mealnexio.com
        </a>
      </p>
    </HomeSection>
  );
}
