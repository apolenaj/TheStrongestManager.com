import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { PersonalizationPlan } from "@/domain/personalization";
import { fromPersonalizationItem } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

export function PersonalizationEnginePanel({
  plan,
}: {
  plan: PersonalizationPlan;
}) {
  return (
    <div className="grid gap-6">
      <Alert tone="info" title="Central personalization">
        {plan.honesty[0]} {plan.honesty[2]}
      </Alert>

      <Alert tone="success" title="Pricing guard">
        Pricing personalization:{" "}
        {plan.pricingPersonalization.allowed ? "allowed" : "blocked"}.{" "}
        {plan.pricingPersonalization.reason}
      </Alert>

      {plan.ignoredSensitiveKeys.length > 0 ? (
        <Alert tone="warning" title="Sensitive inputs ignored">
          Ignored keys: {plan.ignoredSensitiveKeys.join(", ")}. These never
          affect ranking or pricing.
        </Alert>
      ) : null}

      {plan.summaryLine ? (
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug">
          {plan.summaryLine}
        </p>
      ) : (
        <Alert tone="warning" title="Not enough signal yet">
          Add a goal, sport, and training history so surfaces can be ranked.
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">Last {plan.lookbackDays} days</Badge>
        <Badge variant="info">Engine {plan.engineVersion}</Badge>
      </div>

      <ul className="grid gap-4">
        {plan.surfaces.map((slot) => (
          <li key={slot.surface}>
            <Card>
              <CardHeader>
                <CardTitle>{slot.label}</CardTitle>
                <CardDescription>
                  {slot.items.length} personalized item
                  {slot.items.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <div className="grid gap-3 px-6 pb-6 text-sm">
                {slot.missingNote ? (
                  <p className="text-xs text-[var(--color-score-needs-attention)]">
                    {slot.missingNote}
                  </p>
                ) : null}
                {slot.items.length === 0 ? (
                  <p className="text-[var(--color-muted)]">Nothing ranked yet.</p>
                ) : (
                  <ul className="grid gap-3">
                    {slot.items.map((item) => (
                      <li key={item.id} className="grid gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
                            >
                              {item.title}
                            </Link>
                          ) : (
                            <span className="font-medium">{item.title}</span>
                          )}
                          <Badge variant="neutral">
                            priority {item.priority}
                          </Badge>
                          <Badge variant="neutral">{item.confidence}</Badge>
                        </div>
                        <p className="text-[var(--color-muted)]">{item.body}</p>
                        <WhyAmISeeingThis
                          view={fromPersonalizationItem({
                            drivenBy: item.drivenBy,
                            confidence: item.confidence,
                            missingNote: slot.missingNote,
                          })}
                        />
                        <AiTrustChrome correctHref="/app/settings" correctLabel="Update preferences / onboarding signals" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[var(--color-muted)]">
        {plan.honesty.slice(1).join(" ")}
      </p>
    </div>
  );
}
