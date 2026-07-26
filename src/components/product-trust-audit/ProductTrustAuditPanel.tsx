import type { ProductTrustAuditSnapshot } from "@/domain/product-trust-audit";
import { PRODUCT_TRUST_CRITERIA } from "@/domain/product-trust-audit";

function statusLabel(s: string): string {
  if (s === "pass") return "Pass";
  if (s === "partial") return "Partial";
  return "Fail";
}

export function ProductTrustAuditPanel({
  snapshot,
}: {
  snapshot: ProductTrustAuditSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-4">
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
            Pass
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.pass}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Partial
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.partial}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Fail
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.fail}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Audit questions
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {PRODUCT_TRUST_CRITERIA.map((id) => (
            <li key={id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {id}
              </span>
              {" — "}
              {snapshot.criterionQuestions[id]}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Shared certainty line: {snapshot.certaintyDisclaimer}
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          AI features
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-3 font-medium">Feature</th>
                <th className="py-2 pr-3 font-medium">Overall</th>
                <th className="py-2 pr-3 font-medium">Prov</th>
                <th className="py-2 pr-3 font-medium">Conf</th>
                <th className="py-2 pr-3 font-medium">Cert</th>
                <th className="py-2 font-medium">Challenge</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.features.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-3">
                    <p className="font-medium">{f.title}</p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">
                      {f.surface}
                    </p>
                    {f.documentedGaps.length > 0 ? (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Gaps: {f.documentedGaps[0]}
                      </p>
                    ) : null}
                    {f.fixesApplied.length > 0 ? (
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Fix: {f.fixesApplied[0]}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3">{statusLabel(f.overall)}</td>
                  <td className="py-3 pr-3">
                    {statusLabel(f.criteria.provenance.status)}
                  </td>
                  <td className="py-3 pr-3">
                    {statusLabel(f.criteria.confidence.status)}
                  </td>
                  <td className="py-3 pr-3">
                    {statusLabel(f.criteria.certainty_risk.status)}
                  </td>
                  <td className="py-3">
                    {statusLabel(f.criteria.challenge.status)}
                  </td>
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
