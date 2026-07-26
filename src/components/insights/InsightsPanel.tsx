import Link from "next/link";
import {
  Alert,
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  INSIGHT_DOMAIN_LABELS,
  type InsightProposal,
} from "@/domain/insights";
import type { InsightsDashboardView } from "@/services/insights/insights-service";
import { AthleteAiFeedbackControls } from "@/components/ai/AthleteAiFeedbackControls";
import { fromInsightProposal } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

function InsightCard({ insight }: { insight: InsightProposal }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <ConfidenceBadge confidence={insight.confidence} />
          {insight.domains.map((d) => (
            <Badge key={d} variant="neutral">
              {INSIGHT_DOMAIN_LABELS[d]}
            </Badge>
          ))}
        </div>
        <CardTitle>{insight.title}</CardTitle>
        <CardDescription>{insight.summary}</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-1 pb-1">
        <WhyAmISeeingThis view={fromInsightProposal(insight)} />
        <section>
          <h3 className="text-sm font-medium text-[var(--color-foreground)]">
            Action
          </h3>
          <p className="mt-2">
            <ButtonLink href={insight.action.href} variant="secondary" size="md">
              {insight.action.label}
            </ButtonLink>
          </p>
        </section>
        {insight.nutritionPrescriptionNote ? (
          <Alert tone="warning" title="Nutrition prescription limit">
            {insight.nutritionPrescriptionNote}
          </Alert>
        ) : null}
        <AthleteAiFeedbackControls
          relatedType="insight"
          relatedId={insight.id}
        />
      </div>
    </Card>
  );
}

export function InsightsPanel({ view }: { view: InsightsDashboardView }) {
  const insights = view.engine.insights;

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Cross-domain insights">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      {insights.length === 0 ? (
        <EmptyState
          title="No insights right now"
          description="Keep logging training, recovery, and body metrics. Insights appear when patterns cross domains."
          action={<ButtonLink href="/app/today">Go to Today</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-5">
          {insights.map((insight) => (
            <li key={insight.id}>
              <InsightCard insight={insight} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        Engine {view.engine.engineVersion}. {view.honesty[2]}{" "}
        <Link href="/app/nutrition" className="text-[var(--color-accent)]">
          Nutrition status
        </Link>
        {" · "}
        <Link href="/app/recovery" className="text-[var(--color-accent)]">
          Recovery
        </Link>
        {" · "}
        <Link href="/app/progress" className="text-[var(--color-accent)]">
          Progress
        </Link>
      </p>
    </div>
  );
}

/** Compact dashboard teaser for the top insight. */
export function InsightTeaser({ insight }: { insight: InsightProposal }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">Cross-domain</Badge>
          <ConfidenceBadge confidence={insight.confidence} />
        </div>
        <CardTitle className="text-lg">{insight.title}</CardTitle>
        <CardDescription>{insight.summary}</CardDescription>
      </CardHeader>
      <div className="space-y-4 px-1 pb-1">
        <WhyAmISeeingThis view={fromInsightProposal(insight)} />
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={insight.action.href} variant="primary" size="md">
            {insight.action.label}
          </ButtonLink>
          <ButtonLink href="/app/insights" variant="secondary" size="md">
            All insights
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
