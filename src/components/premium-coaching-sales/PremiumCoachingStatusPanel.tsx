import Link from "next/link";
import { Alert, Badge, Button } from "@/design-system";
import {
  PREMIUM_COACHING_AVAILABILITY_LABELS,
  PREMIUM_COACHING_BUDGET_LABELS,
  PREMIUM_COACHING_EXPERIENCE_LABELS,
  PREMIUM_COACHING_GOAL_LABELS,
  PREMIUM_COACHING_STAGE_LABELS,
  isPremiumCoachingAvailability,
  isPremiumCoachingBudgetRange,
  isPremiumCoachingExperience,
  isPremiumCoachingGoal,
  isPremiumCoachingStage,
} from "@/domain/premium-coaching-sales";
import type { PremiumCoachingApplicationView } from "@/services/premium-coaching-sales";
import { withdrawPremiumCoachingApplicationAction } from "@/services/premium-coaching-sales/actions";

export function PremiumCoachingStatusPanel({
  applications,
  honesty,
}: {
  applications: PremiumCoachingApplicationView[];
  honesty: readonly string[];
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Application status">
        {honesty[0]}
      </Alert>

      {applications.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No applications yet.{" "}
          <Link
            href="/coaching/premium/apply"
            className="underline underline-offset-2"
          >
            Apply here
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-4">
          {applications.map((app) => (
            <li
              key={app.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 grid gap-3"
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{app.statusLabel}</Badge>
                <span className="text-sm text-[var(--color-muted)]">
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </span>
              </div>

              <FunnelProgress status={app.status} steps={app.funnelSteps} />

              <dl className="grid gap-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--color-muted)]">Goal</dt>
                  <dd>
                    {isPremiumCoachingGoal(app.goal)
                      ? PREMIUM_COACHING_GOAL_LABELS[app.goal]
                      : app.goal}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Experience</dt>
                  <dd>
                    {isPremiumCoachingExperience(app.experienceLevel)
                      ? PREMIUM_COACHING_EXPERIENCE_LABELS[app.experienceLevel]
                      : app.experienceLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Budget range</dt>
                  <dd>
                    {isPremiumCoachingBudgetRange(app.budgetRange)
                      ? PREMIUM_COACHING_BUDGET_LABELS[app.budgetRange]
                      : app.budgetRange}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-muted)]">Availability</dt>
                  <dd>
                    {isPremiumCoachingAvailability(app.availability)
                      ? PREMIUM_COACHING_AVAILABILITY_LABELS[app.availability]
                      : app.availability}
                  </dd>
                </div>
              </dl>

              {(app.status === "applied" ||
                app.status === "in_review" ||
                app.status === "consultation" ||
                app.status === "offer") && (
                <form action={withdrawPremiumCoachingApplicationAction}>
                  <input type="hidden" name="applicationId" value={app.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Withdraw application
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FunnelProgress({
  status,
  steps,
}: {
  status: string;
  steps: readonly string[];
}) {
  const idx = steps.indexOf(status);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((step, i) => {
        const label = isPremiumCoachingStage(step)
          ? PREMIUM_COACHING_STAGE_LABELS[step]
          : step;
        const done = idx >= 0 && i <= idx;
        return (
          <li key={step}>
            <Badge variant={done ? "success" : "neutral"}>{label}</Badge>
          </li>
        );
      })}
    </ol>
  );
}
