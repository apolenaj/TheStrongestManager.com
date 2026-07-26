import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  DATA_FRESHNESS_HONESTY,
  type FreshnessSnapshot,
  type DomainFreshnessAssessment,
} from "@/domain/data-freshness";
import { FreshnessBadge } from "@/components/data-freshness/FreshnessBadge";

/**
 * Shows Technique / Recovery / Strength freshness lines (Prompt 143).
 */
export function DataFreshnessPanel({
  snapshot,
  title = "Data freshness",
}: {
  snapshot: FreshnessSnapshot;
  title?: string;
}) {
  if (!featureFlags.dataFreshnessSystem) return null;

  const pillars: DomainFreshnessAssessment[] = [
    snapshot.pillars.technique,
    snapshot.pillars.recovery,
    snapshot.pillars.strength,
  ];

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{DATA_FRESHNESS_HONESTY[0]}</CardDescription>
      </CardHeader>
      <ul className="grid gap-3">
        {pillars.map((pillar) => (
          <li
            key={pillar.domain}
            className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {pillar.domainLabel}
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-muted)]">
                {pillar.relativeLabel}
              </p>
            </div>
            <FreshnessBadge band={pillar.band} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        {DATA_FRESHNESS_HONESTY[2]}
      </p>
    </Card>
  );
}
