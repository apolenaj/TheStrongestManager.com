"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label } from "@/design-system";
import { recordContentReviewAction } from "@/services/admin/actions";

export function AdminReviewForm({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      className="mt-2 flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        setOk(false);
        startTransition(async () => {
          const result = await recordContentReviewAction(fd);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setOk(true);
          e.currentTarget.reset();
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor={`note-${entityId}`} className="sr-only">
          Review note
        </Label>
        <Input
          id={`note-${entityId}`}
          name="note"
          placeholder="Optional audit note"
          className="min-h-10"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        Record review
      </Button>
      {error ? (
        <Alert tone="danger" title="Failed">
          {error}
        </Alert>
      ) : null}
      {ok ? (
        <span className="text-xs text-[var(--color-score-excellent)]">
          Audited
        </span>
      ) : null}
    </form>
  );
}
