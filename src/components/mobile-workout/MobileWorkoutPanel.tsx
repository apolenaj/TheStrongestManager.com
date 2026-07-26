import type { MobileWorkoutSnapshot } from "@/domain/mobile-workout";

export function MobileWorkoutPanel({
  snapshot,
}: {
  snapshot: MobileWorkoutSnapshot;
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
            Auto-save
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.autoSaveMs} ms
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Min touch
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.minTouchPx}px
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Principles
        </h3>
        <ul className="mt-3 space-y-4 text-sm text-[var(--color-muted)]">
          {snapshot.principles.map((p) => (
            <li key={p.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {p.title}
              </span>
              <span className="mt-1 block text-xs">{p.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Load steps
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          kg ±{snapshot.loadStep.kg} · lb ±{snapshot.loadStep.lb} · Rest presets:{" "}
          {snapshot.restPresetsSec.join(" / ")}s
        </p>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Player: <code>{snapshot.playerRoute}</code>
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
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
