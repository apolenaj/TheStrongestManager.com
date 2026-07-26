"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert, Badge, Button } from "@/design-system";
import { reviewCreatorPartnershipAction } from "@/services/creator-program/actions";

export function CreatorReviewPanel({
  applications,
}: {
  applications: Array<{
    id: string;
    displayName: string;
    handle: string | null;
    status: string;
    statusLabel: string;
    roleLabel: string;
    appliedAt: string;
  }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Approval required">
        Do not treat applicants as creator partners until status is approved.
        Capabilities unlock only after approval.
      </Alert>

      {applications.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No creator applications yet.
        </p>
      ) : (
        <ul className="grid gap-3">
          {applications.map((app) => (
            <li
              key={app.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{app.displayName}</span>
                  <Badge variant="neutral">{app.roleLabel}</Badge>
                  <Badge
                    variant={app.status === "approved" ? "success" : "accent"}
                  >
                    {app.statusLabel}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {app.handle ? `@${app.handle} · ` : null}
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.status !== "approved" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      startTransition(async () => {
                        await reviewCreatorPartnershipAction(fd);
                        router.refresh();
                      });
                    }}
                  >
                    <input type="hidden" name="partnershipId" value={app.id} />
                    <input type="hidden" name="toStatus" value="approved" />
                    <Button type="submit" size="sm" loading={pending}>
                      Approve
                    </Button>
                  </form>
                ) : null}
                {app.status === "pending" || app.status === "approved" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      startTransition(async () => {
                        await reviewCreatorPartnershipAction(fd);
                        router.refresh();
                      });
                    }}
                  >
                    <input type="hidden" name="partnershipId" value={app.id} />
                    <input
                      type="hidden"
                      name="toStatus"
                      value={
                        app.status === "approved" ? "suspended" : "rejected"
                      }
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      loading={pending}
                    >
                      {app.status === "approved" ? "Suspend" : "Reject"}
                    </Button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
