"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
} from "@/design-system";
import { COACH_SCOPE_LABELS, DEFAULT_COACH_SCOPES } from "@/domain/coach";
import {
  enableCoachRoleAction,
  grantCoachAccessAction,
  revokeCoachAccessAction,
} from "@/services/coach/actions";

type GrantRow = {
  id: string;
  status: string;
  scopes: string[];
  coachEmail: string;
  coachName: string | null;
  grantedAt: string | null;
  revokedAt: string | null;
};

export function CoachAccessSettings({
  roles,
  grants,
}: {
  roles: { isAthlete: boolean; isCoach: boolean };
  grants: GrantRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) setMessage("Saved.");
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
          Roles
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          You can be an athlete, a coach, or both. Coach Mode only sees athletes
          who grant access.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.isAthlete ? <Badge variant="accent">Athlete</Badge> : null}
          {roles.isCoach ? <Badge variant="info">Coach</Badge> : null}
        </div>
        {!roles.isCoach ? (
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={pending}
              onClick={() => run(() => enableCoachRoleAction())}
            >
              Enable Coach Mode
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Coach Mode is on. Open{" "}
            <Link href="/app/coach" className="text-[var(--color-accent)]">
              Coach dashboard
            </Link>
            .
          </p>
        )}
      </div>

      {roles.isAthlete ? (
        <div className="space-y-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
              Coach access
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Grant access by coach account email. Default scopes:{" "}
              {DEFAULT_COACH_SCOPES.map((s) => COACH_SCOPE_LABELS[s]).join(", ")}
              . Recovery, detailed body metrics, and technique media stay off
              unless you check them.
            </p>
          </div>

          <form
            className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              run(() => grantCoachAccessAction(formData));
            }}
          >
            <div>
              <Label htmlFor="coachEmail">Coach email</Label>
              <Input
                id="coachEmail"
                name="coachEmail"
                type="email"
                required
                className="min-h-12"
                placeholder="coach@example.com"
              />
            </div>
            <div>
              <Label htmlFor="note">Optional note</Label>
              <Input id="note" name="note" className="min-h-12" />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-[var(--color-foreground)]">
                Optional sensitive scopes
              </legend>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <input type="checkbox" name="scope_recovery" />
                Recovery check-ins
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <input type="checkbox" name="scope_body" />
                Detailed body metrics
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <input type="checkbox" name="scope_media" />
                Technique video / media
              </label>
            </fieldset>
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              Grant access
            </Button>
          </form>

          {grants.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No coaches have access yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {grants.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">
                      {g.coachEmail}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      <Badge variant="neutral">{g.status}</Badge>{" "}
                      {g.scopes.join(", ")}
                    </p>
                  </div>
                  {g.status === "active" ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("accessId", g.id);
                        run(() => revokeCoachAccessAction(fd));
                      }}
                    >
                      Revoke
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {error ? (
        <Alert tone="danger" title="Could not update">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Updated">
          {message}
        </Alert>
      ) : null}
    </div>
  );
}
