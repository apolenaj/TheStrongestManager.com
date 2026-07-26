"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
} from "@/design-system";
import {
  createTeamAction,
  setAggregateOptInAction,
} from "@/services/org/actions";
import type { OrgDashboardView } from "@/services/org/org-service";

export function OrgDashboardPanel({ view }: { view: OrgDashboardView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  }

  const a = view.analytics;

  return (
    <div className="space-y-8">
      <Alert tone="warning" title="Privacy boundary">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <div className="flex flex-wrap gap-2 text-sm text-[var(--color-muted)]">
        <Badge variant="accent">{view.organization.kindLabel}</Badge>
        <Badge variant="info">{view.viewer.roleLabel}</Badge>
        {view.viewer.unlocksPrivateData ? (
          <Badge variant="danger">Private data unlocked (unexpected)</Badge>
        ) : (
          <Badge variant="neutral">Private data locked</Badge>
        )}
        {view.viewer.canManageMembers || view.viewer.role === "org_admin" ? (
          <ButtonLink
            href={`/app/org/${view.organization.id}/billing`}
            variant="secondary"
            size="sm"
          >
            Billing
          </ButtonLink>
        ) : null}
      </div>

      {error ? (
        <Alert tone="danger" title="Could not save">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Updated">
          {message}
        </Alert>
      ) : null}

      {view.selfMembership ? (
        <section className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <h2 className="font-medium text-[var(--color-foreground)]">
            Your aggregate opt-in
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Training adherence and participation rollups include you only when
            you opt in. Recovery, body metrics, and notes are never included.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => setAggregateOptInAction(fd));
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <input
              type="hidden"
              name="organizationId"
              value={view.organization.id}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="aggregateOptIn"
                defaultChecked={view.selfMembership.aggregateOptIn}
              />
              Include my training in org analytics
            </label>
            <Button type="submit" size="sm" disabled={pending}>
              Save preference
            </Button>
          </form>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>{view.memberCounts.totalActive}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coaches</CardTitle>
            <CardDescription>{view.memberCounts.coaches}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Athletes</CardTitle>
            <CardDescription>{view.memberCounts.athletes}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Opted into analytics</CardTitle>
            <CardDescription>
              {view.memberCounts.optedInAthletes}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {!view.viewer.canViewAggregates ? (
        <EmptyState
          title="Analytics not available for your role"
          description="Organization admins and coaches with view_aggregates see training adherence, participation, and performance trends for opted-in athletes."
        />
      ) : a == null || a.optedInAthletes === 0 ? (
        <EmptyState
          title="No aggregate data yet"
          description="Athletes must opt in before training adherence and participation appear here. No private health fields are ever loaded for org admins."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Training adherence
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Mean adherence</CardTitle>
                  <CardDescription>
                    {a.meanAdherencePct != null
                      ? `${a.meanAdherencePct}%`
                      : "—"}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Missed training (7d)</CardTitle>
                  <CardDescription>
                    {a.athletesMissedTraining7d} athlete
                    {a.athletesMissedTraining7d === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sessions (28d)</CardTitle>
                  <CardDescription>{a.sessionCount28d}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Participation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>7-day participation</CardTitle>
                  <CardDescription>
                    {a.participationRate7d != null
                      ? `${a.participationRate7d}%`
                      : "—"}{" "}
                    of opted-in athletes trained
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sessions (7d)</CardTitle>
                  <CardDescription>{a.sessionCount7d}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Performance trends
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Mean technique Δ</CardTitle>
                  <CardDescription>
                    {a.meanTechniqueDelta != null
                      ? `${a.meanTechniqueDelta > 0 ? "+" : ""}${a.meanTechniqueDelta}`
                      : "Thin data"}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Improving share</CardTitle>
                  <CardDescription>
                    {a.techniqueImprovingShare != null
                      ? `${a.techniqueImprovingShare}%`
                      : "—"}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Regression share</CardTitle>
                  <CardDescription>
                    {a.techniqueRegressionShare != null
                      ? `${a.techniqueRegressionShare}%`
                      : "—"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Teams
            </h2>
            {a.teams.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                No teams yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {a.teams.map((t) => (
                  <li
                    key={t.teamId}
                    className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-2"
                  >
                    <span className="font-medium text-[var(--color-foreground)]">
                      {t.teamName}
                    </span>
                    <span className="text-[var(--color-muted)]">
                      {t.optedInAthletes} opted-in ·{" "}
                      {t.participationRate7d != null
                        ? `${t.participationRate7d}% participation`
                        : "—"}
                      {t.meanAdherencePct != null
                        ? ` · ${t.meanAdherencePct}% adherence`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Opted-in roster
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Training participation only — no recovery, body, or media fields.
            </p>
            {view.roster.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">Empty roster.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {view.roster.map((row) => (
                  <li
                    key={row.athleteProfileId}
                    className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-2"
                  >
                    <span>
                      <span className="font-medium text-[var(--color-foreground)]">
                        {row.displayName}
                      </span>
                      {row.teamNames.length > 0
                        ? ` · ${row.teamNames.join(", ")}`
                        : ""}
                    </span>
                    <span className="text-[var(--color-muted)]">
                      {row.trainedLast7d ? "Trained" : "Missed"} ·{" "}
                      {row.sessionsLast7d} sessions
                      {row.adherencePct != null
                        ? ` · ~${row.adherencePct}%`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {view.viewer.canManageMembers || view.viewer.role === "org_coach" ? (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Teams
          </h2>
          {view.teams.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No teams created yet.
            </p>
          ) : (
            <ul className="space-y-1 text-sm text-[var(--color-muted)]">
              {view.teams.map((t) => (
                <li key={t.id}>
                  <span className="text-[var(--color-foreground)]">{t.name}</span>
                  {" — "}
                  {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          )}
          {canManageTeams(view) ? (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(() => createTeamAction(fd));
                e.currentTarget.reset();
              }}
            >
              <input
                type="hidden"
                name="organizationId"
                value={view.organization.id}
              />
              <div>
                <Label htmlFor="team-name">New team</Label>
                <Input
                  id="team-name"
                  name="name"
                  required
                  className="mt-1 min-h-12"
                />
              </div>
              <Button type="submit" disabled={pending}>
                Add team
              </Button>
            </form>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function canManageTeams(view: OrgDashboardView): boolean {
  return (
    view.viewer.role === "org_admin" ||
    view.viewer.role === "org_coach" ||
    view.viewer.canManageMembers
  );
}
