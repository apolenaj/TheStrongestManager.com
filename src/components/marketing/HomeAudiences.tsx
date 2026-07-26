import { HomeSection } from "@/components/marketing/HomeSection";
import { homeCopy } from "@/lib/content/home";

export function HomeAudiences() {
  return (
    <HomeSection
      id="who"
      eyebrow="Who it is for"
      title="Strength sports and the coaches who program them"
      description="Powerlifting, bodybuilding, strongman, weightlifting, general strength, hybrid athletes, and coaches."
    >
      <ul className="flex flex-wrap gap-x-2 gap-y-3">
        {homeCopy.audiences.map((audience) => (
          <li
            key={audience}
            className="border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-foreground)]"
          >
            {audience}
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
