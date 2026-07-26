"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label } from "@/design-system";
import { recordFeatureFlagsReviewAction } from "@/services/admin/actions";

export function FeatureFlagsReviewForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        setOk(false);
        startTransition(async () => {
          const result = await recordFeatureFlagsReviewAction(fd);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setOk(true);
          router.refresh();
        });
      }}
    >
      <p className="text-sm text-[var(--color-muted)]">
        Flags are controlled via environment variables. Recording a review
        snapshots current values into the audit log — it does not toggle them
        from the browser.
      </p>
      <div>
        <Label htmlFor="flags-note">Optional note</Label>
        <Input id="flags-note" name="note" className="mt-1 min-h-12" />
      </div>
      <Button type="submit" disabled={pending}>
        Record flag review
      </Button>
      {error ? (
        <Alert tone="danger" title="Failed">
          {error}
        </Alert>
      ) : null}
      {ok ? (
        <Alert tone="success" title="Audited">
          Feature flag review written to the audit log.
        </Alert>
      ) : null}
    </form>
  );
}
