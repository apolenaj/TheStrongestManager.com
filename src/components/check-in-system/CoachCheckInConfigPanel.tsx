"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert, Badge, Button } from "@/design-system";
import {
  CHECK_IN_CATEGORY_LABELS,
  CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS,
} from "@/domain/check-in-system";
import type { CoachCheckInConfigView } from "@/services/check-in-system";
import { saveCoachCheckInConfigAction } from "@/services/check-in-system/actions";

export function CoachCheckInConfigPanel({
  view,
}: {
  view: CoachCheckInConfigView;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid gap-6 max-w-2xl">
      <Alert tone="info" title="Configure weekly check-in">
        {view.honesty[2]} Only allowlisted training-safe questions can be
        enabled.
      </Alert>
      <Alert tone="warning" title="Not available as questions">
        We do not ask: {CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS.slice(0, 6).join(", ")}
        …
      </Alert>

      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">
          {view.athleteDisplayName ?? "Athlete"}
        </Badge>
        <Badge variant="neutral">
          {view.isAthleteSpecific ? "Athlete-specific" : "Using coach default"}
        </Badge>
      </div>

      {error ? (
        <Alert tone="danger" title="Save failed">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Saved">
          {message}
        </Alert>
      ) : null}

      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await saveCoachCheckInConfigAction(fd);
            if (!result.ok) {
              setError(result.error);
              setMessage(null);
            } else {
              setError(null);
              setMessage("Check-in questions updated.");
              router.refresh();
            }
          });
        }}
      >
        <input
          type="hidden"
          name="athleteProfileId"
          value={view.athleteProfileId}
        />
        <ul className="grid gap-3">
          {view.catalog.map((q) => (
            <li key={q.key}>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="questionKey"
                  value={q.key}
                  defaultChecked={view.enabledKeys.includes(q.key)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{q.prompt}</span>
                  <span className="mt-0.5 block text-[var(--color-muted)]">
                    {CHECK_IN_CATEGORY_LABELS[q.category]}
                    {q.helper ? ` · ${q.helper}` : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="applyAsDefault" />
          Also save as my default for all athletes
        </label>
        <Button type="submit" disabled={pending}>
          Save configuration
        </Button>
      </form>
    </div>
  );
}
