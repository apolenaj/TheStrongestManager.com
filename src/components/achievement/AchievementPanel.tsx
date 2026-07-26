import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { AchievementPageView } from "@/services/achievement";

export function AchievementPanel({ view }: { view: AchievementPageView }) {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meaningful milestones</CardTitle>
          <CardDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {view.honesty.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
        <p className="text-sm text-[var(--color-muted)]">
          Earned {view.earnedCount} of {view.totalCount} — progress from real
          training behavior only.
        </p>
      </Card>

      {view.cards.length === 0 ? (
        <EmptyState
          title="No achievements defined"
          description="The catalog stays intentionally small."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {view.cards.map((card) => {
            const earned = Boolean(card.earnedAt);
            return (
              <li key={card.definition.id}>
                <Card elevated className={earned ? undefined : "opacity-80"}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          earned ? card.definition.badgeVariant : "neutral"
                        }
                      >
                        {card.definition.badgeLabel}
                      </Badge>
                      <Badge variant="neutral">{card.pillarLabel}</Badge>
                      {earned ? (
                        <Badge variant="success">Earned</Badge>
                      ) : (
                        <Badge variant="neutral">Locked</Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2 font-[family-name:var(--font-display)] text-lg tracking-tight">
                      {card.definition.title}
                    </CardTitle>
                    <CardDescription>
                      {card.definition.description}
                    </CardDescription>
                  </CardHeader>
                  <p className="text-sm text-[var(--color-muted)]">
                    Reinforces: {card.definition.reinforces}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {card.evaluation.reason}
                    {card.earnedAt
                      ? ` · ${new Date(card.earnedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
