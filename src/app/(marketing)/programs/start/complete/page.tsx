import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserProgramWeekOne } from "@/services/program-catalog/start-free-program";
import type { ProgramWeekPrescription } from "@/types/programs";

export const metadata: Metadata = {
  title: "Week 1 ready",
  robots: { index: false, follow: false },
};

type CompletePageProps = {
  searchParams: Promise<{ id?: string }>;
};

function asWeek(value: unknown): ProgramWeekPrescription | null {
  if (!value || typeof value !== "object") return null;
  const week = value as ProgramWeekPrescription;
  if (typeof week.week !== "number" || !Array.isArray(week.days)) return null;
  return week;
}

export default async function StartFreeProgramCompletePage({
  searchParams,
}: CompletePageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/programs/find-my-program");
  }

  const params = await searchParams;
  const id = params.id?.trim();
  if (!id) {
    redirect("/programs/find-my-program");
  }

  const row = await getUserProgramWeekOne({
    userId: session.user.id,
    userProgramId: id,
  });
  if (!row) {
    redirect("/programs/find-my-program");
  }

  const week = asWeek(row.firstWeekJson);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Free program started
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        Week 1 is ready
      </h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {row.programVersion.product.name} · {row.scheduleVariant} ·{" "}
        {row.unitSystem}
        {row.competitionDate
          ? ` · test date ${row.competitionDate.toISOString().slice(0, 10)}`
          : ""}
      </p>

      {week ? (
        <ol className="mt-10 space-y-4">
          {week.days.map((day) => (
            <li
              key={String(day.day)}
              className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
            >
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                {day.label ?? `Day ${day.day}`}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                {day.exercises.map((ex) => (
                  <li key={`${day.day}-${ex.exerciseId}`}>
                    <span className="text-[var(--color-foreground)]">
                      {ex.name ?? ex.exerciseId}
                    </span>
                    {" — "}
                    {ex.sets.length}×{ex.sets[0]?.reps ?? "?"}
                    {ex.sets[0]?.weight != null
                      ? ` @ ${ex.sets[0].weight}${row.unitSystem}`
                      : ex.sets[0]?.percentOfTm != null
                        ? ` @ ${ex.sets[0].percentOfTm}% TM`
                        : ""}
                    {ex.sets[0]?.rpe != null ? ` @ RPE ${ex.sets[0].rpe}` : ""}
                  </li>
                ))}
              </ul>
              {day.notes ? (
                <p className="mt-3 text-xs text-[var(--color-subtle)]">{day.notes}</p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 text-sm text-[var(--color-muted)]">
          Week 1 was saved on your program record.
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/app"
          className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
        >
          Go to app
        </Link>
        <Link
          href="/programs"
          className="inline-flex min-h-12 items-center justify-center border border-[var(--color-border)] px-5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
