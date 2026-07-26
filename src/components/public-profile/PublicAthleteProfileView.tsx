import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { AssembledPublicProfile } from "@/domain/public-profile";

export function PublicAthleteProfileView({
  profile,
}: {
  profile: AssembledPublicProfile;
}) {
  const title = profile.displayName?.trim() || "Athlete";

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
          TheStrongestManager
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--color-fg)] sm:text-5xl">
          {title}
        </h1>
        {profile.sport ? (
          <Badge variant="info" className="w-fit capitalize">
            {profile.sport}
          </Badge>
        ) : null}
        {profile.bio ? (
          <p className="max-w-xl text-[var(--color-muted)]">{profile.bio}</p>
        ) : null}
      </header>

      {profile.trainingStreakDays != null ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training streak</CardTitle>
            <CardDescription>
              {profile.trainingStreakDays} day
              {profile.trainingStreakDays === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {profile.prs && profile.prs.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            PRs
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {profile.prs.map((pr) => (
              <li
                key={pr.liftLabel}
                className="rounded-md border border-[var(--color-border)] px-4 py-3"
              >
                <p className="text-sm text-[var(--color-muted)]">{pr.liftLabel}</p>
                <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                  {pr.loadKg} kg
                  {pr.reps != null && pr.reps > 1 ? ` × ${pr.reps}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.competitions && profile.competitions.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Competition history
          </h2>
          <ul className="grid gap-2">
            {profile.competitions.map((c, i) => (
              <li
                key={`${c.date}-${i}`}
                className="border-l-2 border-[var(--color-border)] pl-3 text-sm"
              >
                <span className="font-medium text-[var(--color-fg)]">
                  {c.name?.trim() || c.sport}
                </span>
                <span className="text-[var(--color-muted)]">
                  {" · "}
                  {new Date(c.date).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                  {c.weightClassLabel ? ` · ${c.weightClassLabel}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.achievements && profile.achievements.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Public achievements
          </h2>
          <ul className="grid gap-2">
            {profile.achievements.map((a, i) => (
              <li
                key={`${a.at}-${i}`}
                className="rounded-md border border-[var(--color-border)] px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.1em] text-[var(--color-accent)]">
                  {a.title}
                </p>
                <p className="text-lg font-semibold tracking-tight">{a.headline}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.techniqueHighlights && profile.techniqueHighlights.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Technique highlights
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {profile.techniqueHighlights.map((t) => (
              <li
                key={t.exerciseLabel}
                className="rounded-md border border-[var(--color-border)] px-4 py-3"
              >
                <p className="text-sm text-[var(--color-muted)]">
                  {t.exerciseLabel}
                </p>
                <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
                  {t.score}/100
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {profile.bodyMetrics && profile.bodyMetrics.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Body metrics
          </h2>
          <ul className="grid gap-2">
            {profile.bodyMetrics.map((b) => (
              <li key={b.label} className="text-sm text-[var(--color-muted)]">
                {b.label}: {b.value} {b.unit}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-[var(--color-muted)]">
        Not shown on this profile: {profile.hiddenByPrivacy.join(" · ")}.
      </p>
    </div>
  );
}
