import { Alert, Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import { buildTechniqueEvalDashboardSnapshot } from "@/domain/technique-eval";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminTechniqueEvalPage() {
  await requireAdmin();
  const snap = buildTechniqueEvalDashboardSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Technique model evaluation
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Internal offline benchmarks for landmark quality, phase detection,
          metric consistency, and camera-angle robustness. Engine{" "}
          <code className="text-xs">{snap.engineVersion}</code>.
        </p>
      </div>

      <Alert tone="warning" title="No public accuracy claims">
        {snap.publicAccuracyClaim} {snap.honesty[0]} {snap.honesty[1]}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Suite</CardTitle>
            <CardDescription>
              <Badge variant={snap.suitePassed ? "success" : "danger"}>
                {snap.suitePassed ? "passing" : "failing"}
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Synthetic cases</CardTitle>
            <CardDescription>{snap.syntheticCaseCount}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Human-labeled cases</CardTitle>
            <CardDescription>
              {snap.humanLabeledCaseCount === 0
                ? "0 — rates are not publishable"
                : snap.humanLabeledCaseCount}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Quality metrics
        </h3>
        <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {snap.metricRows.map((row) => (
            <li key={row.id} className="space-y-1 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{row.label}</span>
                <Badge variant="neutral">n={row.sampleCount}</Badge>
              </div>
              <p className="text-[var(--color-muted)]">{row.internalRateText}</p>
              <p className="text-xs text-[var(--color-muted)]">
                Public: {row.publicClaimText}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Dataset cases
        </h3>
        <ul className="space-y-3">
          {snap.caseRows.map((row) => (
            <li
              key={row.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    <code>{row.id}</code> · {row.cameraAngle} ·{" "}
                    {row.datasetKind}
                  </p>
                </div>
                <Badge variant={row.passed ? "success" : "danger"}>
                  {row.passed ? "pass" : "fail"}
                </Badge>
              </div>
              <ul className="mt-2 list-inside list-disc text-xs text-[var(--color-muted)]">
                {row.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Test dataset architecture
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          {snap.datasetArchitecture.note}
        </p>
        <ul className="list-inside list-disc text-sm text-[var(--color-muted)]">
          {snap.datasetArchitecture.caseShape.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
