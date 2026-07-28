"use client";

import {
  defaultLegendaryProgrammeConversionPrompt,
  type LegendaryMethodCategory,
  type RelatedProgramme,
} from "@/domain/legendary-methods";
import { LegendaryAnalyticsLink } from "@/components/legendary-methods/LegendaryAnalytics";

export function RelatedProgramLinks({
  programmes,
  profileSlug,
  category,
}: {
  programmes: RelatedProgramme[];
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
    <ul className="space-y-5">
      {programmes.map((programme) => {
        const prompt =
          programme.conversionPrompt?.trim() ||
          defaultLegendaryProgrammeConversionPrompt(category);
        return (
          <li key={programme.slug}>
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
            <p className="mt-1 text-xs text-[var(--color-subtle)]">
              {programme.relationship}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
