import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/AppPage";
import { FreeProgramConversionPrompts } from "@/components/catalog-workout/FreeProgramConversionPrompts";
import { requireSession } from "@/services/auth/session";
import { getCatalogProgramsDashboard } from "@/services/catalog-workout";
import { prisma } from "@/lib/db";
import type { ProgramWeekPrescription } from "@/types/programs";

export const metadata: Metadata = {
  title: "Active program",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ userProgramId: string }>;
};

function asWeek(value: unknown): ProgramWeekPrescription | null {
  if (!value || typeof value !== "object") return null;
  const week = value as ProgramWeekPrescription;
  if (typeof week.week !== "number" || !Array.isArray(week.days)) return null;
  return week;
}

export default async function ActiveCatalogProgramPage({ params }: PageProps) {
  const session = await requireSession();
  const { userProgramId } = await params;

  const run = await prisma.userProgram.findFirst({
    where: { id: userProgramId, userId: session.user.id },
    include: {
      workoutSessions: {
        select: { weekNumber: true, dayKey: true, status: true },
      },
      programVersion: {
        select: { product: { select: { name: true, durationWeeks: true } } },
      },
      tmAdjustments: {
        where: { status: "pending" },
        select: { id: true, liftKey: true, fromTm: true, toTm: true, reason: true },
      },
    },
  });

  if (!run) notFound();

  const dashboard = await getCatalogProgramsDashboard(session.user.id);
  const active =
    dashboard.active?.userProgramId === run.id ? dashboard.active : null;
  const week = asWeek(run.firstWeekJson);
  const completed = new Set(
    run.workoutSessions
      .filter(
        (s) => s.weekNumber === run.currentWeek && s.status === "completed",
      )
      .map((s) => s.dayKey),
  );

  return (
    <AppPage
      eyebrow="Active program"
      title={run.programVersion.product.name}
      description={`Week ${run.currentWeek} · ${run.scheduleVariant} · ${run.unitSystem}`}
      actions={
        <Link
          href="/app/programs"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          My Programs
        </Link>
      }
    >
      <div className="space-y-8">
        {active ? (
          <p className="text-sm text-[var(--color-muted)]">
            Block: {active.currentBlock} · Week completion{" "}
            {active.completionPercent}%
          </p>
        ) : null}

        {active?.isFree ? <FreeProgramConversionPrompts active={active} /> : null}

        {run.tmAdjustments.length > 0 ? (
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-sm text-[var(--color-muted)]">
            {run.tmAdjustments.length} pending training-max suggestion
            {run.tmAdjustments.length === 1 ? "" : "s"} — open a workout day to
            approve or dismiss.
          </div>
        ) : null}

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            This week
          </h2>
          {!week ? (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No week prescription on file.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              {week.days.map((day) => {
                const key = String(day.day);
                const done = completed.has(key);
                return (
                  <li
                    key={key}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {day.label ?? `Day ${day.day}`}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {done ? "Completed" : "Not completed"}
                      </p>
                    </div>
                    <Link
                      href={`/app/programs/active/${run.id}/day/${encodeURIComponent(key)}`}
                      className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
                    >
                      {done ? "Review" : "Train"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppPage>
  );
}
