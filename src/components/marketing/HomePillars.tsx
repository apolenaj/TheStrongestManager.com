import { homeCopy } from "@/lib/content/home";
import { HomeSection } from "@/components/marketing/HomeSection";

export function HomePillars() {
  return (
    <HomeSection
      id="pillars"
      eyebrow="How it works"
      title="Understand. Train. Improve."
      description="Keep the loop short: know your context, complete the session, then decide what changes next."
    >
      <ul className="grid gap-8 md:grid-cols-3">
        {homeCopy.pillars.map((pillar, index) => (
          <li
            key={pillar.title}
            className="home-rise border-t border-[var(--color-border)] pt-5"
            style={{ animationDelay: `${0.05 * index}s` }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              0{index + 1}
            </p>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-foreground)]">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              {pillar.body}
            </p>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
