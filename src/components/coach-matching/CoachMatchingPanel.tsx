import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  MATCH_COACHING_STYLES,
  MATCH_EXPERIENCE_LEVELS,
  MATCH_GOALS,
  MATCH_GOAL_LABELS,
  MATCH_SPORTS,
  MATCH_SPORT_LABELS,
  MATCH_EXPERIENCE_LABELS,
  MATCH_STYLE_LABELS,
} from "@/domain/coach-matching";
import type { CoachMatchPageView } from "@/services/coach-matching";

function MatchCard({
  displayName,
  slug,
  score,
  explanation,
  reasons,
  sponsoredLabel,
}: {
  displayName: string;
  slug: string;
  score: number;
  explanation: string;
  reasons: Array<{ factor: string; detail: string }>;
  sponsoredLabel: string | null;
}) {
  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">Fit {score}</Badge>
          {sponsoredLabel ? (
            <Badge variant="warning">{sponsoredLabel}</Badge>
          ) : null}
        </div>
        <CardTitle className="mt-2 text-xl">
          <Link
            href={`/coaching/${slug}`}
            className="hover:text-[var(--color-accent)]"
          >
            {displayName}
          </Link>
        </CardTitle>
        <CardDescription>Why matched</CardDescription>
      </CardHeader>
      <p className="text-sm text-[var(--color-muted)]">{explanation}</p>
      {reasons.length > 0 ? (
        <ul className="mt-3 grid gap-1 text-sm">
          {reasons.map((r) => (
            <li key={`${r.factor}-${r.detail}`}>
              <span className="font-medium text-[var(--color-foreground)]">
                {r.factor}:
              </span>{" "}
              <span className="text-[var(--color-muted)]">{r.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}

export function CoachMatchingPanel({
  view,
  submitted,
}: {
  view: CoachMatchPageView;
  submitted: boolean;
}) {
  const prefs = view.preferences;

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Organic matching">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <Card elevated>
        <CardHeader>
          <CardTitle>Your preferences</CardTitle>
          <CardDescription>
            Goal, sport, experience, budget, language, location/timezone, and
            coaching style.
          </CardDescription>
        </CardHeader>
        <form method="get" className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Goal</span>
            <select
              name="goal"
              defaultValue={prefs?.goal ?? "strength"}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              {MATCH_GOALS.map((g) => (
                <option key={g} value={g}>
                  {MATCH_GOAL_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Sport</span>
            <select
              name="sport"
              defaultValue={prefs?.sport ?? "powerlifting"}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              {MATCH_SPORTS.map((s) => (
                <option key={s} value={s}>
                  {MATCH_SPORT_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Experience</span>
            <select
              name="experience"
              defaultValue={prefs?.experience ?? "intermediate"}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              {MATCH_EXPERIENCE_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {MATCH_EXPERIENCE_LABELS[e]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Budget max</span>
            <input
              name="budgetMax"
              type="number"
              min="0"
              defaultValue={prefs?.budgetMax ?? ""}
              placeholder="e.g. 200"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Language</span>
            <input
              name="language"
              defaultValue={prefs?.language ?? "en"}
              placeholder="en"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Location / timezone</span>
            <input
              name="locationOrTimezone"
              defaultValue={prefs?.locationOrTimezone ?? ""}
              placeholder="Europe/Berlin or city"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-[var(--color-muted)]">
              Preferred coaching style
            </span>
            <select
              name="coachingStyle"
              defaultValue={prefs?.coachingStyle ?? "technique_focused"}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              {MATCH_COACHING_STYLES.map((s) => (
                <option key={s} value={s}>
                  {MATCH_STYLE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm text-[var(--color-accent-foreground)]"
            >
              Find matching coaches
            </button>
          </div>
        </form>
      </Card>

      {!submitted ? (
        <EmptyState
          title="Set your preferences"
          description="Submit the form to see top organic matches with explanations."
        />
      ) : view.empty ? (
        <EmptyState
          title="No matching coaches"
          description="No published coaches fit these inputs. We never invent listings."
        />
      ) : (
        <div className="grid gap-8">
          <section className="grid gap-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Top matches
            </h2>
            <ul className="grid gap-4">
              {view.organic.map((m) => (
                <li key={m.coach.id}>
                  <MatchCard
                    displayName={m.coach.displayName}
                    slug={m.coach.slug}
                    score={m.organicScore}
                    explanation={m.explanation}
                    reasons={m.reasons}
                    sponsoredLabel={null}
                  />
                </li>
              ))}
            </ul>
          </section>

          {view.sponsored.length > 0 ? (
            <section className="grid gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                Sponsored
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                Explicitly labeled sponsored placements — not used to rank the
                organic list above.
              </p>
              <ul className="grid gap-4">
                {view.sponsored.map((m) => (
                  <li key={`s-${m.coach.id}`}>
                    <MatchCard
                      displayName={m.coach.displayName}
                      slug={m.coach.slug}
                      score={m.organicScore}
                      explanation={m.explanation}
                      reasons={m.reasons}
                      sponsoredLabel={m.sponsoredLabel}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
