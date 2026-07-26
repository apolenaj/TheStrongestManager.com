import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import type { TechniqueReviewQueueItem } from "@/services/technique-review";

export function TechniqueExpertReviewQueue({
  items,
  honesty,
  error,
}: {
  items: TechniqueReviewQueueItem[];
  honesty: readonly string[];
  error?: string;
}) {
  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Optional expert review">
        {honesty[0]} {honesty[1]}
      </Alert>
      {error ? (
        <Alert tone="warning" title="Queue unavailable">
          {error}
        </Alert>
      ) : null}
      {items.length === 0 && !error ? (
        <p className="text-sm text-[var(--color-muted)]">
          No pending technique reviews. Athletes request review from their
          technique report.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {items.map((item) => (
            <li
              key={item.reviewId}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  {item.exerciseName ?? "Technique analysis"}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {item.athleteLabel}
                  {item.cameraAngle ? ` · ${item.cameraAngle}` : ""}
                  {item.aiOverallScore != null
                    ? ` · AI score ${item.aiOverallScore}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">pending</Badge>
                <Link
                  href={`/app/technique-review/${item.reviewId}`}
                  className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
                >
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
