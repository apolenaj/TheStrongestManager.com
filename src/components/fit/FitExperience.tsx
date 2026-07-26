"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
  Select,
} from "@/design-system";
import {
  FIT_DAYS,
  FIT_DISCLAIMERS,
  FIT_EQUIPMENT,
  FIT_EQUIPMENT_LABELS,
  FIT_EXPERIENCE,
  FIT_EXPERIENCE_LABELS,
  FIT_GOAL_LABELS,
  FIT_GOALS,
  FIT_PREFERENCE_LABELS,
  FIT_PREFERENCES,
  FIT_RECOVERY,
  FIT_RECOVERY_LABELS,
  FIT_SESSION,
  FIT_SESSION_LABELS,
  FIT_SPORT,
  FIT_SPORT_LABELS,
  buildSharePath,
  type FitApproachCard,
  type FitInputs,
  type FitRecommendationResult,
} from "@/domain/fit";

function ApproachResult({
  card,
}: {
  card: FitApproachCard;
}) {
  const isPrimary = card.rank === "primary";
  return (
    <article
      className={
        isPrimary
          ? "rounded-[var(--radius-md)] border border-[var(--color-accent)]/40 bg-[var(--color-surface)] p-5 sm:p-6"
          : "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isPrimary ? "accent" : "neutral"}>
          {isPrimary ? "Primary recommendation" : "Alternative"}
        </Badge>
      </div>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
        <Link
          href={card.methodPath}
          className="transition-colors hover:text-[var(--color-accent)]"
        >
          {card.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
        {card.summary}
      </p>

      <div className="mt-5 space-y-4">
        <section>
          <h4 className="text-sm font-medium text-[var(--color-foreground)]">
            Why it fits
          </h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--color-foreground)]">
            {card.whyItFits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-sm font-medium text-[var(--color-foreground)]">
            Tradeoffs
          </h4>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
            {card.tradeoffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="text-sm font-medium text-[var(--color-foreground)]">
            Example structure
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]">
            {card.exampleStructure}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Illustrative coaching example — not a personalized program prescription.
          </p>
        </section>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={card.methodPath} variant="secondary" size="md">
          Method details
        </ButtonLink>
      </div>
    </article>
  );
}

export function FitExperience({
  initialInputs,
  initialResult,
  hasQuery,
}: {
  initialInputs: FitInputs;
  initialResult: FitRecommendationResult | null;
  hasQuery: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [inputs, setInputs] = useState<FitInputs>(initialInputs);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (hasQuery) return initialResult;
    return null;
  }, [hasQuery, initialResult]);

  function setField<K extends keyof FitInputs>(key: K, value: FitInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function applyRecommend() {
    startTransition(() => {
      router.push(buildSharePath(inputs));
    });
  }

  async function copyShareLink() {
    if (!result?.sharePath) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${result.sharePath}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={pending ? "space-y-8 opacity-70" : "space-y-8"}>
      <Alert tone="info" title="Not one perfect method">
        {FIT_DISCLAIMERS[0]} Results include a primary approach and an
        alternative — with why it fits, tradeoffs, and example structure —
        driven by transparent rules.
      </Alert>

      <section className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Your context
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Answer honestly — recommendations change with the URL so you can share
            or revisit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fit-goal">Goal</Label>
            <Select
              id="fit-goal"
              className="min-h-12"
              value={inputs.goal}
              onChange={(e) => setField("goal", e.target.value as FitInputs["goal"])}
            >
              {FIT_GOALS.map((g) => (
                <option key={g} value={g}>
                  {FIT_GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-experience">Experience</Label>
            <Select
              id="fit-experience"
              className="min-h-12"
              value={inputs.experience}
              onChange={(e) =>
                setField("experience", e.target.value as FitInputs["experience"])
              }
            >
              {FIT_EXPERIENCE.map((g) => (
                <option key={g} value={g}>
                  {FIT_EXPERIENCE_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-days">Schedule (days / week)</Label>
            <Select
              id="fit-days"
              className="min-h-12"
              value={inputs.days}
              onChange={(e) => setField("days", e.target.value as FitInputs["days"])}
            >
              {FIT_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-session">Session length</Label>
            <Select
              id="fit-session"
              className="min-h-12"
              value={inputs.session}
              onChange={(e) =>
                setField("session", e.target.value as FitInputs["session"])
              }
            >
              {FIT_SESSION.map((s) => (
                <option key={s} value={s}>
                  {FIT_SESSION_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-recovery">Recovery capacity</Label>
            <Select
              id="fit-recovery"
              className="min-h-12"
              value={inputs.recovery}
              onChange={(e) =>
                setField("recovery", e.target.value as FitInputs["recovery"])
              }
            >
              {FIT_RECOVERY.map((r) => (
                <option key={r} value={r}>
                  {FIT_RECOVERY_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-equipment">Equipment</Label>
            <Select
              id="fit-equipment"
              className="min-h-12"
              value={inputs.equipment}
              onChange={(e) =>
                setField("equipment", e.target.value as FitInputs["equipment"])
              }
            >
              {FIT_EQUIPMENT.map((eq) => (
                <option key={eq} value={eq}>
                  {FIT_EQUIPMENT_LABELS[eq]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-sport">Sport</Label>
            <Select
              id="fit-sport"
              className="min-h-12"
              value={inputs.sport}
              onChange={(e) => setField("sport", e.target.value as FitInputs["sport"])}
            >
              {FIT_SPORT.map((s) => (
                <option key={s} value={s}>
                  {FIT_SPORT_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fit-preference">Preferences</Label>
            <Select
              id="fit-preference"
              className="min-h-12"
              value={inputs.preference}
              onChange={(e) =>
                setField("preference", e.target.value as FitInputs["preference"])
              }
            >
              {FIT_PREFERENCES.map((p) => (
                <option key={p} value={p}>
                  {FIT_PREFERENCE_LABELS[p]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="button" variant="primary" size="md" onClick={applyRecommend}>
            See what fits
          </Button>
          {result?.sharePath ? (
            <Button type="button" variant="secondary" size="md" onClick={copyShareLink}>
              {copied ? "Link copied" : "Copy share link"}
            </Button>
          ) : null}
        </div>
      </section>

      {result ? (
        <div className="space-y-6">
          {result.emptyReason || !result.primary ? (
            <Alert tone="warning" title="No clear match">
              {result.emptyReason ??
                "Try adjusting inputs. You can also browse methods directly."}
            </Alert>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                <ApproachResult card={result.primary} />
                {result.alternative ? (
                  <ApproachResult card={result.alternative} />
                ) : (
                  <Alert tone="info" title="No distinct alternative">
                    Rules pointed strongly at one approach. Compare related methods
                    from the primary detail page.
                  </Alert>
                )}
              </div>

              {result.primary && result.alternative ? (
                <p>
                  <Link
                    href={`/compare?methods=${result.primary.slug},${result.alternative.slug}`}
                    className="text-[var(--color-accent)]"
                  >
                    Compare primary vs alternative →
                  </Link>
                </p>
              ) : null}

              <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-4 sm:p-5">
                <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
                  Rules that applied
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Recommendations come from these transparent coaching rules — not a
                  black-box score.
                </p>
                <ul className="mt-4 space-y-3">
                  {result.matchedRules.map((rule) => (
                    <li key={rule.id} className="border-t border-[var(--color-border)] pt-3">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {rule.label}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {rule.description}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-[var(--color-muted)]">
                  {FIT_DISCLAIMERS[1]}
                </p>
              </section>
            </>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          Submit the form to generate a primary recommendation and an alternative.
        </p>
      )}
    </div>
  );
}
