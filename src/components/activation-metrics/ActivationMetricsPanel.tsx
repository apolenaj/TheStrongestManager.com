import type { ActivationMetricsSnapshot } from "@/domain/activation-metrics";

function formatRate(rate: number | null, decisionReady: boolean): string {
  if (rate == null) return "—";
  const pct = `${(rate * 100).toFixed(1)}%`;
  return decisionReady ? pct : `${pct} (directional)`;
}

export function ActivationMetricsPanel({
  snapshot,
}: {
  snapshot: ActivationMetricsSnapshot;
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
            Signed up
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.totals.signedUp}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Fully activated
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {cohort.totals.fullyActivated}
            <span className="ml-2 text-sm font-sans text-[var(--color-muted)]">
              {formatRate(
                cohort.rates.find((r) => r.id === "fully_activated")
                  ?.rateOfSignedUp ?? null,
                cohort.decisionReady,
              )}
            </span>
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Definition
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Activation criteria
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Criterion</th>
                <th className="py-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.criteria.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{c.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {c.id}
                    </p>
                  </td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Cohort funnel
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{cohort.note}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Partial activation (some criteria, not all):{" "}
          {cohort.partialActivationCount}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Step</th>
                <th className="py-2 pr-4 font-medium">Count</th>
                <th className="py-2 font-medium">Rate of signed up</th>
              </tr>
            </thead>
            <tbody>
              {cohort.rates.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60"
                >
                  <td className="py-2 pr-4">
                    <span
                      className={
                        row.id === "fully_activated" ? "font-medium" : undefined
                      }
                    >
                      {row.label}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{row.count}</td>
                  <td className="py-2 text-[var(--color-muted)]">
                    {formatRate(row.rateOfSignedUp, row.decisionReady)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Not vanity KPIs
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          These may appear in analytics for context. They are not product
          activation.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.vanityMetrics.map((v) => (
            <li key={v.id}>
              <span className="text-[var(--color-fg)]">{v.label}</span>
              {" — "}
              {v.reason}
            </li>
          ))}
        </ul>
      </section>

      {snapshot.sampleAthletes.length > 0 ? (
        <section>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Sample evaluations
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Up to 25 recent cohort athletes (opaque user ids). Return window:{" "}
            {snapshot.returnWindowDays} days.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Onboard</th>
                  <th className="py-2 pr-4 font-medium">Workout</th>
                  <th className="py-2 pr-4 font-medium">Technique</th>
                  <th className="py-2 pr-4 font-medium">D7 return</th>
                  <th className="py-2 font-medium">Activated</th>
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
                      {a.criteria.onboarding_completed ? "yes" : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {a.criteria.first_workout_logged ? "yes" : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {a.criteria.first_technique_uploaded ? "yes" : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {a.criteria.returned_within_seven_days ? "yes" : "—"}
                    </td>
                    <td className="py-2">
                      {a.fullyActivated ? "yes" : "—"}
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
            Sample evaluations
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            No non-demo athlete signups in the last {snapshot.cohortDays} days.
          </p>
        </section>
      )}
    </div>
  );
}
