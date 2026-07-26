import type { GrowthExperimentSnapshot } from "@/domain/growth-experiments";

export function GrowthExperimentPanel({
  snapshot,
}: {
  snapshot: GrowthExperimentSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-3">
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
            Running
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.runningCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Min sample / arm
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.minSamplePerArm}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Guardrails
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <span className="text-[var(--color-muted)]">Allowlist: </span>
          {snapshot.allowlist.join(", ")}
        </p>
        <p className="mt-1 text-sm">
          <span className="text-[var(--color-muted)]">Denylist: </span>
          {snapshot.denylist.join(", ")}
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Registered experiments
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Experiment</th>
                <th className="py-2 pr-4 font-medium">Surface</th>
                <th className="py-2 pr-4 font-medium">Outcome</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.experiments.map((exp) => (
                <tr
                  key={exp.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{exp.name}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {exp.id}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{exp.surface}</td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {exp.primaryOutcome}
                  </td>
                  <td className="py-3 text-xs">{exp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Outcome reports
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Process-local exposure/conversion counters for this instance. Warehouse
          aggregates are required for production decisions. Underpowered arms
          never declare a winner.
        </p>
        <div className="mt-4 space-y-6">
          {snapshot.outcomeReports.map((report) => (
            <div
              key={report.experimentId}
              className="border-t border-[var(--color-border)] pt-4"
            >
              <p className="font-mono text-sm">{report.experimentId}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Status: {report.status}
                {report.declaredWinnerArmId
                  ? ` · winner ${report.declaredWinnerArmId}`
                  : " · no winner declared"}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                      <th className="py-2 pr-4 font-medium">Arm</th>
                      <th className="py-2 pr-4 font-medium">Exposures</th>
                      <th className="py-2 pr-4 font-medium">Conversions</th>
                      <th className="py-2 font-medium">Rate / CI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.arms.map((arm) => (
                      <tr
                        key={arm.armId}
                        className="border-b border-[var(--color-border)]/60"
                      >
                        <td className="py-2 pr-4 font-mono text-xs">
                          {arm.armId}
                        </td>
                        <td className="py-2 pr-4">{arm.exposures}</td>
                        <td className="py-2 pr-4">{arm.conversions}</td>
                        <td className="py-2 text-xs text-[var(--color-muted)]">
                          {arm.rate == null
                            ? "insufficient sample"
                            : `${(arm.rate * 100).toFixed(1)}%${
                                arm.interval
                                  ? ` [${(arm.interval.low * 100).toFixed(1)}–${(arm.interval.high * 100).toFixed(1)}%]`
                                  : ""
                              }`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Denylist examples
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.denylistExamples.map((ex) => (
            <li key={ex.category}>
              <span className="font-mono text-xs text-[var(--color-fg)]">
                {ex.category}
              </span>
              {" — "}
              {ex.example}. {ex.reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
