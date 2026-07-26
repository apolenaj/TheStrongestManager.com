"use client";

import { useState, useTransition } from "react";
import { Alert, Button } from "@/design-system";
import type { AutoregulationOffer } from "@/services/live-session-autoregulation";
import { confirmAutoregulationSuggestionAction } from "@/services/live-session-autoregulation/actions";

export function AutoregulationSuggestionBanner({
  sessionId,
  offer,
  onDismiss,
  onApplied,
}: {
  sessionId: string;
  offer: AutoregulationOffer;
  onDismiss: () => void;
  onApplied: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { suggestion } = offer;

  function confirm() {
    if (!offer.nextSessionSetId || suggestion.proposedNextLoadKg == null) {
      onDismiss();
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await confirmAutoregulationSuggestionAction({
        sessionId,
        nextSessionSetId: offer.nextSessionSetId!,
        proposedLoadKg: suggestion.proposedNextLoadKg!,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onApplied();
    });
  }

  return (
    <Alert tone="warning" title={suggestion.headline}>
      <p className="text-sm">
        Planned: {suggestion.plannedSummary}. Actual:{" "}
        {suggestion.actualSummary} (Δ RPE {suggestion.rpeDelta.toFixed(1)}).
      </p>
      <p className="mt-2 text-sm">{suggestion.detail}</p>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        Requires your confirmation — nothing was changed automatically.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-score-critical)]">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          loading={pending}
          disabled={
            !offer.nextSessionSetId || suggestion.proposedNextLoadKg == null
          }
          onClick={confirm}
        >
          {suggestion.label}
          {suggestion.proposedNextLoadKg != null
            ? ` → ${suggestion.proposedNextLoadKg} kg`
            : ""}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={onDismiss}
        >
          Keep as planned
        </Button>
      </div>
    </Alert>
  );
}
