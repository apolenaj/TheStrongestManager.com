import type { LiveAutoregSnapshot } from "@/domain/live-session-autoregulation";

export function LiveAutoregAdminPanel({
  snapshot,
}: {
  snapshot: LiveAutoregSnapshot;
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
            Significant Δ RPE
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            ≥ {snapshot.significantRpeDelta}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Auto-apply
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            Never
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Product example
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Planned {snapshot.example.plannedLoadKg} × {snapshot.example.plannedReps}{" "}
          @{snapshot.example.plannedRpe} → actual @{snapshot.example.actualRpe} →
          suggest {snapshot.example.expectedSuggestion} (confirm required).
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Forbidden
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.forbidden.map((id) => (
            <li key={id}>
              <code className="text-xs">{id}</code>
            </li>
          ))}
        </ul>
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
          Live in workout player · <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
