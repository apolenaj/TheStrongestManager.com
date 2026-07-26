import type { LiveCompetitionSnapshot } from "@/domain/live-competition-mode";

export function LiveCompetitionAdminPanel({
  snapshot,
}: {
  snapshot: LiveCompetitionSnapshot;
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
            Architecture
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.architectureEnabled ? "On" : "Off"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Meet-day runtime
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.liveRuntimeEnabled ? "On" : "Off"}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Capabilities
        </h3>
        <ul className="mt-3 space-y-3">
          {snapshot.capabilities.map((c) => (
            <li
              key={c.id}
              className="border-b border-[var(--color-border)]/60 pb-3 text-sm"
            >
              <p className="font-medium">{c.label}</p>
              <p className="mt-1 text-[var(--color-muted)]">{c.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Attempt results
        </h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.attemptResults.map((r) => (
            <li key={r.id}>
              {r.label} ({r.id})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Warm-up timing slots
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Clock windows only — never load prescriptions.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.warmupSlotKinds.map((s) => (
            <li key={s.id}>
              {s.label} ({s.id})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Safety refusals
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.safetyCopy.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
          {snapshot.safetyRefusals.map((id) => (
            <li key={id}>
              <code>{id}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Offline contract
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Storage key <code>{snapshot.offlineStorageKey}</code>. Mutations:{" "}
          {snapshot.offlineMutations.join(", ")}.
        </p>
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
          Runbook: <code>{snapshot.docPath}</code> · Prep:{" "}
          <code>{snapshot.relatedPrepDoc}</code>
        </p>
      </section>
    </div>
  );
}
