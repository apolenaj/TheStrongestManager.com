import { Alert } from "@/design-system";
import {
  LEGENDARY_DISCLAIMER_COMPLETE,
  LEGENDARY_DISCLAIMER_SHORT,
  LEGENDARY_METHODS_DISCLAIMER,
  LEGENDARY_RELATED_PROGRAMME_INDEPENDENCE,
} from "@/domain/legendary-methods";

type DisclaimerVariant = "short" | "complete" | "index";

/**
 * Reusable legal disclaimer for Legendary Training Methods.
 * Short near tops/CTAs; complete near sources and page footers.
 */
export function LegendaryMethodDisclaimer({
  variant = "complete",
  className,
}: {
  variant?: DisclaimerVariant;
  className?: string;
}) {
  if (variant === "short") {
    return (
      <p
        className={
          className ??
          "border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]"
        }
        role="note"
      >
        {LEGENDARY_DISCLAIMER_SHORT}
      </p>
    );
  }

  if (variant === "index") {
    return (
      <Alert tone="info" title="Independent educational analysis">
        <ul className="space-y-2.5 text-sm">
          {LEGENDARY_METHODS_DISCLAIMER.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Alert>
    );
  }

  return (
    <aside
      className={
        className ??
        "border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm leading-relaxed text-[var(--color-muted)]"
      }
      aria-label="Legal disclaimer"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Independent educational analysis
      </p>
      <p className="mt-2">{LEGENDARY_DISCLAIMER_COMPLETE}</p>
    </aside>
  );
}

export function LegendaryRelatedProgrammeDisclaimer() {
  return (
    <p className="mt-3 max-w-prose text-sm text-[var(--color-muted)]">
      {LEGENDARY_RELATED_PROGRAMME_INDEPENDENCE}{" "}
      {LEGENDARY_DISCLAIMER_SHORT}
    </p>
  );
}
