import type { RedTeamAiCoachSnapshot } from "@/domain/red-team-ai-coach";

export function RedTeamAiCoachPanel({
  snapshot,
}: {
  snapshot: RedTeamAiCoachSnapshot;
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
            Suite
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.suite.passed
              ? `Pass ${snapshot.suite.passedCount}/${snapshot.suite.total}`
              : `Fail ${snapshot.suite.failedCount}/${snapshot.suite.total}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Categories
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.categories.length}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Documented pre-fix failures
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Adversarial probe before the safety_refusal gate. Status must stay
          fixed while the live suite is green.
        </p>
        <ul className="mt-3 space-y-3 text-sm text-[var(--color-muted)]">
          {snapshot.documentedPreFixFailures.map((f) => (
            <li key={f.attackId}>
              <span className="font-medium text-[var(--color-foreground)]">
                {f.attackId}
              </span>
              <span className="ml-2 font-mono text-[10px]">{f.status}</span>
              <span className="mt-1 block text-xs italic">{f.prompt}</span>
              <span className="mt-1 block text-xs">{f.observedPreFix}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Live attack results
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Attack</th>
                <th className="py-2 pr-4 font-medium">Result</th>
                <th className="py-2 font-medium">Intent</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.suite.results.map((r) => (
                <tr
                  key={r.attackId}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{r.attackId}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {r.prompt}
                    </p>
                    {!r.passed ? (
                      <p className="mt-1 text-xs text-red-700">
                        {r.failures.join("; ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {r.passed ? "Pass" : "Fail"}
                  </td>
                  <td className="py-3 font-mono text-xs">{r.intent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
