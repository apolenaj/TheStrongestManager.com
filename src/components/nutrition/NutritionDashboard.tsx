import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { NutritionDashboardView } from "@/services/nutrition/nutrition-service";
import type { RecoveryNutritionDeepLinkPrompt } from "@/domain/mealnexio-deep-linking";
import { MealnexioRecoveryNutritionCta } from "@/components/mealnexio-deep-linking/MealnexioRecoveryNutritionCta";

function TargetsEmpty() {
  return (
    <p className="text-sm leading-relaxed text-[var(--color-muted)]">
      Daily targets will appear here after a secure Mealnexio sync returns them.
      No calorie or macro targets are invented on this page.
    </p>
  );
}

export function NutritionDashboard({
  view,
  deepLinkPrompt = null,
}: {
  view: NutritionDashboardView;
  deepLinkPrompt?: RecoveryNutritionDeepLinkPrompt | null;
}) {
  return (
    <div className="space-y-8">
      <Alert tone="info" title="Never fake synced nutrition">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      {deepLinkPrompt ? (
        <MealnexioRecoveryNutritionCta prompt={deepLinkPrompt} />
      ) : null}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nutrition status</CardTitle>
            <CardDescription>
              The Strongest ↔ {view.provider.label} provider status.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3 px-1 pb-1">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  view.provider.status === "connected" ? "accent" : "neutral"
                }
              >
                {view.provider.statusLabel}
              </Badge>
              <Badge variant="info">{view.provider.label}</Badge>
              {!view.syncFeatureEnabled ? (
                <Badge variant="warning">Sync flag off</Badge>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-muted)]">
              {view.provider.note}
            </p>
            {view.connection.lastSyncAt ? (
              <p className="text-xs text-[var(--color-muted)]">
                Last sync: {new Date(view.connection.lastSyncAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">
                No successful sync on record.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily targets</CardTitle>
            <CardDescription>
              Provider targets only — empty until real sync data exists.
            </CardDescription>
          </CardHeader>
          <div className="space-y-3 px-1 pb-1">
            {view.dailyTargets ? (
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted)]">Calories</dt>
                  <dd className="tabular-nums text-[var(--color-foreground)]">
                    {view.dailyTargets.caloriesKcal != null
                      ? `${view.dailyTargets.caloriesKcal} kcal`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted)]">Protein</dt>
                  <dd className="tabular-nums">
                    {view.dailyTargets.macros?.proteinG != null
                      ? `${view.dailyTargets.macros.proteinG} g`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted)]">Carbs</dt>
                  <dd className="tabular-nums">
                    {view.dailyTargets.macros?.carbsG != null
                      ? `${view.dailyTargets.macros.carbsG} g`
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--color-muted)]">Fat</dt>
                  <dd className="tabular-nums">
                    {view.dailyTargets.macros?.fatG != null
                      ? `${view.dailyTargets.macros.fatG} g`
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <TargetsEmpty />
            )}
          </div>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Mealnexio</CardTitle>
          <CardDescription>{view.mealnexio.ctaHint}</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap items-center gap-3 px-1 pb-1">
          <a
            href={view.mealnexio.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 text-sm font-medium text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {view.mealnexio.ctaLabel}
          </a>
          <ButtonLink href="/app/profile" variant="secondary" size="md">
            Profile bodyweight
          </ButtonLink>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local context</CardTitle>
            <CardDescription>{view.honesty[2]}</CardDescription>
          </CardHeader>
          <div className="px-1 pb-1">
            {view.localBodyweight ? (
              <p className="text-sm text-[var(--color-foreground)]">
                <span className="font-display text-3xl tabular-nums">
                  {view.localBodyweight.kg}
                </span>{" "}
                kg
                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  {view.localBodyweight.sourceLabel}
                </span>
              </p>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                No bodyweight logged on your profile yet. Add it under Profile —
                it will not be labeled as Mealnexio data.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planned shared data</CardTitle>
            <CardDescription>
              Future sync kinds when a real Mealnexio API adapter is registered.
            </CardDescription>
          </CardHeader>
          <ul className="flex flex-wrap gap-2 px-1 pb-1">
            {view.plannedSharedData.map((item) => (
              <li key={item.id}>
                <Badge variant="neutral">{item.label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {view.dailySummary ? (
        <Card>
          <CardHeader>
            <CardTitle>Today’s synced intake</CardTitle>
            <CardDescription>
              Shown only when the provider returned a real summary.
            </CardDescription>
          </CardHeader>
          <p className="px-1 pb-1 text-sm text-[var(--color-muted)]">
            Synced at {new Date(view.dailySummary.syncedAt).toLocaleString()}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
