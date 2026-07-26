import type { YearInReviewSnapshot } from "@/domain/year-in-review";
import { Badge } from "@/design-system";

export function YearInReviewAdminPanel({
  snapshot,
}: {
  snapshot: YearInReviewSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl>
        <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
          Engine
        </dt>
        <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
          {snapshot.engineVersion}
        </dd>
      </dl>
      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Cards
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {snapshot.cardKinds.map((k) => (
            <Badge key={k} variant="neutral">
              {k}
            </Badge>
          ))}
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
          <code>/app/year-in-review</code> · <code>/share/year/[token]</code> ·{" "}
          <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
