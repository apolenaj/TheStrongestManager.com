"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Label,
  Textarea,
} from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  MODEL_FEEDBACK_VERDICT_LABELS,
  type AthleteFeedbackVerdict,
  type ModelFeedbackRelatedType,
} from "@/domain/model-feedback";
import { submitModelFeedbackAction } from "@/services/model-feedback/actions";

/**
 * Athlete thumbs: Helpful / Not helpful + optional reason.
 * Never implies production retrain.
 */
export function AthleteAiFeedbackControls({
  relatedType,
  relatedId,
}: {
  relatedType: ModelFeedbackRelatedType;
  relatedId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<AthleteFeedbackVerdict | null>(null);
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);

  if (!featureFlags.modelFeedback) return null;

  function submit(verdict: AthleteFeedbackVerdict) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("role", "athlete");
      fd.set("relatedType", relatedType);
      fd.set("relatedId", relatedId);
      fd.set("verdict", verdict);
      if (reason.trim()) fd.set("reason", reason.trim());
      const result = await submitModelFeedbackAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(verdict);
    });
  }

  return (
    <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
      <p className="text-xs text-[var(--color-muted)]">
        Was this recommendation helpful? Feedback is reviewed — it does not
        automatically retrain production AI.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={saved === "helpful" ? "primary" : "secondary"}
          disabled={pending}
          onClick={() => submit("helpful")}
        >
          {MODEL_FEEDBACK_VERDICT_LABELS.helpful}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={saved === "not_helpful" ? "primary" : "secondary"}
          disabled={pending}
          onClick={() => submit("not_helpful")}
        >
          {MODEL_FEEDBACK_VERDICT_LABELS.not_helpful}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => setShowReason((v) => !v)}
        >
          {showReason ? "Hide reason" : "Add reason"}
        </Button>
      </div>
      {showReason ? (
        <div>
          <Label htmlFor={`fb-reason-${relatedId}`}>Reason (optional)</Label>
          <Textarea
            id={`fb-reason-${relatedId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="What helped or missed the mark?"
          />
        </div>
      ) : null}
      {saved ? (
        <p className="text-xs text-[var(--color-subtle)]">
          Saved: {MODEL_FEEDBACK_VERDICT_LABELS[saved]}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}
