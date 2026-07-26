import type { ExerciseComparisonSnapshot } from "@/domain/exercise-comparison";

export function ExerciseComparisonPanel({
  snapshot,
}: {
  snapshot: ExerciseComparisonSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            Profiled
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.profiledExercises}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            SEO pairs
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.seoPairs.length}
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
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Dimensions
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.dimensions.map((d) => (
            <li key={d.id}>
              <span className="text-[var(--color-fg)]">{d.label}</span>
              {" — "}
              {d.description}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          SEO allowlisted pairs
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Pair</th>
                <th className="py-2 font-medium">Path</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.seoPairs.map((p) => (
                <tr
                  key={p.slug}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{p.title}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {p.exerciseA} vs {p.exerciseB}
                    </p>
                  </td>
                  <td className="py-3 font-mono text-xs">
                    /compare/exercises/{p.slug}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Profiled exercises
        </h3>
        <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
          {snapshot.profiles.map((p) => p.slug).join(", ")}
        </p>
      </section>
    </div>
  );
}
