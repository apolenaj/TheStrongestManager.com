"use client";

import { useActionState } from "react";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
  Textarea,
} from "@/design-system";
import {
  restoreProgramVersionAction,
  saveProgramVersionAction,
  type ProgramVersionActionState,
} from "@/services/program-version/actions";
import {
  PROGRAM_VERSION_HONESTY,
  type ProgramVersionRecord,
} from "@/domain/program-version";

const initial: ProgramVersionActionState = { ok: false };

export function ProgramVersionHistory({
  programId,
  programName,
  currentVersionNumber,
  versions,
}: {
  programId: string;
  programName: string;
  currentVersionNumber: number;
  versions: ProgramVersionRecord[];
}) {
  const [saveState, saveAction, savePending] = useActionState(
    saveProgramVersionAction,
    initial,
  );
  const [restoreState, restoreAction, restorePending] = useActionState(
    restoreProgramVersionAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Program history">
        {PROGRAM_VERSION_HONESTY[0]} {PROGRAM_VERSION_HONESTY[1]}
      </Alert>
      <Alert tone="warning" title="Completed training is protected">
        {PROGRAM_VERSION_HONESTY[2]}
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        {programName} · current{" "}
        {currentVersionNumber > 0 ? `v${currentVersionNumber}` : "no versions yet"}
      </p>

      <section className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Save new version
        </h2>
        <form action={saveAction} className="grid gap-3">
          <input type="hidden" name="programId" value={programId} />
          <div>
            <Label htmlFor="reason">Why (required)</Label>
            <Textarea
              id="reason"
              name="reason"
              rows={2}
              className="mt-1"
              placeholder="e.g. Reduced squat volume after missed reps"
              required
            />
          </div>
          <Button type="submit" loading={savePending}>
            Save as next version
          </Button>
        </form>
        {saveState.error ? (
          <Alert tone="danger" title="Save failed">
            {saveState.error}
          </Alert>
        ) : null}
        {saveState.message ? (
          <Alert tone="success" title="Version saved">
            {saveState.message}
          </Alert>
        ) : null}
      </section>

      {restoreState.error ? (
        <Alert tone="danger" title="Restore failed">
          {restoreState.error}
        </Alert>
      ) : null}
      {restoreState.message ? (
        <Alert tone="success" title="Restored">
          {restoreState.message}
        </Alert>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Version history
        </h2>
        {versions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No versions yet. Save v1 after your first meaningful change.
          </p>
        ) : (
          <ul className="grid gap-4">
            {versions.map((v) => (
              <li
                key={v.id}
                className="grid gap-3 border-t border-[var(--color-border)] pt-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      v.versionNumber === currentVersionNumber
                        ? "accent"
                        : "neutral"
                    }
                  >
                    {v.label}
                  </Badge>
                  <Badge variant="neutral">{v.source}</Badge>
                  {v.restoredFromVersionNumber != null ? (
                    <Badge variant="info">
                      restored from v{v.restoredFromVersionNumber}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--color-foreground)]">
                  {v.reason}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {v.changedByName ?? "Unknown"} ·{" "}
                  {new Date(v.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-[var(--color-subtle)]">
                  Snapshot: {v.snapshot.exercises.length} exercise line(s),{" "}
                  {v.snapshot.weeks.length} week(s)
                </p>
                {v.versionNumber !== currentVersionNumber ? (
                  <form action={restoreAction} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <input type="hidden" name="programId" value={programId} />
                    <input
                      type="hidden"
                      name="versionNumber"
                      value={v.versionNumber}
                    />
                    <div>
                      <Label htmlFor={`restore-reason-${v.id}`}>
                        Restore reason
                      </Label>
                      <Input
                        id={`restore-reason-${v.id}`}
                        name="reason"
                        className="mt-1"
                        placeholder={`Restore ${v.label} because…`}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      loading={restorePending}
                    >
                      Restore {v.label}
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">
                    This is the current version tip.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
