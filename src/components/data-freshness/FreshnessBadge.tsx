import { Badge } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  FRESHNESS_BAND_LABELS,
  freshnessBadgeVariant,
  type FreshnessBand,
} from "@/domain/data-freshness";

/**
 * Universal freshness badge — Fresh / Aging / Stale / Missing.
 */
export function FreshnessBadge({
  band,
  label,
  className,
}: {
  band: FreshnessBand;
  /** Override label; defaults to band label. */
  label?: string;
  className?: string;
}) {
  if (!featureFlags.dataFreshnessSystem) return null;

  return (
    <Badge variant={freshnessBadgeVariant(band)} className={className}>
      {label ?? FRESHNESS_BAND_LABELS[band]}
    </Badge>
  );
}
