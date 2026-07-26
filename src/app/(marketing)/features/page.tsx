import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Athlete profile, programming, workout logging, technique review, recovery, progress, coach tools, and academy — what TheStrongestManager includes today.",
  alternates: { canonical: "/features" },
};

const capabilities = [
  {
    title: "Athlete profile and assessment",
    body: "Capture goals, experience, and reported readiness so programming starts from a real athlete context.",
  },
  {
    title: "Programming and workouts",
    body: "Assign programs, open Today, log sets, and review adaptations you approve before they change the plan.",
  },
  {
    title: "Technique review",
    body: "Upload privately. Deadlift movement analysis can run when camera and pose data are suitable; other lifts wait for a real backend without invented scores.",
  },
  {
    title: "Recovery and nutrition",
    body: "Log recovery check-ins in-app. Mealnexio nutrition sync is planned; targets stay empty until a real API adapter is live.",
  },
  {
    title: "Coach tools and academy",
    body: "Grant coach access with scopes, leave timestamped notes, and take courses that issue a Certificate of Completion — not fake accreditation.",
  },
] as const;

export default function FeaturesPage() {
  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Product"
        title="Features"
        description="Tools for assessment, programming, technique review, recovery, and coaching education — shipped when they work, empty when data is missing."
      >
        <ul className="grid gap-6 sm:grid-cols-2">
          {capabilities.map((item) => (
            <li
              key={item.title}
              className="border-t border-[var(--color-border)] pt-4"
            >
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-foreground)]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </PageIntro>
    </MarketingContainer>
  );
}
