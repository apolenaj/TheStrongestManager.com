"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
  Select,
} from "@/design-system";
import {
  ATHLETE_ASSESSMENT_EXPERIENCE,
  ATHLETE_ASSESSMENT_FREQUENCY,
  ATHLETE_ASSESSMENT_FUNNEL_STEPS,
  ATHLETE_ASSESSMENT_GOALS,
  ATHLETE_ASSESSMENT_LOGGING,
  ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
  ATHLETE_ASSESSMENT_PRIVACY_COPY,
  ATHLETE_ASSESSMENT_RECOVERY,
  ATHLETE_ASSESSMENT_SELF_LABEL,
  ATHLETE_ASSESSMENT_SIGNUP_HREF,
  ATHLETE_ASSESSMENT_SPORTS,
  buildPartialAthleteProfile,
  isCompleteAthleteAssessmentAnswers,
  type AthleteAssessmentAnswers,
  type PartialAthleteProfile,
} from "@/domain/athlete-assessment";

const defaultAnswers: Partial<AthleteAssessmentAnswers> = {
  goal: "strength",
  experience: "intermediate",
  sport: "general_strength",
  frequency: "3",
  recovery: "mixed",
  logging: "no",
};

export function AthleteAssessmentFunnel() {
  const [answers, setAnswers] =
    useState<Partial<AthleteAssessmentAnswers>>(defaultAnswers);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [profile, setProfile] = useState<PartialAthleteProfile | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function setField<K extends keyof AthleteAssessmentAnswers>(
    key: K,
    value: AthleteAssessmentAnswers[K],
  ) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setProfile(null);
  }

  async function claimTicket() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/athlete-assessment/claim", {
        method: "POST",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        token?: string;
        privacy?: string;
      };
      if (!res.ok || !json.ok || !json.token) {
        throw new Error(json.error ?? "Could not claim assessment.");
      }
      setTicket(json.token);
      setNote(
        json.privacy ??
          "Ticket claimed. Answers stay in your browser for the partial profile.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setPending(false);
    }
  }

  function runAssessment() {
    setError(null);
    setProfile(null);
    if (!ticket) {
      setError("Claim an assessment ticket first (rate-limited).");
      return;
    }
    if (!isCompleteAthleteAssessmentAnswers(answers)) {
      setError("Answer all limited questions first.");
      return;
    }
    const next = buildPartialAthleteProfile(answers);
    setProfile(next);
    setNote(
      "Partial profile ready — Self-assessment estimate. Not full Athlete Score.",
    );
    try {
      sessionStorage.setItem(
        "ts_athlete_assessment_summary",
        JSON.stringify({
          at: Date.now(),
          goal: answers.goal,
          experience: answers.experience,
          scoreShown: false,
        }),
      );
    } catch {
      // optional
    }
  }

  return (
    <div className="space-y-10">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ATHLETE_ASSESSMENT_FUNNEL_STEPS.map((step, i) => (
          <li
            key={step.id}
            className="border-t border-[var(--color-border)] pt-3"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Step {i + 1}
            </p>
            <p className="mt-1 text-sm font-medium">{step.label}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{step.detail}</p>
          </li>
        ))}
      </ol>

      <Alert tone="info" title="Privacy">
        {ATHLETE_ASSESSMENT_PRIVACY_COPY}
      </Alert>

      <section className="max-w-2xl space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          1. Limited questions
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Self-reported only. Results are a{" "}
          <strong>{ATHLETE_ASSESSMENT_SELF_LABEL}</strong> —{" "}
          <strong>{ATHLETE_ASSESSMENT_NOT_FULL_LABEL}</strong>.
        </p>

        {(
          [
            {
              id: "goal",
              label: "Primary goal",
              options: ATHLETE_ASSESSMENT_GOALS,
              value: answers.goal,
            },
            {
              id: "experience",
              label: "Experience",
              options: ATHLETE_ASSESSMENT_EXPERIENCE,
              value: answers.experience,
            },
            {
              id: "sport",
              label: "Sport focus",
              options: ATHLETE_ASSESSMENT_SPORTS,
              value: answers.sport,
            },
            {
              id: "frequency",
              label: "Training frequency",
              options: ATHLETE_ASSESSMENT_FREQUENCY,
              value: answers.frequency,
            },
            {
              id: "recovery",
              label: "Recovery feel",
              options: ATHLETE_ASSESSMENT_RECOVERY,
              value: answers.recovery,
            },
            {
              id: "logging",
              label: "Do you log sessions today?",
              options: ATHLETE_ASSESSMENT_LOGGING,
              value: answers.logging,
            },
          ] as const
        ).map((field) => (
          <div key={field.id}>
            <Label htmlFor={`aa-${field.id}`}>{field.label}</Label>
            <Select
              id={`aa-${field.id}`}
              className="mt-1 min-h-12"
              value={field.value ?? ""}
              onChange={(e) =>
                setField(
                  field.id,
                  e.target.value as AthleteAssessmentAnswers[typeof field.id],
                )
              }
            >
              {field.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </section>

      <section className="max-w-2xl space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          2. Claim &amp; build partial profile
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void claimTicket()}
            loading={pending}
            disabled={pending}
          >
            Claim assessment
          </Button>
          <Button
            type="button"
            onClick={runAssessment}
            disabled={pending || !ticket}
          >
            Show partial profile
          </Button>
        </div>
        {ticket ? (
          <p className="text-xs text-[var(--color-muted)]">
            Ticket ready · rate-limited · answers not uploaded
          </p>
        ) : null}
        {note ? (
          <p className="text-sm text-[var(--color-muted)]">{note}</p>
        ) : null}
      </section>

      {error ? (
        <Alert tone="warning" title="Could not complete">
          {error}
        </Alert>
      ) : null}

      {profile ? (
        <section className="max-w-3xl space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{profile.labels.selfAssessment}</Badge>
            <Badge variant="neutral">{profile.labels.notFullScore}</Badge>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              {profile.headline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {profile.summary}
            </p>
          </div>

          <Alert tone="warning" title={ATHLETE_ASSESSMENT_NOT_FULL_LABEL}>
            {profile.athleteScore.reason}
          </Alert>

          <div>
            <h3 className="text-sm font-medium">Reported profile</h3>
            <dl className="mt-3 space-y-3">
              {profile.fields.map((f) => (
                <div
                  key={f.key}
                  className="border-t border-[var(--color-border)] pt-3"
                >
                  <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    {f.label}
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{f.value}</span>
                    <Badge variant="neutral">{f.estimateLabel}</Badge>
                    <Badge variant="neutral">{f.source}</Badge>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-medium">What this suggests next</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
              {profile.focusHints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">
              Unlock the real Athlete Score
            </h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Overall needs: {profile.overallUnlock.needs}
            </p>
            <ul className="mt-3 space-y-3">
              {profile.pillarUnlocks.map((p) => (
                <li
                  key={p.pillar}
                  className="border-t border-[var(--color-border)] pt-3 text-sm"
                >
                  <p className="font-medium">{p.label}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Status: missing logged data (not scored from this form)
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-[var(--color-muted)]">
                    {p.needs.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium">Locked until you log data</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {profile.lockedSections.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={ATHLETE_ASSESSMENT_SIGNUP_HREF} size="lg">
              Create account for real data-driven score
            </ButtonLink>
            <ButtonLink href="/app/dashboard" variant="secondary" size="lg">
              I already have an account
            </ButtonLink>
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            {profile.honestyNote}
          </p>
        </section>
      ) : null}
    </div>
  );
}
