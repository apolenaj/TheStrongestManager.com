import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { DailyCoachingBrief } from "@/domain/daily-brief";
import { fromDailyBriefInsight } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

/**
 * Central Today intelligence brief — presentational only.
 * Priorities are computed in getDailyCoachingBrief / buildDailyCoachingBrief.
 */
export function DailyCoachingBriefPanel({
  brief,
}: {
  brief: DailyCoachingBrief;
}) {
  return (
    <div className="grid gap-4">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{brief.headline}</Badge>
            <Badge variant="neutral">{brief.dateKey}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight sm:text-3xl">
            {brief.headline}
          </CardTitle>
          <CardDescription>
            High-value coaching for this day — not a full metrics dump.
          </CardDescription>
        </CardHeader>

        <dl className="grid gap-4">
          {brief.lines.map((line) => {
            const content = (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  {line.label}
                </dt>
                <dd className="mt-1 text-base text-[var(--color-fg)] sm:text-lg">
                  {line.body}
                </dd>
              </>
            );

            if (!line.href) {
              return <div key={`${line.kind}-${line.label}`}>{content}</div>;
            }

            return (
              <Link
                key={`${line.kind}-${line.label}`}
                href={line.href}
                className="-mx-2 block rounded-[var(--radius-md)] px-2 py-1 outline-offset-2 transition-colors hover:bg-[var(--color-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              >
                {content}
              </Link>
            );
          })}
        </dl>
      </Card>

      {brief.insights.length > 0 ? (
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Prioritized insights · {brief.insights.length} of max 3
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {brief.insights.map((insight) => {
              const header = (
                <CardHeader>
                  <div className="mb-1 flex flex-wrap gap-2">
                    <Badge variant="neutral">
                      {insight.kind.replaceAll("_", " ")}
                    </Badge>
                    <ConfidenceBadge
                      confidence={insight.confidence}
                      prefix={null}
                    />
                  </div>
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                  <CardDescription>{insight.body}</CardDescription>
                </CardHeader>
              );

              return (
                <Card key={insight.id} className="h-full">
                  {insight.href ? (
                    <Link
                      href={insight.href}
                      className="block rounded-[var(--radius-md)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      {header}
                    </Link>
                  ) : (
                    header
                  )}
                  <WhyAmISeeingThis
                    view={fromDailyBriefInsight(
                      insight,
                      brief.missingSignals,
                    )}
                  />
                  <AiTrustChrome
                    relatedType="daily_brief"
                    relatedId={insight.id}
                    correctHref={insight.href ?? "/app/recovery"}
                    correctLabel="Open related data to correct signals"
                  />
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {brief.missingSignals.length > 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          Missing for a richer brief: {brief.missingSignals.join("; ")}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/app/coach-brain" variant="secondary" size="sm">
          Ask AI Coach
        </ButtonLink>
        <ButtonLink href="/app/progress" variant="ghost" size="sm">
          Progress charts
        </ButtonLink>
      </div>
    </div>
  );
}
