import { HomeSection } from "@/components/marketing/HomeSection";
import { homeCopy } from "@/lib/content/home";

export function HomeAthleteIntelligence() {
  return (
    <HomeSection
      id="athlete-intelligence"
      tone="surface"
      eyebrow="Athlete profile"
      title="Know where you stand before you rewrite the block"
      description="Set goals and readiness, then track scores that say what was measured — and what was estimated or reported."
    >
      <ul className="grid gap-8 sm:grid-cols-3">
        {homeCopy.intelligence.map((item) => (
          <li key={item.title} className="border-t border-[var(--color-border)] pt-5">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
