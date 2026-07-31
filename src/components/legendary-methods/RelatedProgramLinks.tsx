"use client";

import {
  defaultLegendaryProgrammeConversionPrompt,
  type LegendaryMethodCategory,
} from "@/domain/legendary-methods";
import { LegendaryAnalyticsLink } from "@/components/legendary-methods/LegendaryAnalytics";

type ResolvedRelatedProgramme = {
  slug: string;
  title: string;
  href: string;
  relationship: string;
  conversionPrompt?: string;
};

export function RelatedProgramLinks({
  programmes,
  profileSlug,
  category,
}: {
  programmes: ResolvedRelatedProgramme[];
  profileSlug: string;
  category: LegendaryMethodCategory;
}) {
  if (programmes.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Related programme links will appear when this profile is published with
        curated associations.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:gap-8">
      {programmes.map((programme) => {
        const prompt =
          programme.conversionPrompt?.trim() ||
          defaultLegendaryProgrammeConversionPrompt(category);
        return (
          <li key={programme.slug} className="legendary-surface p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              {prompt}{" "}
              <LegendaryAnalyticsLink
                href={programme.href}
                event="legendary_profile_programme_clicked"
                eventProps={{
                  slug: profileSlug,
                  programmeSlug: programme.slug,
                }}
                className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                Explore {programme.title}
              </LegendaryAnalyticsLink>
            </p>
            <p className="mt-2 text-xs text-[var(--color-subtle)]">
              {programme.relationship}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
