import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { TrendChart } from "@/components/progress/TrendChart";
import { RecoveryCheckIn } from "@/components/recovery/RecoveryCheckIn";
import { MealnexioRecoveryNutritionCta } from "@/components/mealnexio-deep-linking/MealnexioRecoveryNutritionCta";
import type { RecoveryDashboardView } from "@/services/recovery/recovery-service";
import type { RecoveryNutritionDeepLinkPrompt } from "@/domain/mealnexio-deep-linking";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

export function RecoveryDashboard({
  view,
  mealnexioPrompt = null,
}: {
  view: RecoveryDashboardView;
  mealnexioPrompt?: RecoveryNutritionDeepLinkPrompt | null;
}) {
  return (
    <div className="space-y-10">
      <Alert tone="info" title="Not medical accuracy">
        Recovery Readiness is an estimate from your check-in. It is not a
        diagnosis, sleep study, or clearance to train.
      </Alert>

      {mealnexioPrompt ? (
        <MealnexioRecoveryNutritionCta prompt={mealnexioPrompt} />
      ) : null}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>
              Optional daily input — tap scales or skip.
            </CardDescription>
          </CardHeader>
          <RecoveryCheckIn todayEntry={view.todayEntry} />
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Readiness estimate</CardTitle>
              <CardDescription>
                Built only from signals you logged.
              </CardDescription>
            </CardHeader>
            {view.latestEstimate?.score != null ? (
              <div className="space-y-3">
                <p className="font-display text-5xl tabular-nums text-[var(--color-foreground)]">
                  {view.latestEstimate.score}
                  <span className="text-lg text-[var(--color-subtle)]">
                    /100
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <ConfidenceBadge
                    confidence={view.latestEstimate.confidence}
                  />
                  {!view.latestEstimate.sleepIncluded ? (
                    <Badge variant="warning">Sleep excluded</Badge>
                  ) : (
                    <Badge variant="neutral">Sleep included</Badge>
                  )}
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {view.latestEstimate.explanation}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                No estimate yet. Save a check-in with at least one signal.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Potential issues</CardTitle>
              <CardDescription>
                Conservative flags from your latest check-in — not diagnoses.
              </CardDescription>
            </CardHeader>
            <ul className="space-y-3">
              {view.potentialIssues.map((issue) => (
                <li key={issue.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={issue.severity === "watch" ? "warning" : "neutral"}
                    >
                      {issue.severity}
                    </Badge>
                    <span className="font-medium text-[var(--color-foreground)]">
                      {issue.title}
                    </span>
                  </div>
                  <p className="mt-1 text-[var(--color-muted)]">{issue.detail}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-foreground)]">
          Trend
        </h2>
        <TrendChart series={view.readinessTrend} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-foreground)]">
          Training relationship
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>{view.trainingRelationship.title}</CardTitle>
          </CardHeader>
          <p className="text-sm text-[var(--color-muted)]">
            {view.trainingRelationship.detail}
          </p>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-[var(--color-foreground)]">
          Wearables
        </h2>
        <Alert tone="info" title={view.wearable.label}>
          Status: {view.wearable.status}. {view.wearable.note}
        </Alert>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Honesty notes
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {view.disclaimers.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
