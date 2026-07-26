import type { SafetySystemSnapshot } from "@/domain/safety-system";

export function SafetySystemPanel({
  snapshot,
}: {
  snapshot: SafetySystemSnapshot;
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
            Rules
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.rules.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Audit suite
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.audit.passed
              ? `Pass (${snapshot.audit.total})`
              : `Fail (${snapshot.audit.failures.length})`}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Central rules (block or modify)
        </h3>
        <ul className="mt-3 space-y-4 text-sm text-[var(--color-muted)]">
          {snapshot.rules.map((rule) => (
            <li key={rule.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {rule.title}
              </span>
              <span className="ml-2 font-mono text-[10px]">
                default {rule.defaultAction}
              </span>
              <span className="mt-1 block text-xs">{rule.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Product thresholds (heuristics, not clinical)
        </h3>
        <dl className="mt-3 grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-2">
          <div>
            Sessions/week soft → hard:{" "}
            {snapshot.thresholds.maxSessionsPerWeekSoft} →{" "}
            {snapshot.thresholds.maxSessionsPerWeekHard}
          </div>
          <div>
            Hard sets/lift soft → hard:{" "}
            {snapshot.thresholds.maxHardSetsPerLiftSoft} →{" "}
            {snapshot.thresholds.maxHardSetsPerLiftHard}
          </div>
          <div>
            Weekly hard sets soft → hard:{" "}
            {snapshot.thresholds.maxWeeklyHardSetsSoft} →{" "}
            {snapshot.thresholds.maxWeeklyHardSetsHard}
          </div>
          <div>
            Weight loss kg/week soft → hard:{" "}
            {snapshot.thresholds.maxWeightLossKgPerWeekSoft} →{" "}
            {snapshot.thresholds.maxWeightLossKgPerWeekHard}
          </div>
        </dl>
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
