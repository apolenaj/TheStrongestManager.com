import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import { COACH_SCOPE_LABELS } from "@/domain/coach";
import type { CoachDashboardView } from "@/services/coach/coach-service";

const URGENCY_VARIANT: Record<
  string,
  "danger" | "warning" | "info" | "success" | "neutral"
> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "success",
};

export function CoachDashboard({ view }: { view: CoachDashboardView }) {
  const attentionOn = view.attention?.enabled === true;
  const attentionItems = view.attention?.items ?? [];

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Permissioned Coach Mode">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
        <span>
          Your roles: <Badge variant="accent">{view.rolesLabel}</Badge>
        </span>
        <ButtonLink href="/app/coach/marketplace" variant="secondary" size="sm">
          Marketplace listing
        </ButtonLink>
      </div>

      {attentionOn ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
              Needs attention
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Prioritized by urgency — capped so the queue stays short.
            </p>
          </div>

          <Alert tone="info" title="How this queue works">
            {view.attention!.honesty[1]} {view.attention!.honesty[3]}
          </Alert>

          {attentionItems.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No athletes need attention right now. Quiet is good — the roster
              below stays available without noise.
            </p>
          ) : (
            <ul className="space-y-3">
              {attentionItems.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-t border-[var(--color-border)] pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          URGENCY_VARIANT[item.urgency] ?? "neutral"
                        }
                      >
                        {item.urgency}
                      </Badge>
                      <Badge variant="neutral">{item.categoryLabel}</Badge>
                    </div>
                    <p className="font-medium text-[var(--color-foreground)]">
                      {item.title}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {item.detail}
                    </p>
                  </div>
                  <ButtonLink href={item.href} variant="secondary" size="sm">
                    Open
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}

          {view.attention!.capped ? (
            <p className="text-xs text-[var(--color-subtle)]">
              Showing top {attentionItems.length} of{" "}
              {view.attention!.totalCandidates} signals — open an athlete
              workspace for the full picture.
            </p>
          ) : null}
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>
                Training-safe signals from athletes who granted access.
              </CardDescription>
            </CardHeader>
            {view.alerts.length === 0 ? (
              <p className="px-1 pb-1 text-sm text-[var(--color-muted)]">
                No alerts right now.
              </p>
            ) : (
              <ul className="space-y-2 px-1 pb-1 text-sm">
                {view.alerts.map((a) => (
                  <li key={a.id}>
                    <Badge
                      variant={a.severity === "warning" ? "warning" : "neutral"}
                    >
                      {a.severity}
                    </Badge>{" "}
                    {a.message}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming reviews</CardTitle>
              <CardDescription>
                Technique items awaiting completion — media stays hidden unless
                scoped.
              </CardDescription>
            </CardHeader>
            {view.upcomingReviews.length === 0 ? (
              <p className="px-1 pb-1 text-sm text-[var(--color-muted)]">
                Nothing queued for review.
              </p>
            ) : (
              <ul className="space-y-2 px-1 pb-1 text-sm">
                {view.upcomingReviews.map((r) => (
                  <li key={r.id}>
                    <span className="font-medium text-[var(--color-foreground)]">
                      {r.athleteLabel}
                    </span>
                    {" — "}
                    {r.title}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      )}

      {attentionOn && view.upcomingReviews.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--color-foreground)]">
            Technique awaiting review
          </h3>
          <ul className="space-y-1 text-sm text-[var(--color-muted)]">
            {view.upcomingReviews.map((r) => (
              <li key={r.id}>
                <span className="text-[var(--color-foreground)]">
                  {r.athleteLabel}
                </span>
                {" — "}
                {r.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Athletes
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {attentionOn
            ? "Roster sorted by attention urgency. Quiet athletes stay listed without extra alerts."
            : "Connected athletes with active grants."}
        </p>
        {view.athletes.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No athletes connected"
              description="Athletes grant access from Settings using your account email. You cannot browse profiles without an active grant."
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4">
            {view.athletes.map((athlete) => (
              <li key={athlete.accessId}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {athlete.attentionUrgency ? (
                        <Badge
                          variant={
                            URGENCY_VARIANT[athlete.attentionUrgency] ??
                            "neutral"
                          }
                        >
                          {athlete.attentionUrgency}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Quiet</Badge>
                      )}
                      {athlete.discipline ? (
                        <Badge variant="neutral">{athlete.discipline}</Badge>
                      ) : null}
                      {athlete.attentionCategories.map((c) => (
                        <Badge key={c} variant="info">
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle>{athlete.displayName}</CardTitle>
                    <CardDescription>
                      {athlete.recentSessions7d} sessions (7d)
                      {athlete.adherencePct != null
                        ? ` · Program adherence estimate ${athlete.adherencePct}%`
                        : ""}
                      {athlete.techniqueTrendLabel
                        ? ` · ${athlete.techniqueTrendLabel}`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  {!attentionOn && athlete.alerts.length > 0 ? (
                    <ul className="list-disc space-y-1 px-1 pb-1 pl-5 text-sm text-[var(--color-muted)]">
                      {athlete.alerts.map((msg) => (
                        <li key={msg}>{msg}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap gap-2 px-1 pb-1 pt-2">
                    {athlete.scopes.slice(0, 4).map((s) => (
                      <Badge key={s} variant="info">
                        {COACH_SCOPE_LABELS[s]}
                      </Badge>
                    ))}
                  </div>
                  <div className="px-1 pb-1 pt-2">
                    <ButtonLink
                      href={`/app/coach/${athlete.athleteProfileId}`}
                      variant="secondary"
                      size="sm"
                    >
                      Open workspace
                    </ButtonLink>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Recent activity
        </h2>
        {view.recentActivity.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No recent training activity from connected athletes.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {view.recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-2"
              >
                <span>
                  <span className="font-medium text-[var(--color-foreground)]">
                    {item.athleteLabel}
                  </span>
                  {" — "}
                  {item.title}
                </span>
                <span className="text-[var(--color-muted)]">
                  {new Date(item.when).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
