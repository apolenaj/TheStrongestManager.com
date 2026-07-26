import type { RetentionAnalyticsSnapshot } from "@/domain/retention-analytics";

function formatRate(rate: number | null, decisionReady: boolean): string {
  if (rate == null) return "—";
  const pct = `${(rate * 100).toFixed(1)}%`;
  return decisionReady ? pct : `${pct} (directional)`;
}

function formatDelta(delta: number | null): string {
  if (delta == null) return "—";
  const pct = `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)} pp`;
  return pct;
}

export function RetentionAnalyticsPanel({
  snapshot,
}: {
  snapshot: RetentionAnalyticsSnapshot;
}) {
  const { cohort } = snapshot;

  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Engine
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.engineVersion}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Cohort window
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.cohortDays}d
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Athletes
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.cohortSize}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            D30 retained
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.windows.find((w) => w.id === "d30")?.retained ?? 0}
            <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
              {formatRate(
                cohort.windows.find((w) => w.id === "d30")?.rate ?? null,
                cohort.decisionReady,
              )}
            </span>
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[var(--color-muted)]">{cohort.note}</p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          D1 / D7 / D30
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Window</th>
                <th className="py-2 pr-4 font-medium">Retained</th>
                <th className="py-2 pr-4 font-medium">Eligible</th>
                <th className="py-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {cohort.windows.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-[var(--color-border)]/60"
                >
                  <td className="py-2 pr-4 font-medium">{w.label}</td>
                  <td className="py-2 pr-4">{w.retained}</td>
                  <td className="py-2 pr-4">{w.eligible}</td>
                  <td className="py-2 text-[var(--color-muted)]">
                    {formatRate(w.rate, w.decisionReady)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
          {snapshot.windows.map((w) => (
            <li key={w.id}>
              <span className="font-mono">{w.id}</span> — {w.description}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Subscription retention
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {cohort.subscription.note}
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Paid users
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
              {cohort.subscription.paidUsers}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Still entitled
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
              {cohort.subscription.stillEntitled}
              <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
                {formatRate(
                  cohort.subscription.entitledRate,
                  cohort.subscription.decisionReady,
                )}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Cancel at period end
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
              {cohort.subscription.cancelAtPeriodEnd}
              <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
                {formatRate(
                  cohort.subscription.cancelAtPeriodEndRate,
                  cohort.subscription.decisionReady,
                )}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Feature retention
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Early use in days 0–7 → reuse in days 8–30. Not proof the feature
          caused retention.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Feature</th>
                <th className="py-2 pr-4 font-medium">Early users</th>
                <th className="py-2 pr-4 font-medium">Reuse</th>
                <th className="py-2 font-medium">Reuse rate</th>
              </tr>
            </thead>
            <tbody>
              {cohort.features.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{f.label}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {f.note}
                    </p>
                  </td>
                  <td className="py-3 pr-4">{f.earlyUsers}</td>
                  <td className="py-3 pr-4">{f.reuseUsers}</td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {formatRate(f.rate, f.decisionReady)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Actions vs D30 retention
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Rate delta = D30 rate with early action minus without. Status is never
          “causal.” Min cell size: {snapshot.minCellForCorrelation}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Action (days 0–7)</th>
                <th className="py-2 pr-4 font-medium">With (n / rate)</th>
                <th className="py-2 pr-4 font-medium">Without (n / rate)</th>
                <th className="py-2 pr-4 font-medium">Δ pp</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {cohort.correlations.map((row) => (
                <tr
                  key={row.actionId}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.actionLabel}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.causationNote}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.withAction.n} /{" "}
                    {formatRate(row.withAction.rate, row.status === "estimate_only")}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.withoutAction.n} /{" "}
                    {formatRate(
                      row.withoutAction.rate,
                      row.status === "estimate_only",
                    )}
                  </td>
                  <td className="py-3 pr-4">{formatDelta(row.rateDelta)}</td>
                  <td className="py-3 font-mono text-xs">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {snapshot.sampleAthletes.length > 0 ? (
        <section>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Sample athletes
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">D1</th>
                  <th className="py-2 pr-4 font-medium">D7</th>
                  <th className="py-2 pr-4 font-medium">D30</th>
                  <th className="py-2 font-medium">Paid / entitled</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.sampleAthletes.map((a) => (
                  <tr
                    key={a.userId}
                    className="border-b border-[var(--color-border)]/60"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">
                      {a.userId.slice(0, 10)}…
                    </td>
                    <td className="py-2 pr-4">
                      {a.windows.d1 ? "yes" : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {a.windows.d7 ? "yes" : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {a.windows.d30 ? "yes" : "—"}
                    </td>
                    <td className="py-2 text-xs text-[var(--color-muted)]">
                      {a.subscriptionPaid
                        ? a.subscriptionStillEntitled
                          ? "paid / entitled"
                          : "paid / not entitled"
                        : "free"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Sample athletes
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No non-demo athlete signups in the last {snapshot.cohortDays} days.
          </p>
        </section>
      )}
    </div>
  );
}
