import { Badge } from "@/design-system";
import {
  confidenceBadgeVariant,
  formatConfidenceLabel,
} from "@/domain/confidence-system";
import { featureFlags } from "@/config/feature-flags";

/**
 * Universal confidence badge — High / Moderate / Low / Insufficient data.
 * Never renders a precise percentage.
 */
export function ConfidenceBadge({
  confidence,
  prefix = "Confidence",
  className,
}: {
  confidence: string | null | undefined;
  /** Set null to show label only (e.g. inside Why panel). */
  prefix?: string | null;
  className?: string;
}) {
  const label = formatConfidenceLabel(confidence);
  const text = prefix ? `${prefix}: ${label}` : label;

  if (!featureFlags.confidenceSystem) {
    return (
      <Badge variant="neutral" className={className}>
        {text}
      </Badge>
    );
  }

  return (
    <Badge
      variant={confidenceBadgeVariant(confidence)}
      className={className}
    >
      {text}
    </Badge>
  );
}
