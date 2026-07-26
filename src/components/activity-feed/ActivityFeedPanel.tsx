import { ButtonLink, EmptyState } from "@/design-system";
import {
  ACTIVITY_FEED_KIND_LABELS,
  type ActivityFeedView,
} from "@/domain/activity-feed";
import { ActivityFeedVisibilityForm } from "@/components/activity-feed/ActivityFeedVisibilityForm";

export function ActivityFeedPanel({ view }: { view: ActivityFeedView }) {
  return (
    <div className="space-y-10">
      <ActivityFeedVisibilityForm prefs={view.visibility} />

      <section className="space-y-4">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg">
            Your milestones
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Chronological, finite list — no likes, no comments, no endless
            scroll. Empty means nothing matches your filters yet.
          </p>
        </div>

        {!view.visibility.feedEnabled ? (
          <EmptyState
            title="Feed paused"
            description="Turn on “Show activity feed” above to list opted-in milestones."
          />
        ) : view.items.length === 0 ? (
          <EmptyState
            title="No milestones yet"
            description="Log PRs, finish a competition prep, earn an achievement, or share a technique card — then they can appear here."
          />
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {view.items.map((item) => (
              <li key={item.id} className="py-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {ACTIVITY_FEED_KIND_LABELS[item.kind]}
                </p>
                <p className="mt-1 font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {item.summary}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {new Date(item.occurredAt).toLocaleString("en-US")}
                </p>
                {item.href ? (
                  <p className="mt-2">
                    <ButtonLink href={item.href} variant="secondary">
                      Open
                    </ButtonLink>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {view.endOfFeed && view.items.length > 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            End of feed
            {view.capped
              ? ` — showing ${view.items.length} of ${view.totalBeforeCap} (capped; not an infinite scroll).`
              : "."}{" "}
            No engagement scores are attached.
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {view.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
