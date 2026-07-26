"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { ChallengeCardView, ChallengePageView } from "@/services/challenge";
import {
  abandonChallengeAction,
  challengeLeaderboardOptInAction,
  enrollChallengeAction,
  type ChallengeActionState,
} from "@/services/challenge/actions";

const initial: ChallengeActionState = { ok: false };

function EnrollForm({ card }: { card: ChallengeCardView }) {
  const [state, action, pending] = useActionState(
    enrollChallengeAction,
    initial,
  );

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="challengeId" value={card.definition.id} />
      {card.definition.leaderboardEnabled ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="leaderboardOptIn"
            className="mt-1 accent-[var(--color-accent)]"
          />
          <span>
            Opt into optional leaderboard
            <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
              Off by default. Progress only — not max-load ranking.
            </span>
          </span>
        </label>
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          No leaderboard for this challenge.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Joining…" : "Join challenge"}
      </Button>
      {state.error ? (
        <p className="text-sm text-[var(--color-score-critical)]">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-[var(--color-score-excellent)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function ActiveActions({ card }: { card: ChallengeCardView }) {
  const [leaveState, leaveAction, leavePending] = useActionState(
    abandonChallengeAction,
    initial,
  );
  const [lbState, lbAction, lbPending] = useActionState(
    challengeLeaderboardOptInAction,
    initial,
  );

  return (
    <div className="grid gap-3">
      {card.definition.leaderboardEnabled ? (
        <form action={lbAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="challengeId" value={card.definition.id} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="leaderboardOptIn"
              defaultChecked={card.enrollment?.leaderboardOptIn}
              className="accent-[var(--color-accent)]"
            />
            Appear on optional leaderboard
          </label>
          <Button type="submit" variant="secondary" disabled={lbPending}>
            Save
          </Button>
          {lbState.error ? (
            <p className="w-full text-sm text-[var(--color-score-critical)]">
              {lbState.error}
            </p>
          ) : null}
        </form>
      ) : null}

      {card.enrollment?.status !== "completed" ? (
        <form action={leaveAction}>
          <input type="hidden" name="challengeId" value={card.definition.id} />
          <Button type="submit" variant="ghost" disabled={leavePending}>
            Leave challenge
          </Button>
          {leaveState.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {leaveState.error}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function ChallengeCard({ card }: { card: ChallengeCardView }) {
  const enrolled = card.enrollment && card.enrollment.status !== "abandoned";

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{card.pillarLabel}</Badge>
          {card.definition.leaderboardEnabled ? (
            <Badge variant="neutral">Optional leaderboard</Badge>
          ) : (
            <Badge variant="neutral">No leaderboard</Badge>
          )}
          {card.completionBadge && card.enrollment?.badgeAwardedAt ? (
            <Badge variant={card.completionBadge.variant}>
              {card.completionBadge.label}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
          {card.definition.title}
        </CardTitle>
        <CardDescription>{card.definition.description}</CardDescription>
      </CardHeader>

      {enrolled && card.progress ? (
        <div className="mb-4 grid gap-2 text-sm">
          <p className="text-[var(--color-muted)]">{card.progress.detail}</p>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-elevated)]"
            role="progressbar"
            aria-valuenow={card.progress.percentTowardTarget}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[var(--color-accent)]"
              style={{ width: `${card.progress.percentTowardTarget}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            Status: {card.enrollment?.status}
            {card.progress.completed ? " · Complete" : ""}
          </p>
        </div>
      ) : null}

      {card.leaderboard && card.leaderboard.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Optional leaderboard
          </p>
          <ol className="grid gap-1 text-sm text-[var(--color-muted)]">
            {card.leaderboard.slice(0, 10).map((row, i) => (
              <li key={row.athleteProfileId}>
                {i + 1}. {row.displayLabel} — {row.progressValue}
                {row.completed ? " ✓" : ""}
              </li>
            ))}
          </ol>
        </div>
      ) : card.definition.leaderboardEnabled && enrolled ? (
        <p className="mb-4 text-xs text-[var(--color-muted)]">
          Leaderboard empty until athletes opt in with real progress.
        </p>
      ) : null}

      {enrolled ? <ActiveActions card={card} /> : <EnrollForm card={card} />}
    </Card>
  );
}

export function ChallengeEnginePanel({ view }: { view: ChallengePageView }) {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How challenges work</CardTitle>
          <CardDescription>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {view.honesty.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </CardDescription>
        </CardHeader>
      </Card>

      {view.earnedBadges.length > 0 ? (
        <div>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold">
            Completion badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {view.earnedBadges.map((b) => (
              <Badge key={b.id} variant={b.variant} title={b.description}>
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {view.challenges.length === 0 ? (
        <EmptyState
          title="No challenges available"
          description="Safe community challenges will appear here."
        />
      ) : (
        <ul className="grid gap-4">
          {view.challenges.map((card) => (
            <li key={card.definition.id}>
              <ChallengeCard card={card} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
