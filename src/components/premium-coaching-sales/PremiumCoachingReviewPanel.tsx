"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge, Button } from "@/design-system";
import {
  PREMIUM_COACHING_STATUS_LABELS,
  nextPremiumCoachingStage,
} from "@/domain/premium-coaching-sales";
import type { PremiumCoachingApplicationView } from "@/services/premium-coaching-sales";
import { advancePremiumCoachingApplicationAction } from "@/services/premium-coaching-sales/actions";

export function PremiumCoachingReviewPanel({
  applications,
}: {
  applications: PremiumCoachingApplicationView[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4">
      {applications.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No applications in the funnel yet.
        </p>
      ) : (
        <ul className="grid gap-4">
          {applications.map((app) => {
            const next = nextPremiumCoachingStage(app.status);
            return (
              <li
                key={app.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 grid gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{app.statusLabel}</Badge>
                  <span className="text-sm text-[var(--color-muted)]">
                    {app.id.slice(-8)}
                  </span>
                </div>
                <p className="text-sm">
                  {app.goal} · {app.experienceLevel} · {app.budgetRange} ·{" "}
                  {app.availability}
                </p>
                <div className="flex flex-wrap gap-2">
                  {next ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("applicationId", app.id);
                        fd.set("toStatus", next);
                        startTransition(async () => {
                          await advancePremiumCoachingApplicationAction(fd);
                          router.refresh();
                        });
                      }}
                    >
                      Advance to{" "}
                      {PREMIUM_COACHING_STATUS_LABELS[next] ?? next}
                    </Button>
                  ) : null}
                  {(app.status === "applied" ||
                    app.status === "in_review" ||
                    app.status === "consultation" ||
                    app.status === "offer") && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("applicationId", app.id);
                        fd.set("toStatus", "declined");
                        startTransition(async () => {
                          await advancePremiumCoachingApplicationAction(fd);
                          router.refresh();
                        });
                      }}
                    >
                      Decline
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
