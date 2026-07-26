import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { AcademyLanding } from "@/components/academy/AcademyLanding";
import { featureFlags } from "@/config/feature-flags";
import {
  listAcademyCatalog,
  listAcademyPathCatalog,
} from "@/services/academy/academy-service";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Strength education courses with Certificate of Completion — not fake accredited certifications.",
  alternates: { canonical: "/academy" },
};

export default function AcademyPage() {
  const courses = listAcademyCatalog();
  const academy20Enabled = featureFlags.academy20;
  const paths = academy20Enabled ? listAcademyPathCatalog() : [];

  return (
    <MarketingContainer>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Academy
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Learn strength & coaching
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {academy20Enabled
            ? "Learning paths, prerequisites, quizzes, and practical assignments for athletes and coaches. Finish a course to earn a Certificate of Completion — not an accredited professional credential."
            : "Structured courses for athletes and coaches. Finish a course to earn a Certificate of Completion — not an accredited professional credential."}
        </p>
      </div>
      <AcademyLanding
        courses={courses}
        basePath="/academy"
        academy20Enabled={academy20Enabled}
        paths={paths}
      />
    </MarketingContainer>
  );
}
