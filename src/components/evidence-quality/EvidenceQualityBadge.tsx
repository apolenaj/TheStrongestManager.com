import Link from "next/link";
import { Badge } from "@/design-system";
import type { EvidenceQualityBadgeModel } from "@/domain/evidence-quality";
import {
  EVIDENCE_QUALITY_FAMILY_BY_LABEL,
  type EvidenceQualityLabel,
  buildEvidenceQualityBadge,
} from "@/domain/evidence-quality";

function badgeVariant(
  label: EvidenceQualityLabel,
): "success" | "accent" | "neutral" | "info" {
  const family = EVIDENCE_QUALITY_FAMILY_BY_LABEL[label];
  if (family === "research_evidence") {
    if (label === "strong_evidence") return "success";
    if (label === "moderate_evidence") return "accent";
    return "neutral";
  }
  if (label === "historical_method") return "neutral";
  if (label === "heuristic") return "info";
  return "info";
}

export function EvidenceQualityBadge({
  model,
  showFamily = true,
}: {
  model: EvidenceQualityBadgeModel;
  showFamily?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showFamily ? (
        <Badge variant="neutral">{model.familyDisplay}</Badge>
      ) : null}
      <Badge variant={badgeVariant(model.label)}>{model.display}</Badge>
    </div>
  );
}

export function EvidenceQualityClaimBlock({
  model,
}: {
  model: EvidenceQualityBadgeModel;
}) {
  return (
    <div className="grid gap-2">
      <EvidenceQualityBadge model={model} />
      <p className="text-xs text-[var(--color-muted)]">{model.description}</p>
      {model.citation ? (
        <p className="text-xs text-[var(--color-subtle)]">
          Source:{" "}
          {model.citation.url ? (
            <a
              href={model.citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              {model.citation.label}
            </a>
          ) : (
            <span>{model.citation.label} (no URL on file)</span>
          )}
        </p>
      ) : (
        <p className="text-xs text-[var(--color-subtle)]">
          No citation URL on file — we do not invent sources.
        </p>
      )}
    </div>
  );
}

export function EvidenceQualityLabelChip({
  label,
  showFamily = false,
}: {
  label: EvidenceQualityLabel;
  showFamily?: boolean;
}) {
  return (
    <EvidenceQualityBadge
      model={buildEvidenceQualityBadge({ label })}
      showFamily={showFamily}
    />
  );
}

export function EvidenceQualityLegendLink() {
  return (
    <Link
      href="/evidence"
      className="text-xs text-[var(--color-accent)] underline-offset-2 hover:underline"
    >
      Evidence label guide
    </Link>
  );
}
