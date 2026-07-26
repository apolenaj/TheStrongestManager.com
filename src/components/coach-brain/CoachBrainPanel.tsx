"use client";

import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { CoachBrainRunResult } from "@/domain/coach-brain";
import { fromCoachBrainRecommendation } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

/**
 * Presentational only — renders structured Coach Brain outputs.
 * Never calls tools or recomputes recommendations in the browser.
 */
export function CoachBrainPanel({ result }: { result: CoachBrainRunResult }) {
  return (
    <div className="grid gap-4">
      <Card elevated>
        <CardHeader>
          <CardTitle>AI Coach Brain</CardTitle>
          <CardDescription>
            Structured recommendations from athlete data — not a chatbot.{" "}
            {result.engineVersion} · {result.adapterId}
            {result.rejected ? " · safety rejected this run" : null}
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">run {result.runId.slice(0, 8)}</Badge>
          {result.honesty.slice(0, 1).map((line) => (
            <p key={line} className="w-full text-xs text-[var(--color-muted)]">
              {line}
            </p>
          ))}
        </div>
      </Card>

      {result.recommendations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations</CardTitle>
            <CardDescription>
              {result.rejected
                ? "Safety validation blocked outputs. Nothing was auto-applied."
                : "No structured recommendations for this run."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        result.recommendations.map((rec) => (
          <Card key={rec.id} elevated>
            <CardHeader>
              <CardTitle>{rec.recommendation}</CardTitle>
              <CardDescription>{rec.reasoningSummary}</CardDescription>
            </CardHeader>
            <div className="mb-3 flex flex-wrap gap-2">
              <ConfidenceBadge confidence={rec.confidence} />
              <Badge variant="neutral">{rec.ruleId}</Badge>
              {rec.recommendedAction.requiresExplicitConfirmation ? (
                <Badge variant="warning">Needs your confirmation</Badge>
              ) : null}
            </div>
            <p className="text-sm font-medium text-[var(--color-fg)]">
              Action: {rec.recommendedAction.label}
              {rec.recommendedAction.href
                ? ` → ${rec.recommendedAction.href}`
                : ""}
            </p>
            <div className="mt-3">
              <WhyAmISeeingThis view={fromCoachBrainRecommendation(rec)} />
            </div>
            {rec.risks.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Risks: {rec.risks.join(" · ")}
              </p>
            ) : null}
            <AiTrustChrome
              relatedType="coach_brain"
              relatedId={`${result.runId}:${rec.id}`}
              correctHref={rec.recommendedAction.href ?? "/app/adaptations"}
              correctLabel="Review / confirm action"
            />
          </Card>
        ))
      )}
    </div>
  );
}
